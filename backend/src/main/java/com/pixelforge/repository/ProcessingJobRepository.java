package com.pixelforge.repository;

import com.pixelforge.model.ProcessingJob;
import com.pixelforge.model.JobStatus;
import com.pixelforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProcessingJobRepository extends JpaRepository<ProcessingJob, UUID> {
    List<ProcessingJob> findByUserOrderByCreatedAtDesc(User user);
    Optional<ProcessingJob> findByIdAndUser(UUID id, User user);
    List<ProcessingJob> findByStatus(JobStatus status);
    long countByUser(User user);
}
