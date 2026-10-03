package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.dto.ImageDtos.*;
import com.pixelforge.model.User;
import com.pixelforge.service.ImageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImageResponseDto>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @AuthenticationPrincipal User user
    ) {
        ImageResponseDto dto = imageService.uploadImage(file, projectId, user);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImageResponseDto>>> getImages(
            @RequestParam(value = "favorites", required = false) Boolean favorites,
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @AuthenticationPrincipal User user
    ) {
        List<ImageResponseDto> images = imageService.getUserImages(user, favorites, projectId);
        return ResponseEntity.ok(ApiResponse.success(images));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageResponseDto>> getImageById(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        ImageResponseDto dto = imageService.getImageDto(id, user);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/{id}/bytes")
    public ResponseEntity<byte[]> getImageBytes(
            @PathVariable("id") UUID id,
            @RequestParam(value = "version", required = false) Integer version,
            @AuthenticationPrincipal User user
    ) {
        byte[] bytes = imageService.getImageBytes(id, user, version);
        ImageResponseDto dto = imageService.getImageDto(id, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + dto.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(dto.getContentType() != null ? dto.getContentType() : "image/png"))
                .body(bytes);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<ImageResponseDto>> toggleFavorite(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        ImageResponseDto dto = imageService.toggleFavorite(id, user);
        return ResponseEntity.ok(ApiResponse.success("Favorite toggled", dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteImage(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        imageService.deleteImage(id, user);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", id.toString()));
    }
}
