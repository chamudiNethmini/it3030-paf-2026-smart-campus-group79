package backend.controller;

import backend.entity.Notification;
import backend.entity.User;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔔 Get all notifications (admin/old endpoint)
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // 👤 Get current user's notifications (authenticated)
    @GetMapping("/user")
    public List<Notification> getUserNotifications(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return List.of();
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // 🔴 Mark as read
    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // 🔥 Get unread count (all)
    @GetMapping("/unread")
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    // 👤 Get user's unread count
    @GetMapping("/user/unread")
    public long getUserUnreadCount(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    // 🎯 Get notifications by type
    @GetMapping("/type/{type}")
    public List<Notification> getNotificationsByType(@PathVariable String type, Authentication auth) {
        requireAdmin(auth);
        return notificationRepository.findByType(type);
    }

    // 📚 Get notifications for specific booking
    @GetMapping("/booking/{bookingId}")
    public List<Notification> getBookingNotifications(@PathVariable Long bookingId, Authentication auth) {
        requireAdmin(auth);
        return notificationRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    // 🎫 Get notifications for specific ticket
    @GetMapping("/ticket/{ticketId}")
    public List<Notification> getTicketNotifications(@PathVariable Long ticketId, Authentication auth) {
        requireAdmin(auth);
        return notificationRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    private User getCurrentUser(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return user;
    }

    private void requireAdmin(Authentication auth) {
        boolean isAdmin = auth.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new AccessDeniedException("Admin access required");
        }
    }
}