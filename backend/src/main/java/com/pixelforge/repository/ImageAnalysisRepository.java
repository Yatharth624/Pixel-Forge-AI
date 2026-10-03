package com.pixelforge.repository;

import com.pixelforge.model.ImageAnalysis;
import com.pixelforge.model.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ImageAnalysisRepository extends JpaRepository<ImageAnalysis, UUID> {
    Optional<ImageAnalysis> findByImage(ImageEntity image);
}
