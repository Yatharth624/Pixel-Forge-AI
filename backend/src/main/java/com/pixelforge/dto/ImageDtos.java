package com.pixelforge.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ImageDtos {

    public static class ImageResponseDto {
        private UUID id;
        private String filename;
        private String contentType;
        private long fileSize;
        private String sha256Hash;
        private String phash;
        private boolean favorite;
        private int currentVersionNumber;
        private UUID projectId;
        private String projectName;
        private LocalDateTime createdAt;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }

        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }

        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }

        public String getSha256Hash() { return sha256Hash; }
        public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

        public String getPhash() { return phash; }
        public void setPhash(String phash) { this.phash = phash; }

        public boolean isFavorite() { return favorite; }
        public void setFavorite(boolean favorite) { this.favorite = favorite; }

        public int getCurrentVersionNumber() { return currentVersionNumber; }
        public void setCurrentVersionNumber(int currentVersionNumber) { this.currentVersionNumber = currentVersionNumber; }

        public UUID getProjectId() { return projectId; }
        public void setProjectId(UUID projectId) { this.projectId = projectId; }

        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ImageVersionDto {
        private UUID id;
        private int versionNumber;
        private String operationName;
        private String operationsJson;
        private UUID parentVersionId;
        private long fileSize;
        private String sha256Hash;
        private LocalDateTime createdAt;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public int getVersionNumber() { return versionNumber; }
        public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

        public String getOperationName() { return operationName; }
        public void setOperationName(String operationName) { this.operationName = operationName; }

        public String getOperationsJson() { return operationsJson; }
        public void setOperationsJson(String operationsJson) { this.operationsJson = operationsJson; }

        public UUID getParentVersionId() { return parentVersionId; }
        public void setParentVersionId(UUID parentVersionId) { this.parentVersionId = parentVersionId; }

        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }

        public String getSha256Hash() { return sha256Hash; }
        public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
