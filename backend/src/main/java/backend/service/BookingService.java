package backend.service;

import backend.dto.BookingRequest;
import backend.dto.BookingResponse;
import backend.dto.BookingStatusUpdateRequest;
import backend.entity.Booking;
import backend.entity.Notification;
import backend.entity.User;
import backend.enumtype.BookingStatus;
import backend.repository.BookingRepository;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BookingService(BookingRepository bookingRepository, 
                          UserRepository userRepository, 
                          NotificationRepository notificationRepository, 
                          SimpMessagingTemplate messagingTemplate) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public BookingResponse createBooking(BookingRequest request) {
        boolean hasConflict = !bookingRepository
                .findByResourceIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        request.getResourceId(),
                        request.getBookingDate(),
                        request.getEndTime(),
                        request.getStartTime()
                ).isEmpty();

        if (hasConflict) {
            throw new RuntimeException("Booking conflict detected for the selected resource and time range");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserEmail(request.getUserEmail());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings(BookingStatus status, String userEmail, Long resourceId) {
        List<Booking> bookings = bookingRepository.findAll();

        if (status != null) {
            bookings = bookings.stream()
                    .filter(booking -> booking.getStatus() == status)
                    .collect(Collectors.toList());
        }

        if (userEmail != null && !userEmail.isBlank()) {
            bookings = bookings.stream()
                    .filter(booking -> booking.getUserEmail().equalsIgnoreCase(userEmail))
                    .collect(Collectors.toList());
        }

        if (resourceId != null) {
            bookings = bookings.stream()
                    .filter(booking -> booking.getResourceId().equals(resourceId))
                    .collect(Collectors.toList());
        }

        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    public BookingResponse updateBookingStatus(Long id, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        booking.setStatus(request.getStatus());

        if (request.getStatus() == BookingStatus.REJECTED) {
            booking.setAdminReason(request.getAdminReason());
        } else {
            booking.setAdminReason(null);
        }

        Booking updatedBooking = bookingRepository.save(booking);

        String notifMessage;
        String notifType;
        String rejectionReason = request.getAdminReason() == null ? "" : request.getAdminReason().trim();

        switch (request.getStatus()) {
            case PENDING:
                notifMessage = "⏳ Your booking #" + id + " is now marked as PENDING by admin.";
                notifType = "BOOKING_PENDING";
                break;
            case APPROVED:
                notifMessage = "✅ Your booking #" + id + " has been APPROVED!";
                notifType = "BOOKING_APPROVED";
                break;
            case REJECTED:
                notifMessage = rejectionReason.isBlank()
                        ? "❌ Your booking #" + id + " has been REJECTED."
                        : "❌ Your booking #" + id + " has been REJECTED. Reason: " + rejectionReason;
                notifType = "BOOKING_REJECTED";
                break;
            case CANCELLED:
                notifMessage = "⚠️ Your booking #" + id + " has been CANCELLED";
                notifType = "BOOKING_CANCELLED";
                break;
            default:
                notifMessage = "📢 Your booking #" + id + " status changed to " + request.getStatus();
                notifType = "BOOKING_UPDATED";
        }

        sendBookingNotificationToUser(booking.getUserEmail(), id, notifMessage, notifType);

        return mapToResponse(updatedBooking);
    }

    public BookingResponse cancelMyBooking(Long id, String requestUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (requestUserEmail == null || !booking.getUserEmail().equalsIgnoreCase(requestUserEmail)) {
            throw new RuntimeException("You can only cancel your own booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminReason("Cancelled by user");
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        sendBookingNotificationToUser(
                booking.getUserEmail(),
                id,
                "🗑️ Your booking #" + id + " has been DELETED by admin.",
                "BOOKING_DELETED"
        );

        bookingRepository.delete(booking);
    }

    private void sendBookingNotificationToUser(String userEmail, Long bookingId, String message, String type) {
        User user = userRepository.findByEmailIgnoreCase(userEmail);
        if (user == null) {
            return;
        }

        Notification notification = new Notification(message, type, user.getId());
        notification.setBookingId(bookingId);
        Notification savedNotification = notificationRepository.save(notification);

        // user-specific WebSocket channel to show instant in-app alert
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), savedNotification);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResourceId());
        response.setUserEmail(booking.getUserEmail());
        response.setBookingDate(booking.getBookingDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setAdminReason(booking.getAdminReason());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }
}