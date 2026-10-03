package com.pixelforge.dto;

import com.pixelforge.model.JobStatus;
import com.pixelforge.model.JobType;
import java.time.LocalDateTime;
import java.util.UUID;

public class JobDtos {

    public static class CreateJobRequest {
        private JobType jobType;
        private UUID imageId;
        private String paramsJson;

        public JobType getJobType() { return jobType; }
        public void setJobType(JobType jobType) { this.jobType = jobType; }

        public UUID getImageId() { return imageId; }
        public void setImageId(UUID imageId) { this.imageId = imageId; }

        public String getParamsJson() { return paramsJson; }
        public void setParamsJson(String paramsJson) { this.paramsJson = paramsJson; }
    }

    public static class JobResponseDto {
        private UUID id;
        private JobType jobType;
        private JobStatus status;
        private int progress;
        private String paramsJson;
        private String errorMessage;
        private UUID imageId;
        private String imageName;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public JobType getJobType() { return jobType; }
        public void setJobType(JobType jobType) { this.jobType = jobType; }

        public JobStatus getStatus() { return status; }
        public void setStatus(JobStatus status) { this.status = status; }

        public int getProgress() { return progress; }
        public void setProgress(int progress) { this.progress = progress; }

        public String getParamsJson() { return paramsJson; }
        public void setParamsJson(String paramsJson) { this.paramsJson = paramsJson; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public UUID getImageId() { return imageId; }
        public void setImageId(UUID imageId) { this.imageId = imageId; }

        public String getImageName() { return imageName; }
        public void setImageName(String imageName) { this.imageName = imageName; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }
}
