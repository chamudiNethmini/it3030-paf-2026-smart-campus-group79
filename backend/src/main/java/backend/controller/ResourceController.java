package backend.controller;

import backend.dto.ResourceRequest;
import backend.entity.Resource;
import backend.enumtype.ResourceStatus;
import backend.enumtype.ResourceType;
import backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Role check කිරීමට අවශ්‍ය නම්
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // ✅ අලුතින් Resource එකක් එකතු කිරීම (Admin පමණක් විය යුතුයි නම්)
    @PostMapping
    public ResponseEntity<Resource> addResource(@Valid @RequestBody ResourceRequest request) {
        return new ResponseEntity<>(resourceService.addResource(request), HttpStatus.CREATED);
    }

    // ✅ සියලුම Resources ලබා ගැනීම (Public හෝ Authenticated)
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // ✅ ID එක අනුව ලබා ගැනීම
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // ✅ Resource එකක් Update කිරීම
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id,
                                                   @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    // ✅ Resource එකක් Delete කිරීම
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok("Resource deleted successfully");
    }

    // ✅ Search කිරීමේ පහසුකම
    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status
    ) {
        return ResponseEntity.ok(resourceService.searchResources(type, capacity, location, status));
    }
}