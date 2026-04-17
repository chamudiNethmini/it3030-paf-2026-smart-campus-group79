package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Ticket entity for Member 3 - Incident Tickets + Attachments
 * Tracks maintenance requests, facility issues, and tech support
 */
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String reportedByEmail;

    @Column(nullable = false)
    private Long resourceId;  // Which resource/facility has the issue

    @Column(nullable = true)
    private String assignedToEmail;  // TECHNICIAN assigned to this ticket

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;  // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;  // LOW, MEDIUM, HIGH

    @Column(nullable = true, length = 500)
    private String resolution;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime resolvedAt;

    @Column(nullable = true)
    private LocalDateTime updatedAt;

    public Ticket() {
    }

    public Ticket(String title, String description, String reportedByEmail, Long resourceId, TicketPriority priority) {
        this.title = title;
        this.description = description;
        this.reportedByEmail = reportedByEmail;
        this.resourceId = resourceId;
        this.priority = priority;
        this.status = TicketStatus.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReportedByEmail() {
        return reportedByEmail;
    }

    public void setReportedByEmail(String reportedByEmail) {
        this.reportedByEmail = reportedByEmail;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Status and Priority enums

    public enum TicketStatus {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }

    public enum TicketPriority {
        LOW,
        MEDIUM,
        HIGH
    }
}
