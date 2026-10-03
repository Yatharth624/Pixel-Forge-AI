package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.service.CvServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final CvServiceClient cvServiceClient;

    public AiController(CvServiceClient cvServiceClient) {
        this.cvServiceClient = cvServiceClient;
    }

    @PostMapping("/command")
    public ResponseEntity<ApiResponse<Map<String, Object>>> parseAiCommand(@RequestBody Map<String, String> body) {
        String prompt = body.getOrDefault("prompt", "");
        Map<String, Object> result = cvServiceClient.aiCommand(prompt);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
