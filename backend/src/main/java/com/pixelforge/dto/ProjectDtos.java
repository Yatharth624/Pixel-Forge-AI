package com.pixelforge.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class ProjectDtos {

    public static class CreateProjectRequest {
        @NotBlank(message = "Project name is required")
        private String name;

        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class ProjectResponseDto {
        private UUID id;
        private String name;
        private String description;
        private int imageCount;
        private LocalDateTime createdAt;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getImageCount() { return imageCount; }
        public void setImageCount(int imageCount) { this.imageCount = imageCount; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
