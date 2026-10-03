package com.pixelforge.repository;

import com.pixelforge.model.Project;
import com.pixelforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByUserOrderByCreatedAtDesc(User user);
    Optional<Project> findByIdAndUser(UUID id, User user);
}
