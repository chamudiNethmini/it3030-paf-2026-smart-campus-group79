package backend.service;

import backend.entity.Notification;
import backend.entity.User;
import backend.model.Ticket;
import backend.repository.NotificationRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * TicketService - handles assignment/status + notifications.
 */
@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Ticket> getMyTickets(String technicianEmail) {
        return ticketRepository.findByAssignedToOrderByIdDesc(technicianEmail);
    }

    public List<Ticket> getReportedTickets(String userEmail) {
        return ticketRepository.findByCreatedByOrderByIdDesc(userEmail);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /**
     * Assign ticket to technician and notify reporter.
     */
    @Transactional
    public Ticket assignTicket(Long ticketId, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedTo(technicianEmail);
        ticket.setStatus(Ticket.Status.IN_PROGRESS);
        Ticket updated = ticketRepository.save(ticket);

        Long reporterId = getUserIdByEmail(ticket.getCreatedBy());
        if (reporterId != null) {
            Notification reporterNotif = new Notification(
                    "👨‍🔧 A technician has been assigned to your ticket #" + ticketId,
                    "TICKET_ASSIGNED",
                    reporterId
            );
            reporterNotif.setTicketId(ticketId);
            sendUserNotification(notificationRepository.save(reporterNotif));
        }

        System.out.println("🔧 Ticket #" + ticketId + " assigned to " + technicianEmail);
        return updated;
    }

    /**
     * Update ticket status and notify reporter.
     */
    @Transactional
    public Ticket updateTicketStatus(Long ticketId, String statusStr, String resolution) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Ticket.Status newStatus;
        try {
            newStatus = Ticket.Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid ticket status: " + statusStr);
        }

        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);

        if (resolution != null && !resolution.isBlank()) {
            ticket.setResolutionNotes(resolution);
        }

        Ticket updated = ticketRepository.save(ticket);

        // 🔔 Notify reporter of status change
        String notifMessage;
        String notifType = "TICKET_UPDATED";

        switch (newStatus) {
            case IN_PROGRESS -> notifMessage = "🔧 Your ticket #" + ticketId + " is now being worked on";
            case RESOLVED -> {
                notifMessage = "✅ Your ticket #" + ticketId + " has been resolved!";
                notifType = "TICKET_RESOLVED";
            }
            case CLOSED -> {
                notifMessage = "🚪 Your ticket #" + ticketId + " is closed";
                notifType = "TICKET_CLOSED";
            }
            default -> notifMessage = "📢 Your ticket #" + ticketId + " status changed to " + newStatus;
        }

        Long reporterId = getUserIdByEmail(ticket.getCreatedBy());
        if (reporterId != null) {
            Notification notif = new Notification(notifMessage, notifType, reporterId);
            notif.setTicketId(ticketId);
            sendUserNotification(notificationRepository.save(notif));
        }

        System.out.println("🔄 Ticket #" + ticketId + " status: " + oldStatus + " → " + newStatus);
        return updated;
    }

    @Transactional
    public void deleteTicket(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found");
        }
        ticketRepository.deleteById(ticketId);
        System.out.println("🗑️ Ticket #" + ticketId + " deleted");
    }

    private Long getUserIdByEmail(String email) {
        if (email == null) return null;
        User user = userRepository.findByEmail(email);
        return user != null ? user.getId() : null;
    }

    private void sendUserNotification(Notification notification) {
        if (notification != null && notification.getUserId() != null) {
            messagingTemplate.convertAndSend("/topic/notifications/" + notification.getUserId(), notification);
        }
    }
}