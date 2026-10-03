package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.dto.ImageDtos.ImageResponseDto;
import com.pixelforge.dto.ImageDtos.ImageVersionDto;
import com.pixelforge.model.User;
import com.pixelforge.service.VersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class VersionController {

    private final VersionService versionService;

    public VersionController(VersionService versionService) {
        this.versionService = versionService;
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<ApiResponse<List<ImageVersionDto>>> getVersionHistory(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        List<ImageVersionDto> versions = versionService.getVersionHistory(id, user);
        return ResponseEntity.ok(ApiResponse.success(versions));
    }

    @PostMapping("/{id}/versions/{versionId}/restore")
    public ResponseEntity<ApiResponse<ImageResponseDto>> restoreVersion(
            @PathVariable("id") UUID id,
            @PathVariable("versionId") UUID versionId,
            @AuthenticationPrincipal User user
    ) {
        ImageResponseDto dto = versionService.restoreVersion(id, versionId, user);
        return ResponseEntity.ok(ApiResponse.success("Version restored successfully", dto));
    }
}
