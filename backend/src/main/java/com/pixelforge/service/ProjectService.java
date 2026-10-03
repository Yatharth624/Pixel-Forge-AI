package com.pixelforge.service;

import com.pixelforge.dto.ProjectDtos.*;
import com.pixelforge.exception.ApiException;
import com.pixelforge.model.Project;
import com.pixelforge.model.User;
import com.pixelforge.repository.ImageRepository;
import com.pixelforge.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ImageRepository imageRepository;

    public ProjectService(ProjectRepository projectRepository, ImageRepository imageRepository) {
        this.projectRepository = projectRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional
    public ProjectResponseDto createProject(CreateProjectRequest request, User user) {
        Project project = new Project(request.getName(), request.getDescription(), user);
        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    public List<ProjectResponseDto> getUserProjects(User user) {
        return projectRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProjectResponseDto getProjectDto(UUID projectId, User user) {
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        return mapToDto(project);
    }

    @Transactional
    public void deleteProject(UUID projectId, User user) {
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        projectRepository.delete(project);
    }

    private ProjectResponseDto mapToDto(Project p) {
        ProjectResponseDto dto = new ProjectResponseDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        long count = imageRepository.findByUserAndProjectOrderByCreatedAtDesc(p.getUser(), p).size();
        dto.setImageCount((int) count);
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
