package com.pixelforge.repository;

import com.pixelforge.model.ImageVersion;
import com.pixelforge.model.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImageVersionRepository extends JpaRepository<ImageVersion, UUID> {
    List<ImageVersion> findByImageOrderByVersionNumberAsc(ImageEntity image);
    Optional<ImageVersion> findByImageAndVersionNumber(ImageEntity image, int versionNumber);
}
