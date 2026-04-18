package backend.controller;

import backend.entity.Role;
import backend.entity.User;
import backend.entity.Ticket;
import backend.entity.TicketComment;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import backend.service.TicketCommentService;
import backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketCommentService ticketCommentService;

    /**
     * USER: own tickets. ADMIN / TECHNICIAN: all tickets.
     */
    @GetMapping
    public List<Ticket> listTickets(Authentication authentication) {
        User actor = requireActor(authentication);
        if (actor.getRole() == Role.ADMIN || actor.getRole() == Role.TECHNICIAN) {
            return ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        }
        return ticketRepository.findByCreatedByOrderByIdDesc(actor.getEmail());
    }

    /**
     * Get tickets assigned to current technician
     */
    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets(Authentication auth) {
        String email = auth.getName();
        List<Ticket> tickets = ticketService.getMyTickets(email);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets reported by current user
     */
    @GetMapping("/reported")
    public ResponseEntity<List<Ticket>> getReportedTickets(Authentication auth) {
        String email = auth.getName();
        List<Ticket> tickets = ticketService.getReportedTickets(email);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getTicketComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketCommentService.getCommentsByTicketId(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addTicketComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth
    ) {
        String message = request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        TicketComment comment = ticketCommentService.addComment(id, auth.getName(), message.trim());
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitTicket(
            Authentication authentication,
            @RequestParam String resourceLocation,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam String contactDetails,
            @RequestParam(required = false) List<MultipartFile> files
    ) {
        try {
            User actor = requireActor(authentication);
            if (actor.getRole() == Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Admins cannot raise tickets. Admin can reply/update user tickets.");
            }

            Ticket ticket = new Ticket();
            ticket.setResourceLocation(resourceLocation);
            ticket.setCategory(category);
            ticket.setDescription(description);
            ticket.setContactDetails(contactDetails);
            ticket.setCreatedBy(actor.getEmail());
            ticket.setCreatedAt(LocalDateTime.now());

            // Enums handling (Assuming Ticket.Priority and Ticket.Status exist)
            ticket.setPriority(Ticket.Priority.valueOf(priority.toUpperCase()));
            ticket.setStatus(Ticket.Status.OPEN);

            List<String> fileNames = new ArrayList<>();
            if (files != null) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        fileNames.add(file.getOriginalFilename());
                    }
                }
            }
            ticket.setAttachments(fileNames);

            Ticket saved = ticketRepository.save(ticket);
            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid priority value");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Something went wrong");
        }
    }

    /**
     * Assign ticket to technician (admin only)
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable Long id,
            @RequestParam String technicianEmail
    ) {
        Ticket assigned = ticketService.assignTicket(id, technicianEmail);
        return ResponseEntity.ok(assigned);
    }

    /**
     * Update ticket status and add resolution notes
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String resolution
    ) {
        Ticket updated = ticketService.updateTicketStatus(id, status, resolution);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<?> addReply(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        User actor = requireActor(authentication);
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.TECHNICIAN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only admin or technician can reply to tickets");
        }
        String message = payload.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body("Reply message is required");
        }
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        
        // Note: Ensure your Ticket entity has a TicketReply list/logic.
        ticket.getReplies().add(new Ticket.TicketReply(
                actor.getEmail(),
                message.trim(),
                LocalDateTime.now()
        ));
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    private User requireActor(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof OAuth2User oAuth2User) {
            email = oAuth2User.getAttribute("email");
        } else {
            email = authentication.getName();
        }
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No email in session");
        }
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not registered");
        }
        return user;
    }
}