package backend.repository;

import backend.entity.Resource;
import backend.enumtype.ResourceStatus;
import backend.enumtype.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByTypeAndStatusAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer capacity
    );
}