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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
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

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(request.getStatus());

        if (request.getStatus() == BookingStatus.REJECTED) {
            booking.setAdminReason(request.getAdminReason());
        } else {
            booking.setAdminReason(null);
        }

        Booking updatedBooking = bookingRepository.save(booking);

        // 🔔 SEND NOTIFICATION TO USER ON STATUS CHANGE
        String notifMessage = "";
        String notifType = "";

        switch (request.getStatus()) {
            case APPROVED:
                notifMessage = "✅ Your booking #" + id + " has been APPROVED!";
                notifType = "BOOKING_APPROVED";
                break;
            case REJECTED:
                notifMessage = "❌ Your booking #" + id + " has been REJECTED. Reason: " + request.getAdminReason();
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

        // Get user and create notification
        User user = userRepository.findByEmail(booking.getUserEmail());
        if (user != null) {
            Notification notif = new Notification(notifMessage, notifType, user.getId());
            notif.setBookingId(id);
            Notification savedNotif = notificationRepository.save(notif);

            // Send via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", savedNotif);

            System.out.println("🔔 Booking notification sent: " + notifMessage);
        }

        return mapToResponse(updatedBooking);
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        bookingRepository.delete(booking);
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