package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.dto.JobDtos.*;
import com.pixelforge.model.User;
import com.pixelforge.service.JobProcessorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobProcessorService jobProcessorService;

    public JobController(JobProcessorService jobProcessorService) {
        this.jobProcessorService = jobProcessorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponseDto>> createJob(
            @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal User user
    ) {
        JobResponseDto dto = jobProcessorService.createJob(request, user);
        return ResponseEntity.ok(ApiResponse.success("Job created successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponseDto>>> getJobs(@AuthenticationPrincipal User user) {
        List<JobResponseDto> jobs = jobProcessorService.getUserJobs(user);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponseDto>> getJobById(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        JobResponseDto dto = jobProcessorService.getJobDto(id, user);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
