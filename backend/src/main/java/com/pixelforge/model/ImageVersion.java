package com.pixelforge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "image_versions")
public class ImageVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int versionNumber;

    @Column(nullable = false)
    private String storageKey;

    private String operationName;

    @Column(length = 2000)
    private String operationsJson;

    private UUID parentVersionId;

    private long fileSize;

    private String sha256Hash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = false)
    private ImageEntity image;

    private LocalDateTime createdAt;

    public ImageVersion() {}

    public ImageVersion(int versionNumber, String storageKey, String operationName, String operationsJson, ImageEntity image, long fileSize, String sha256Hash) {
        this.versionNumber = versionNumber;
        this.storageKey = storageKey;
        this.operationName = operationName;
        this.operationsJson = operationsJson;
        this.image = image;
        this.fileSize = fileSize;
        this.sha256Hash = sha256Hash;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

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

    public ImageEntity getImage() { return image; }
    public void setImage(ImageEntity image) { this.image = image; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
