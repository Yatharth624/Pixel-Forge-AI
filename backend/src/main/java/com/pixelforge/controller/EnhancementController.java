package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.dto.ImageDtos.ImageResponseDto;
import com.pixelforge.model.ImageEntity;
import com.pixelforge.model.User;
import com.pixelforge.service.CvServiceClient;
import com.pixelforge.service.ImageService;
import com.pixelforge.service.VersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class EnhancementController {

    private final ImageService imageService;
    private final VersionService versionService;
    private final CvServiceClient cvServiceClient;

    public EnhancementController(ImageService imageService, VersionService versionService, CvServiceClient cvServiceClient) {
        this.imageService = imageService;
        this.versionService = versionService;
        this.cvServiceClient = cvServiceClient;
    }

    @PostMapping("/{id}/enhance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> autoEnhance(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        ImageEntity image = imageService.getImageEntityForUser(id, user);
        byte[] inputBytes = imageService.getImageBytes(id, user, null);

        Map<String, Object> result = cvServiceClient.autoEnhance(inputBytes, image.getFilename());
        String b64 = (String) result.get("enhanced_image_base64");
        byte[] newBytes = cvServiceClient.decodeBase64Image(b64);

        versionService.createNewVersion(image, newBytes, "Auto Enhancement", "{\"autoEnhanced\": true}");
        ImageResponseDto updatedDto = imageService.mapToDto(image);

        result.put("image", updatedDto);
        return ResponseEntity.ok(ApiResponse.success("Auto enhancement applied", result));
    }

    @PostMapping("/{id}/crop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> smartCrop(
            @PathVariable("id") UUID id,
            @RequestParam("targetAspect") String targetAspect,
            @AuthenticationPrincipal User user
    ) {
        ImageEntity image = imageService.getImageEntityForUser(id, user);
        byte[] inputBytes = imageService.getImageBytes(id, user, null);

        Map<String, Object> result = cvServiceClient.smartCrop(inputBytes, image.getFilename(), targetAspect);
        String b64 = (String) result.get("cropped_image_base64");
        byte[] newBytes = cvServiceClient.decodeBase64Image(b64);

        versionService.createNewVersion(image, newBytes, "Smart Crop (" + targetAspect + ")", "{\"aspectRatio\": \"" + targetAspect + "\"}");
        result.put("image", imageService.mapToDto(image));
        return ResponseEntity.ok(ApiResponse.success("Smart crop applied", result));
    }

    @PostMapping("/{id}/edit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> manualEdit(
            @PathVariable("id") UUID id,
            @RequestParam(value = "brightness", defaultValue = "0") float brightness,
            @RequestParam(value = "contrast", defaultValue = "0") float contrast,
            @RequestParam(value = "saturation", defaultValue = "0") float saturation,
            @RequestParam(value = "sharpenStrength", defaultValue = "none") String sharpenStrength,
            @RequestParam(value = "blurKsize", defaultValue = "0") int blurKsize,
            @RequestParam(value = "denoiseStrength", defaultValue = "none") String denoiseStrength,
            @RequestParam(value = "grayscale", defaultValue = "false") boolean grayscale,
            @RequestParam(value = "sepia", defaultValue = "false") boolean sepia,
            @RequestParam(value = "rotateAngle", defaultValue = "0") int rotateAngle,
            @RequestParam(value = "flipH", defaultValue = "false") boolean flipH,
            @RequestParam(value = "flipV", defaultValue = "false") boolean flipV,
            @AuthenticationPrincipal User user
    ) {
        ImageEntity image = imageService.getImageEntityForUser(id, user);
        byte[] inputBytes = imageService.getImageBytes(id, user, null);

        MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
        params.add("brightness", brightness);
        params.add("contrast", contrast);
        params.add("saturation", saturation);
        params.add("sharpen_strength", sharpenStrength);
        params.add("blur_ksize", blurKsize);
        params.add("denoise_strength", denoiseStrength);
        params.add("grayscale", grayscale);
        params.add("sepia", sepia);
        params.add("rotate_angle", rotateAngle);
        params.add("flip_h", flipH);
        params.add("flip_v", flipV);

        Map<String, Object> result = cvServiceClient.editImage(inputBytes, image.getFilename(), params);
        String b64 = (String) result.get("edited_image_base64");
        byte[] newBytes = cvServiceClient.decodeBase64Image(b64);

        versionService.createNewVersion(image, newBytes, "Manual Adjustments", "{\"brightness\":" + brightness + ",\"contrast\":" + contrast + "}");
        result.put("image", imageService.mapToDto(image));
        return ResponseEntity.ok(ApiResponse.success("Manual edits applied", result));
    }

    @PostMapping("/{id}/remove-background")
    public ResponseEntity<ApiResponse<Map<String, Object>>> removeBackground(
            @PathVariable("id") UUID id,
            @RequestParam(value = "bgMode", defaultValue = "transparent") String bgMode,
            @RequestParam(value = "bgColorHex", defaultValue = "#FFFFFF") String bgColorHex,
            @AuthenticationPrincipal User user
    ) {
        ImageEntity image = imageService.getImageEntityForUser(id, user);
        byte[] inputBytes = imageService.getImageBytes(id, user, null);

        Map<String, Object> result = cvServiceClient.removeBackground(inputBytes, image.getFilename(), bgMode, bgColorHex);
        String b64 = (String) result.get("processed_image_base64");
        byte[] newBytes = cvServiceClient.decodeBase64Image(b64);

        if ("transparent".equalsIgnoreCase(bgMode)) {
            image.setContentType("image/png");
        }

        versionService.createNewVersion(image, newBytes, "Background Removed (" + bgMode + ")", "{\"bgMode\":\"" + bgMode + "\"}");
        result.put("image", imageService.mapToDto(image));
        return ResponseEntity.ok(ApiResponse.success("Background removed", result));
    }

    @PostMapping("/{id}/upscale")
    public ResponseEntity<ApiResponse<Map<String, Object>>> upscale(
            @PathVariable("id") UUID id,
            @RequestParam(value = "scaleFactor", defaultValue = "2") int scaleFactor,
            @RequestParam(value = "algorithm", defaultValue = "bicubic") String algorithm,
            @AuthenticationPrincipal User user
    ) {
        ImageEntity image = imageService.getImageEntityForUser(id, user);
        byte[] inputBytes = imageService.getImageBytes(id, user, null);

        Map<String, Object> result = cvServiceClient.upscaleImage(inputBytes, image.getFilename(), scaleFactor, algorithm);
        String b64 = (String) result.get("upscaled_image_base64");
        byte[] newBytes = cvServiceClient.decodeBase64Image(b64);

        versionService.createNewVersion(image, newBytes, "Upscale " + scaleFactor + "x (" + algorithm + ")", "{\"scale\":" + scaleFactor + ",\"algorithm\":\"" + algorithm + "\"}");
        result.put("image", imageService.mapToDto(image));
        return ResponseEntity.ok(ApiResponse.success("Image upscaled", result));
    }
}
