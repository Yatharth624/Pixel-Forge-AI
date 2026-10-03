package com.pixelforge.service;

import com.pixelforge.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${pixelforge.storage.local-dir:./data/storage}")
    private String storageDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            this.rootLocation = Paths.get(storageDir).toAbsolutePath().normalize();
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(byte[] bytes, String originalFilename) {
        String key = UUID.randomUUID().toString() + "_" + sanitizeFilename(originalFilename);
        Path targetLocation = this.rootLocation.resolve(key);
        try {
            Files.write(targetLocation, bytes);
            return key;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_ERROR", "Failed to store file: " + e.getMessage());
        }
    }

    public byte[] loadFileAsBytes(String storageKey) {
        try {
            Path filePath = this.rootLocation.resolve(storageKey).normalize();
            if (!Files.exists(filePath)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Requested file not found in object storage");
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_READ_ERROR", "Failed to read file: " + e.getMessage());
        }
    }

    public String calculateSha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public void deleteFile(String storageKey) {
        try {
            Path filePath = this.rootLocation.resolve(storageKey).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Ignore deletion error
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "image.bin";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
