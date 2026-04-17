package backend.controller;

import backend.model.Ticket;
import backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitTicket(
            @RequestParam String resourceLocation,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam String contactDetails,
            @RequestParam(required = false) List<MultipartFile> files
    ) {

        try {
            System.out.println("API HIT");

            Ticket ticket = new Ticket();
            ticket.setResourceLocation(resourceLocation);
            ticket.setCategory(category);
            ticket.setDescription(description);
            ticket.setContactDetails(contactDetails);

            // 🔥 SAFE ENUM CONVERSION
            ticket.setPriority(Ticket.Priority.valueOf(priority.toUpperCase()));

            ticket.setStatus(Ticket.Status.OPEN);

            // Handle file names
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

            System.out.println("SAVED ID: " + saved.getId());

            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid priority value");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Something went wrong");
        }
    }
}