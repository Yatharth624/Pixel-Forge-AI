package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.model.User;
import com.pixelforge.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeImage(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        Map<String, Object> result = analysisService.analyzeAndSave(id, user);
        return ResponseEntity.ok(ApiResponse.success("Image analysis completed", result));
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalysis(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        Map<String, Object> result = analysisService.getAnalysisForImage(id, user);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/duplicates")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDuplicates(@AuthenticationPrincipal User user) {
        List<Map<String, Object>> duplicates = analysisService.findDuplicateImages(user);
        return ResponseEntity.ok(ApiResponse.success(duplicates));
    }
}
