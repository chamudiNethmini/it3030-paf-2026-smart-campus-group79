package backend.controller;

import backend.dto.BookingRequest;
import backend.dto.BookingResponse;
import backend.dto.BookingStatusUpdateRequest;
import backend.enumtype.BookingStatus;
import backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // 1. Create booking
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. Get all bookings of one user
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam String userEmail) {
        List<BookingResponse> bookings = bookingService.getMyBookings(userEmail);
        return ResponseEntity.ok(bookings);
    }

    // 3. Get all bookings (admin side, with optional filters)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) Long resourceId
    ) {
        List<BookingResponse> bookings = bookingService.getAllBookings(status, userEmail, resourceId);
        return ResponseEntity.ok(bookings);
    }

    // 4. Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    // 5. Update booking status (APPROVED / REJECTED / CANCELLED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        BookingResponse updatedBooking = bookingService.updateBookingStatus(id, request);
        return ResponseEntity.ok(updatedBooking);
    }

    // 6. Delete booking
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }
}