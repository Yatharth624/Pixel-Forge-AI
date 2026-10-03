package com.pixelforge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "image_analysis")
public class ImageAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int width;
    private int height;
    private String aspectRatio;

    private int qualityScore;

    private double laplacianVariance;
    private String blurClassification;
    private double sharpnessScore;

    private double meanBrightness;
    private double brightnessPercentage;
    private String exposureClassification;

    private double contrastStdDev;
    private double contrastPercentage;
    private String contrastClassification;

    private double noiseSigma;
    private String noiseLevel;

    @Column(columnDefinition = "TEXT")
    private String dominantColorsJson;

    @Column(columnDefinition = "TEXT")
    private String histogramsJson;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysisJson;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = false)
    private ImageEntity image;

    private LocalDateTime createdAt;

    public ImageAnalysis() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public String getAspectRatio() { return aspectRatio; }
    public void setAspectRatio(String aspectRatio) { this.aspectRatio = aspectRatio; }

    public int getQualityScore() { return qualityScore; }
    public void setQualityScore(int qualityScore) { this.qualityScore = qualityScore; }

    public double getLaplacianVariance() { return laplacianVariance; }
    public void setLaplacianVariance(double laplacianVariance) { this.laplacianVariance = laplacianVariance; }

    public String getBlurClassification() { return blurClassification; }
    public void setBlurClassification(String blurClassification) { this.blurClassification = blurClassification; }

    public double getSharpnessScore() { return sharpnessScore; }
    public void setSharpnessScore(double sharpnessScore) { this.sharpnessScore = sharpnessScore; }

    public double getMeanBrightness() { return meanBrightness; }
    public void setMeanBrightness(double meanBrightness) { this.meanBrightness = meanBrightness; }

    public double getBrightnessPercentage() { return brightnessPercentage; }
    public void setBrightnessPercentage(double brightnessPercentage) { this.brightnessPercentage = brightnessPercentage; }

    public String getExposureClassification() { return exposureClassification; }
    public void setExposureClassification(String exposureClassification) { this.exposureClassification = exposureClassification; }

    public double getContrastStdDev() { return contrastStdDev; }
    public void setContrastStdDev(double contrastStdDev) { this.contrastStdDev = contrastStdDev; }

    public double getContrastPercentage() { return contrastPercentage; }
    public void setContrastPercentage(double contrastPercentage) { this.contrastPercentage = contrastPercentage; }

    public String getContrastClassification() { return contrastClassification; }
    public void setContrastClassification(String contrastClassification) { this.contrastClassification = contrastClassification; }

    public double getNoiseSigma() { return noiseSigma; }
    public void setNoiseSigma(double noiseSigma) { this.noiseSigma = noiseSigma; }

    public String getNoiseLevel() { return noiseLevel; }
    public void setNoiseLevel(String noiseLevel) { this.noiseLevel = noiseLevel; }

    public String getDominantColorsJson() { return dominantColorsJson; }
    public void setDominantColorsJson(String dominantColorsJson) { this.dominantColorsJson = dominantColorsJson; }

    public String getHistogramsJson() { return histogramsJson; }
    public void setHistogramsJson(String histogramsJson) { this.histogramsJson = histogramsJson; }

    public String getAiAnalysisJson() { return aiAnalysisJson; }
    public void setAiAnalysisJson(String aiAnalysisJson) { this.aiAnalysisJson = aiAnalysisJson; }

    public ImageEntity getImage() { return image; }
    public void setImage(ImageEntity image) { this.image = image; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
