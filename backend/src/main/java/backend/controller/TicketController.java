package backend.controller;

import backend.model.Ticket;
import backend.repository.TicketRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    private final TicketRepository repository;

    // ✅ Constructor Injection (better than @Autowired field)
    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/submit")
    public ResponseEntity<Ticket> submitTicket(
            @RequestParam("subject") String subject,
            @RequestParam("message") String message,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        Ticket ticket = new Ticket();
        ticket.setSubject(subject);
        ticket.setMessage(message);

        if (file != null && !file.isEmpty()) {
            ticket.setAttachmentName(file.getOriginalFilename());
            ticket.setAttachmentType(file.getContentType());
            ticket.setAttachmentData(file.getBytes());
        }

        return ResponseEntity.ok(repository.save(ticket));
    }

    @GetMapping("/all")
    public List<Ticket> getAll() {
        return repository.findAll();
    }

    @PutMapping("/reply/{id}")
    public Ticket reply(@PathVariable Long id, @RequestBody String replyText) {
        Ticket ticket = repository.findById(id).orElseThrow();
        ticket.setAdminReply(replyText);
        return repository.save(ticket);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        Ticket ticket = repository.findById(id).orElseThrow();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + ticket.getAttachmentName() + "\"")
                .contentType(MediaType.parseMediaType(ticket.getAttachmentType()))
                .body(ticket.getAttachmentData());
    }
}