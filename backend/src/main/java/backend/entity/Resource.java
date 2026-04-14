package backend.entity;

import backend.enumtype.ResourceStatus;
import backend.enumtype.ResourceType;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalTime availabilityStart;

    @Column(nullable = false)
    private LocalTime availabilityEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(length = 500)
    private String description;

    public Resource() {
    }

    public Resource(Long id, String name, ResourceType type, Integer capacity, String location,
                    LocalTime availabilityStart, LocalTime availabilityEnd,
                    ResourceStatus status, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityStart = availabilityStart;
        this.availabilityEnd = availabilityEnd;
        this.status = status;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public void setAvailabilityStart(LocalTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public void setAvailabilityEnd(LocalTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}