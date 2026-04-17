package backend.service;

import backend.entity.Notification;
import backend.entity.Ticket;
import backend.entity.Ticket.TicketStatus;
import backend.entity.Ticket.TicketPriority;
import backend.entity.User;
import backend.repository.NotificationRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

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
     * Create a new ticket (incident/maintenance request)
     */
    public Ticket createTicket(Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);

        // 🔔 Send notification to reporter
        Notification notif = new Notification(
                "✅ Your ticket \"" + ticket.getTitle() + "\" has been created with ID #" + savedTicket.getId(),
                "TICKET_CREATED",
                getUserIdByEmail(ticket.getReportedByEmail())
        );
        notif.setTicketId(savedTicket.getId());
        Notification savedNotif = notificationRepository.save(notif);
        messagingTemplate.convertAndSend("/topic/notifications", savedNotif);

        System.out.println("✅ Ticket created: " + savedTicket.getId() + " - " + ticket.getTitle());
        return savedTicket;
    }

    /**
     * Get all tickets assigned to a technician
     */
    public List<Ticket> getMyTickets(String technicianEmail) {
        return ticketRepository.findByAssignedToEmail(technicianEmail);
    }

    /**
     * Get all tickets reported by a user
     */
    public List<Ticket> getReportedTickets(String userEmail) {
        return ticketRepository.findByReportedByEmail(userEmail);
    }

    /**
     * Get all tickets (admin view)
     */
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /**
     * Assign ticket to technician
     */
    public Ticket assignTicket(Long ticketId, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedToEmail(technicianEmail);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket updated = ticketRepository.save(ticket);

        // 🔔 Notify technician
        Notification notif = new Notification(
                "🔧 You have been assigned ticket \"" + ticket.getTitle() + "\" (Priority: " + ticket.getPriority() + ")",
                "TICKET_ASSIGNED",
                getUserIdByEmail(technicianEmail)
        );
        notif.setTicketId(ticketId);
        Notification savedNotif = notificationRepository.save(notif);
        messagingTemplate.convertAndSend("/topic/notifications", savedNotif);

        // 🔔 Notify reporter
        Notification reporterNotif = new Notification(
                "👨‍🔧 A technician has been assigned to your ticket #" + ticketId,
                "TICKET_ASSIGNED",
                getUserIdByEmail(ticket.getReportedByEmail())
        );
        reporterNotif.setTicketId(ticketId);
        Notification savedReporterNotif = notificationRepository.save(reporterNotif);
        messagingTemplate.convertAndSend("/topic/notifications", savedReporterNotif);

        System.out.println("🔧 Ticket #" + ticketId + " assigned to " + technicianEmail);
        return updated;
    }

    /**
     * Update ticket status (TECHNICIAN updates progress)
     */
    public Ticket updateTicketStatus(Long ticketId, TicketStatus newStatus, String resolution) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);

        if (resolution != null) {
            ticket.setResolution(resolution);
        }

        Ticket updated = ticketRepository.save(ticket);

        // 🔔 Notify reporter of status change
        String notifMessage = "";
        String notifType = "TICKET_UPDATED";

        switch (newStatus) {
            case IN_PROGRESS:
                notifMessage = "🔧 Your ticket #" + ticketId + " is now being worked on";
                break;
            case RESOLVED:
                notifMessage = "✅ Your ticket #" + ticketId + " has been resolved!";
                notifType = "TICKET_RESOLVED";
                break;
            case CLOSED:
                notifMessage = "🚪 Your ticket #" + ticketId + " is closed";
                notifType = "TICKET_CLOSED";
                break;
            default:
                notifMessage = "📢 Your ticket #" + ticketId + " status changed to " + newStatus;
        }

        Notification notif = new Notification(notifMessage, notifType, getUserIdByEmail(ticket.getReportedByEmail()));
        notif.setTicketId(ticketId);
        Notification savedNotif = notificationRepository.save(notif);
        messagingTemplate.convertAndSend("/topic/notifications", savedNotif);

        System.out.println("🔄 Ticket #" + ticketId + " status: " + oldStatus + " → " + newStatus);
        return updated;
    }

    /**
     * Delete ticket (admin only)
     */
    public void deleteTicket(Long ticketId) {
        ticketRepository.deleteById(ticketId);
        System.out.println("🗑️  Ticket #" + ticketId + " deleted");
    }

    /**
     * Helper to get user ID by email
     */
    private Long getUserIdByEmail(String email) {
        try {
            User user = userRepository.findByEmail(email);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
