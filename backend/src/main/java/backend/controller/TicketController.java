package backend.controller;

import backend.entity.Ticket;
import backend.entity.Ticket.TicketStatus;
import backend.entity.Ticket.TicketPriority;
import backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TicketController - Member 3
 * REST endpoints for incident tickets, maintenance requests
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3001")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    /**
     * Create a new ticket
     */
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket, Authentication auth) {
        String userEmail = auth.getName();
        ticket.setReportedByEmail(userEmail);
        Ticket created = ticketService.createTicket(ticket);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Get all tickets (admin only)
     */
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
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
        Ticket ticket = ticketService.getAllTickets().stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return ResponseEntity.ok(ticket);
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
        try {
            TicketStatus newStatus = TicketStatus.valueOf(status.toUpperCase());
            Ticket updated = ticketService.updateTicketStatus(id, newStatus, resolution);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete ticket (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ticket deleted successfully");
        return ResponseEntity.ok(response);
    }
}
