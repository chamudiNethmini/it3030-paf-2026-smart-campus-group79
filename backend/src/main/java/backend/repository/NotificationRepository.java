package backend.repository;

import backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    long countByIsReadFalse();

    // 🔔 User-specific notifications
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    // 📚 Find notifications by type
    List<Notification> findByType(String type);

    // 🎟️ Find notifications related to specific booking/ticket
    List<Notification> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Notification> findByTicketIdOrderByCreatedAtDesc(Long ticketId);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);
}