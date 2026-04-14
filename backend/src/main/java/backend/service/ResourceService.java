package backend.service;

import backend.dto.ResourceRequest;
import backend.entity.Resource;
import backend.enumtype.ResourceStatus;
import backend.enumtype.ResourceType;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource addResource(ResourceRequest request) {
        validateAvailability(request);

        Resource resource = new Resource();
        mapRequestToResource(request, resource);

        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource updateResource(Long id, ResourceRequest request) {
        validateAvailability(request);

        Resource resource = getResourceById(id);
        mapRequestToResource(request, resource);

        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    public List<Resource> searchResources(ResourceType type, Integer capacity, String location, ResourceStatus status) {
        if (type != null && status != null && location != null && !location.isBlank() && capacity != null) {
            return resourceRepository.findByTypeAndStatusAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(
                    type, status, location, capacity
            );
        }

        if (type != null) {
            return resourceRepository.findByType(type);
        }

        if (status != null) {
            return resourceRepository.findByStatus(status);
        }

        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }

        if (capacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(capacity);
        }

        return resourceRepository.findAll();
    }

    private void mapRequestToResource(ResourceRequest request, Resource resource) {
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setAvailabilityStart(request.getAvailabilityStart());
        resource.setAvailabilityEnd(request.getAvailabilityEnd());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
    }

    private void validateAvailability(ResourceRequest request) {
        if (request.getAvailabilityStart().isAfter(request.getAvailabilityEnd())
                || request.getAvailabilityStart().equals(request.getAvailabilityEnd())) {
            throw new BadRequestException("Availability start time must be before end time");
        }
    }
}