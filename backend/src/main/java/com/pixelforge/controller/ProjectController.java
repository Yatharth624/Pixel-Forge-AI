package com.pixelforge.controller;

import com.pixelforge.dto.ApiResponse;
import com.pixelforge.dto.ProjectDtos.*;
import com.pixelforge.model.User;
import com.pixelforge.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponseDto>> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal User user
    ) {
        ProjectResponseDto dto = projectService.createProject(request, user);
        return ResponseEntity.ok(ApiResponse.success("Project created successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponseDto>>> getProjects(@AuthenticationPrincipal User user) {
        List<ProjectResponseDto> projects = projectService.getUserProjects(user);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> getProjectById(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        ProjectResponseDto dto = projectService.getProjectDto(id, user);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProject(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        projectService.deleteProject(id, user);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", id.toString()));
    }
}
