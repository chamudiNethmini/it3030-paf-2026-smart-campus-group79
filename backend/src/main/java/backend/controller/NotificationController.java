package backend.controller;

import backend.entity.Notification;
import backend.entity.User;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
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

    // 🔔 Get all notifications (Admin only is recommended, but keeping as per your code)
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // 👤 Get notifications for currently logged-in user
    @GetMapping("/user")
    public List<Notification> getUserNotifications(Authentication auth) {
        User user = getCurrentUser(auth);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // 🔴 Mark a specific notification as read
    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // 🔥 Global unread count
    @GetMapping("/unread")
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    // 👤 Get currently logged-in user's unread count
    @GetMapping("/user/unread")
    public long getUserUnreadCount(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    // 🎯 Get notifications by type (Admin only)
    @GetMapping("/type/{type}")
    public List<Notification> getNotificationsByType(@PathVariable String type, Authentication auth) {
        requireAdmin(auth);
        return notificationRepository.findByType(type);
    }

    // 📚 Get notifications for specific booking (Admin only)
    @GetMapping("/booking/{bookingId}")
    public List<Notification> getBookingNotifications(@PathVariable Long bookingId, Authentication auth) {
        requireAdmin(auth);
        return notificationRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    // 🎫 Get notifications for specific ticket (Admin only)
    @GetMapping("/ticket/{ticketId}")
    public List<Notification> getTicketNotifications(@PathVariable Long ticketId, Authentication auth) {
        requireAdmin(auth);
        return notificationRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    // Helper method to get user from Authentication
    private User getCurrentUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String email;
        if (auth.getPrincipal() instanceof OAuth2User oAuth2User) {
            email = oAuth2User.getAttribute("email");
        } else {
            email = auth.getName();
        }

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to resolve user email");
        }

        User user = userRepository.findByEmailIgnoreCase(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return user;
    }

    // Helper method to check for Admin role
    private void requireAdmin(Authentication auth) {
        boolean isAdmin = auth.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new AccessDeniedException("Admin access required");
        }
    }
}