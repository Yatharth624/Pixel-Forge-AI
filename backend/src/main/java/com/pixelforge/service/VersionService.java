package com.pixelforge.service;

import com.pixelforge.dto.ImageDtos.*;
import com.pixelforge.exception.ApiException;
import com.pixelforge.model.ImageEntity;
import com.pixelforge.model.ImageVersion;
import com.pixelforge.model.User;
import com.pixelforge.repository.ImageRepository;
import com.pixelforge.repository.ImageVersionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VersionService {

    private final ImageVersionRepository versionRepository;
    private final ImageRepository imageRepository;
    private final ImageService imageService;
    private final StorageService storageService;

    public VersionService(ImageVersionRepository versionRepository, ImageRepository imageRepository, ImageService imageService, StorageService storageService) {
        this.versionRepository = versionRepository;
        this.imageRepository = imageRepository;
        this.imageService = imageService;
        this.storageService = storageService;
    }

    public List<ImageVersionDto> getVersionHistory(UUID imageId, User user) {
        ImageEntity image = imageService.getImageEntityForUser(imageId, user);
        return versionRepository.findByImageOrderByVersionNumberAsc(image)
                .stream()
                .map(this::mapToVersionDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ImageVersion createNewVersion(ImageEntity image, byte[] newImageBytes, String operationName, String operationsJson) {
        String sha256 = storageService.calculateSha256(newImageBytes);
        String storageKey = storageService.storeFile(newImageBytes, image.getFilename());

        int nextVersionNumber = image.getCurrentVersionNumber() + 1;
        ImageVersion newVersion = new ImageVersion(
                nextVersionNumber,
                storageKey,
                operationName,
                operationsJson,
                image,
                newImageBytes.length,
                sha256
        );

        ImageVersion savedVersion = versionRepository.save(newVersion);

        // Update image entity active head pointers
        image.setCurrentVersionNumber(nextVersionNumber);
        image.setStorageKey(storageKey);
        image.setFileSize(newImageBytes.length);
        image.setSha256Hash(sha256);
        imageRepository.save(image);

        return savedVersion;
    }

    @Transactional
    public ImageResponseDto restoreVersion(UUID imageId, UUID versionId, User user) {
        ImageEntity image = imageService.getImageEntityForUser(imageId, user);
        ImageVersion targetVersion = versionRepository.findById(versionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VERSION_NOT_FOUND", "Target version not found"));

        if (!targetVersion.getImage().getId().equals(image.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_VERSION", "Version does not belong to this image");
        }

        byte[] restoredBytes = storageService.loadFileAsBytes(targetVersion.getStorageKey());
        createNewVersion(image, restoredBytes, "Restored v" + targetVersion.getVersionNumber(), "{\"restoredFromVersion\":" + targetVersion.getVersionNumber() + "}");

        return imageService.mapToDto(image);
    }

    public ImageVersionDto mapToVersionDto(ImageVersion v) {
        ImageVersionDto dto = new ImageVersionDto();
        dto.setId(v.getId());
        dto.setVersionNumber(v.getVersionNumber());
        dto.setOperationName(v.getOperationName());
        dto.setOperationsJson(v.getOperationsJson());
        dto.setParentVersionId(v.getParentVersionId());
        dto.setFileSize(v.getFileSize());
        dto.setSha256Hash(v.getSha256Hash());
        dto.setCreatedAt(v.getCreatedAt());
        return dto;
    }
}
