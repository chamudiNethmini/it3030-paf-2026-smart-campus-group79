package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private boolean isRead = false;

    @Column(nullable = true)
    private Long userId;

    @Column(nullable = true)
    private Long bookingId;

    @Column(nullable = true)
    private Long ticketId;

    @Column(nullable = false)
    private String type;

    private LocalDateTime createdAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String message, String type) {
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String message, String type, Long userId) {
        this.message = message;
        this.type = type;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
    }

    // getters setters

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}