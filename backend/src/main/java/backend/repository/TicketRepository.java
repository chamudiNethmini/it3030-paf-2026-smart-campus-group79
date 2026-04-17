package backend.repository;

import backend.entity.Ticket;
import backend.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for Ticket entity - Member 3
 */
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedByEmail(String email);
    List<Ticket> findByAssignedToEmail(String email);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByResourceId(Long resourceId);
}
