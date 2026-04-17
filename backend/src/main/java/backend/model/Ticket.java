package backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // matches: resource_location
    @Column(name = "resource_location", nullable = false)
    private String resourceLocation;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    // matches: contact_details
    @Column(name = "contact_details")
    private String contactDetails;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_by")
    private String createdBy;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    // Attachments table mapping
    @ElementCollection
    @CollectionTable(
            name = "ticket_attachments",
            joinColumns = @JoinColumn(name = "ticket_id")
    )
    @Column(name = "image_url")
    private List<String> attachments = new ArrayList<>();

    // Enums
    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }

    // ================= GETTERS & SETTERS =================

    public Long getId() {
        return id;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactDetails() {
        return contactDetails;
    }

    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
}