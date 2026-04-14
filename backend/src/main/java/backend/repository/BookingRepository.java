package backend.repository;

import backend.entity.Booking;
import backend.enumtype.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserEmail(String userEmail);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserEmailAndStatus(String userEmail, BookingStatus status);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);

    List<Booking> findByResourceIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Long resourceId,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime
    );
}