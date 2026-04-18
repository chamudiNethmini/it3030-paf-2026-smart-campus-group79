package backend.service;

import backend.entity.Notification;
import backend.entity.Ticket;
import backend.entity.Ticket.TicketStatus;
import backend.entity.User;
import backend.repository.NotificationRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * TicketService - Member 3
 * Handles ticket CRUD and notifies users of ticket status updates
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

    /**
     * Create a new ticket and notify the reporter
     */
    @Transactional
    public Ticket createTicket(Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);

        // 🔔 Send notification to reporter
        Long userId = getUserIdByEmail(ticket.getReportedByEmail());
        if (userId != null) {
            Notification notif = new Notification(
                    "✅ Your ticket \"" + ticket.getTitle() + "\" has been created with ID #" + savedTicket.getId(),
                    "TICKET_CREATED",
                    userId
            );
            notif.setTicketId(savedTicket.getId());
            Notification savedNotif = notificationRepository.save(notif);
            sendUserNotification(savedNotif);
        }

        System.out.println("✅ Ticket created: " + savedTicket.getId() + " - " + ticket.getTitle());
        return savedTicket;
    }

    public List<Ticket> getMyTickets(String technicianEmail) {
        return ticketRepository.findByAssignedToEmail(technicianEmail);
    }

    public List<Ticket> getReportedTickets(String userEmail) {
        return ticketRepository.findByReportedByEmail(userEmail);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /**
     * Assign ticket to technician and notify both parties
     */
    @Transactional
    public Ticket assignTicket(Long ticketId, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedToEmail(technicianEmail);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket updated = ticketRepository.save(ticket);

        // 🔔 Notify technician
        Long techId = getUserIdByEmail(technicianEmail);
        if (techId != null) {
            Notification techNotif = new Notification(
                    "🔧 You have been assigned ticket \"" + ticket.getTitle() + "\" (Priority: " + ticket.getPriority() + ")",
                    "TICKET_ASSIGNED",
                    techId
            );
            techNotif.setTicketId(ticketId);
            sendUserNotification(notificationRepository.save(techNotif));
        }

        // 🔔 Notify reporter
        Long reporterId = getUserIdByEmail(ticket.getReportedByEmail());
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
     * Update ticket status and notify reporter
     */
    @Transactional
    public Ticket updateTicketStatus(Long ticketId, String statusStr, String resolution) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid ticket status: " + statusStr);
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);

        if (resolution != null && !resolution.isBlank()) {
            ticket.setResolution(resolution);
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

        Long reporterId = getUserIdByEmail(ticket.getReportedByEmail());
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