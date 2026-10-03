package com.pixelforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelforge.exception.ApiException;
import com.pixelforge.model.ImageAnalysis;
import com.pixelforge.model.ImageEntity;
import com.pixelforge.model.User;
import com.pixelforge.repository.ImageAnalysisRepository;
import com.pixelforge.repository.ImageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AnalysisService {

    private final ImageAnalysisRepository analysisRepository;
    private final ImageRepository imageRepository;
    private final ImageService imageService;
    private final CvServiceClient cvServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisService(ImageAnalysisRepository analysisRepository, ImageRepository imageRepository, ImageService imageService, CvServiceClient cvServiceClient) {
        this.analysisRepository = analysisRepository;
        this.imageRepository = imageRepository;
        this.imageService = imageService;
        this.cvServiceClient = cvServiceClient;
    }

    @Transactional
    public Map<String, Object> analyzeAndSave(UUID imageId, User user) {
        ImageEntity image = imageService.getImageEntityForUser(imageId, user);
        byte[] imageBytes = imageService.getImageBytes(imageId, user, null);

        Map<String, Object> cvResult = cvServiceClient.analyzeImage(imageBytes, image.getFilename());

        try {
            Map<String, Object> meta = (Map<String, Object>) cvResult.get("metadata");
            Map<String, Object> qa = (Map<String, Object>) cvResult.get("quality_assessment");
            Map<String, Object> blur = (Map<String, Object>) cvResult.get("blur_analysis");
            Map<String, Object> bc = (Map<String, Object>) cvResult.get("brightness_contrast");
            Map<String, Object> hashes = (Map<String, Object>) cvResult.get("hashes");

            ImageAnalysis analysis = analysisRepository.findByImage(image).orElse(new ImageAnalysis());
            analysis.setImage(image);
            analysis.setWidth((int) meta.get("width"));
            analysis.setHeight((int) meta.get("height"));
            analysis.setAspectRatio(String.valueOf(meta.get("aspect_ratio")));

            analysis.setQualityScore((int) qa.get("overall_score"));
            analysis.setSharpnessScore(((Number) qa.get("sharpness_score")).doubleValue());
            analysis.setNoiseSigma(((Number) qa.get("noise_sigma")).doubleValue());
            analysis.setNoiseLevel(String.valueOf(qa.get("noise_level")));

            analysis.setLaplacianVariance(((Number) blur.get("laplacian_variance")).doubleValue());
            analysis.setBlurClassification(String.valueOf(blur.get("classification")));

            analysis.setMeanBrightness(((Number) bc.get("mean_brightness")).doubleValue());
            analysis.setBrightnessPercentage(((Number) bc.get("brightness_percentage")).doubleValue());
            analysis.setExposureClassification(String.valueOf(bc.get("exposure_classification")));

            analysis.setContrastStdDev(((Number) bc.get("contrast_std_dev")).doubleValue());
            analysis.setContrastPercentage(((Number) bc.get("contrast_percentage")).doubleValue());
            analysis.setContrastClassification(String.valueOf(bc.get("contrast_classification")));

            analysis.setDominantColorsJson(objectMapper.writeValueAsString(cvResult.get("dominant_colors")));
            analysis.setHistogramsJson(objectMapper.writeValueAsString(cvResult.get("histograms")));
            analysis.setAiAnalysisJson(objectMapper.writeValueAsString(cvResult.get("ai_analysis")));

            analysisRepository.save(analysis);

            // Save pHash on ImageEntity
            if (hashes != null && hashes.containsKey("phash")) {
                image.setPhash(String.valueOf(hashes.get("phash")));
                imageRepository.save(image);
            }

            return cvResult;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "ANALYSIS_PARSE_ERROR", "Failed to parse analysis results: " + e.getMessage());
        }
    }

    public Map<String, Object> getAnalysisForImage(UUID imageId, User user) {
        ImageEntity image = imageService.getImageEntityForUser(imageId, user);
        Optional<ImageAnalysis> analysisOpt = analysisRepository.findByImage(image);
        if (analysisOpt.isEmpty()) {
            // Run analysis on demand
            return analyzeAndSave(imageId, user);
        }
        ImageAnalysis a = analysisOpt.get();
        try {
            Map<String, Object> res = new HashMap<>();
            res.put("imageId", image.getId());
            res.put("filename", image.getFilename());
            res.put("width", a.getWidth());
            res.put("height", a.getHeight());
            res.put("aspectRatio", a.getAspectRatio());
            res.put("qualityScore", a.getQualityScore());
            res.put("blurClassification", a.getBlurClassification());
            res.put("laplacianVariance", a.getLaplacianVariance());
            res.put("sharpnessScore", a.getSharpnessScore());
            res.put("brightnessPercentage", a.getBrightnessPercentage());
            res.put("exposureClassification", a.getExposureClassification());
            res.put("contrastPercentage", a.getContrastPercentage());
            res.put("contrastClassification", a.getContrastClassification());
            res.put("noiseLevel", a.getNoiseLevel());
            res.put("dominantColors", objectMapper.readValue(a.getDominantColorsJson(), List.class));
            res.put("histograms", objectMapper.readValue(a.getHistogramsJson(), Map.class));
            res.put("aiAnalysis", objectMapper.readValue(a.getAiAnalysisJson(), Map.class));
            return res;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "ANALYSIS_READ_ERROR", "Failed to read analysis record");
        }
    }

    public List<Map<String, Object>> findDuplicateImages(User user) {
        List<ImageEntity> images = imageRepository.findByUserOrderByCreatedAtDesc(user);
        Map<String, List<ImageEntity>> hashGroup = new HashMap<>();
        for (ImageEntity img : images) {
            hashGroup.computeIfAbsent(img.getSha256Hash(), k -> new ArrayList<>()).add(img);
        }

        List<Map<String, Object>> duplicates = new ArrayList<>();
        for (Map.Entry<String, List<ImageEntity>> entry : hashGroup.entrySet()) {
            if (entry.getValue().size() > 1) {
                Map<String, Object> dupGroup = new HashMap<>();
                dupGroup.put("sha256", entry.getKey());
                dupGroup.put("count", entry.getValue().size());
                dupGroup.put("images", entry.getValue().stream().map(imageService::mapToDto).toList());
                duplicates.add(dupGroup);
            }
        }
        return duplicates;
    }
}
