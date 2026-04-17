package backend.controller;

import backend.entity.Notification;
import backend.entity.User;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
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
    public List<Notification> getNotificationsByType(@PathVariable String type) {
        return notificationRepository.findByType(type);
    }

    // 📚 Get notifications for specific booking
    @GetMapping("/booking/{bookingId}")
    public List<Notification> getBookingNotifications(@PathVariable Long bookingId) {
        return notificationRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    // 🎫 Get notifications for specific ticket
    @GetMapping("/ticket/{ticketId}")
    public List<Notification> getTicketNotifications(@PathVariable Long ticketId) {
        return notificationRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }
}