package com.pixelforge.service;

import com.pixelforge.dto.ImageDtos.*;
import com.pixelforge.exception.ApiException;
import com.pixelforge.model.ImageEntity;
import com.pixelforge.model.ImageVersion;
import com.pixelforge.model.Project;
import com.pixelforge.model.User;
import com.pixelforge.repository.ImageRepository;
import com.pixelforge.repository.ImageVersionRepository;
import com.pixelforge.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ImageService {

    private final ImageRepository imageRepository;
    private final ImageVersionRepository versionRepository;
    private final ProjectRepository projectRepository;
    private final StorageService storageService;

    public ImageService(ImageRepository imageRepository, ImageVersionRepository versionRepository, ProjectRepository projectRepository, StorageService storageService) {
        this.imageRepository = imageRepository;
        this.versionRepository = versionRepository;
        this.projectRepository = projectRepository;
        this.storageService = storageService;
    }

    @Transactional
    public ImageResponseDto uploadImage(MultipartFile file, UUID projectId, User user) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "Uploaded file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FILE_TYPE", "Uploaded file must be a valid image format");
        }

        try {
            byte[] bytes = file.getBytes();
            String sha256 = storageService.calculateSha256(bytes);
            String storageKey = storageService.storeFile(bytes, file.getOriginalFilename());

            ImageEntity image = new ImageEntity(
                    file.getOriginalFilename(),
                    storageKey,
                    contentType,
                    file.getSize(),
                    sha256,
                    user
            );

            if (projectId != null) {
                Project project = projectRepository.findByIdAndUser(projectId, user)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
                image.setProject(project);
            }

            ImageEntity savedImage = imageRepository.save(image);

            // Create Version 1 (Original)
            ImageVersion v1 = new ImageVersion(
                    1,
                    storageKey,
                    "Original Upload",
                    "{\"action\": \"upload\"}",
                    savedImage,
                    file.getSize(),
                    sha256
            );
            versionRepository.save(v1);

            return mapToDto(savedImage);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED", "Failed to read uploaded file: " + e.getMessage());
        }
    }

    public List<ImageResponseDto> getUserImages(User user, Boolean favoritesOnly, UUID projectId) {
        List<ImageEntity> images;
        if (Boolean.TRUE.equals(favoritesOnly)) {
            images = imageRepository.findByUserAndFavoriteTrueOrderByCreatedAtDesc(user);
        } else if (projectId != null) {
            Project project = projectRepository.findByIdAndUser(projectId, user)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
            images = imageRepository.findByUserAndProjectOrderByCreatedAtDesc(user, project);
        } else {
            images = imageRepository.findByUserOrderByCreatedAtDesc(user);
        }
        return images.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ImageEntity getImageEntityForUser(UUID imageId, User user) {
        return imageRepository.findByIdAndUser(imageId, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Image not found or access denied"));
    }

    public ImageResponseDto getImageDto(UUID imageId, User user) {
        return mapToDto(getImageEntityForUser(imageId, user));
    }

    public byte[] getImageBytes(UUID imageId, User user, Integer versionNumber) {
        ImageEntity image = getImageEntityForUser(imageId, user);
        String storageKey = image.getStorageKey();
        if (versionNumber != null && versionNumber > 0) {
            ImageVersion version = versionRepository.findByImageAndVersionNumber(image, versionNumber)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VERSION_NOT_FOUND", "Version " + versionNumber + " not found"));
            storageKey = version.getStorageKey();
        }
        return storageService.loadFileAsBytes(storageKey);
    }

    @Transactional
    public ImageResponseDto toggleFavorite(UUID imageId, User user) {
        ImageEntity image = getImageEntityForUser(imageId, user);
        image.setFavorite(!image.isFavorite());
        return mapToDto(imageRepository.save(image));
    }

    @Transactional
    public void deleteImage(UUID imageId, User user) {
        ImageEntity image = getImageEntityForUser(imageId, user);
        List<ImageVersion> versions = versionRepository.findByImageOrderByVersionNumberAsc(image);
        for (ImageVersion v : versions) {
            storageService.deleteFile(v.getStorageKey());
        }
        storageService.deleteFile(image.getStorageKey());
        imageRepository.delete(image);
    }

    public ImageResponseDto mapToDto(ImageEntity image) {
        ImageResponseDto dto = new ImageResponseDto();
        dto.setId(image.getId());
        dto.setFilename(image.getFilename());
        dto.setContentType(image.getContentType());
        dto.setFileSize(image.getFileSize());
        dto.setSha256Hash(image.getSha256Hash());
        dto.setPhash(image.getPhash());
        dto.setFavorite(image.isFavorite());
        dto.setCurrentVersionNumber(image.getCurrentVersionNumber());
        if (image.getProject() != null) {
            dto.setProjectId(image.getProject().getId());
            dto.setProjectName(image.getProject().getName());
        }
        dto.setCreatedAt(image.getCreatedAt());
        return dto;
    }
}
