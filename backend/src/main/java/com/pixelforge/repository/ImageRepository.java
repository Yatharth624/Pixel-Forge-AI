package com.pixelforge.repository;

import com.pixelforge.model.ImageEntity;
import com.pixelforge.model.User;
import com.pixelforge.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImageRepository extends JpaRepository<ImageEntity, UUID> {
    List<ImageEntity> findByUserOrderByCreatedAtDesc(User user);
    List<ImageEntity> findByUserAndFavoriteTrueOrderByCreatedAtDesc(User user);
    List<ImageEntity> findByUserAndProjectOrderByCreatedAtDesc(User user, Project project);
    Optional<ImageEntity> findByIdAndUser(UUID id, User user);
    List<ImageEntity> findByUserAndSha256Hash(User user, String sha256Hash);
    long countByUser(User user);
}
