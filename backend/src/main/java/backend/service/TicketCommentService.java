package backend.service;

import backend.entity.Notification;
import backend.entity.TicketComment;
import backend.entity.User;
import backend.model.Ticket;
import backend.repository.NotificationRepository;
import backend.repository.TicketCommentRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TicketCommentService(
            TicketCommentRepository ticketCommentRepository,
            TicketRepository ticketRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<TicketComment> getCommentsByTicketId(Long ticketId) {
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment addComment(Long ticketId, String commenterEmail, String message) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setCommenterEmail(commenterEmail);
        comment.setMessage(message);
        TicketComment savedComment = ticketCommentRepository.save(comment);

        notifyTicketParties(ticket, commenterEmail, message);
        return savedComment;
    }

    public TicketComment updateComment(Long ticketId, Long commentId, String actorEmail, String message) {
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!Objects.equals(comment.getCommenterEmail(), actorEmail)) {
            throw new RuntimeException("You can edit only your own comments");
        }
        comment.setMessage(message);
        return ticketCommentRepository.save(comment);
    }

    public void deleteComment(Long ticketId, Long commentId, String actorEmail, boolean isAdmin) {
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!isAdmin && !Objects.equals(comment.getCommenterEmail(), actorEmail)) {
            throw new RuntimeException("You can delete only your own comments");
        }
        ticketCommentRepository.delete(comment);
    }

    private void notifyTicketParties(Ticket ticket, String commenterEmail, String message) {
        String preview = message.length() > 60 ? message.substring(0, 60) + "..." : message;
        String notificationText = "New comment on ticket #" + ticket.getId() + ": " + preview;

        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().equalsIgnoreCase(commenterEmail)) {
            sendNotification(ticket.getCreatedBy(), ticket.getId(), notificationText);
        }

        if (ticket.getAssignedTo() != null
                && !ticket.getAssignedTo().isBlank()
                && !ticket.getAssignedTo().equalsIgnoreCase(commenterEmail)) {
            sendNotification(ticket.getAssignedTo(), ticket.getId(), notificationText);
        }
    }

    private void sendNotification(String recipientEmail, Long ticketId, String message) {
        User user = userRepository.findByEmail(recipientEmail);
        if (user == null) {
            return;
        }

        Notification notification = new Notification(message, "TICKET_COMMENT", user.getId());
        notification.setTicketId(ticketId);
        Notification savedNotification = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), savedNotification);
    }
}
