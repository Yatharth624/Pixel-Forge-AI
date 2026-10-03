package com.pixelforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelforge.dto.JobDtos.*;
import com.pixelforge.exception.ApiException;
import com.pixelforge.model.*;
import com.pixelforge.repository.ProcessingJobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobProcessorService {

    private final ProcessingJobRepository jobRepository;
    private final ImageService imageService;
    private final VersionService versionService;
    private final CvServiceClient cvServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JobProcessorService(ProcessingJobRepository jobRepository, ImageService imageService, VersionService versionService, CvServiceClient cvServiceClient) {
        this.jobRepository = jobRepository;
        this.imageService = imageService;
        this.versionService = versionService;
        this.cvServiceClient = cvServiceClient;
    }

    @Transactional
    public JobResponseDto createJob(CreateJobRequest req, User user) {
        ImageEntity image = null;
        if (req.getImageId() != null) {
            image = imageService.getImageEntityForUser(req.getImageId(), user);
        }

        ProcessingJob job = new ProcessingJob(req.getJobType(), user, image, req.getParamsJson());
        ProcessingJob saved = jobRepository.save(job);

        // Execute async job immediately
        processJobAsync(saved.getId());

        return mapToDto(saved);
    }

    public List<JobResponseDto> getUserJobs(User user) {
        return jobRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public JobResponseDto getJobDto(UUID jobId, User user) {
        ProcessingJob job = jobRepository.findByIdAndUser(jobId, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "JOB_NOT_FOUND", "Processing job not found"));
        return mapToDto(job);
    }

    @Async
    public void processJobAsync(UUID jobId) {
        Optional<ProcessingJob> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) return;

        ProcessingJob job = jobOpt.get();
        job.setStatus(JobStatus.PROCESSING);
        job.setStartedAt(LocalDateTime.now());
        job.setProgress(20);
        jobRepository.save(job);

        try {
            ImageEntity image = job.getImage();
            byte[] inputBytes = imageService.getImageBytes(image.getId(), job.getUser(), null);

            byte[] outputBytes = null;
            String opName = job.getJobType().name();

            if (job.getJobType() == JobType.AUTO_ENHANCE) {
                Map<String, Object> res = cvServiceClient.autoEnhance(inputBytes, image.getFilename());
                job.setProgress(70);
                String b64 = (String) res.get("enhanced_image_base64");
                outputBytes = cvServiceClient.decodeBase64Image(b64);
                opName = "Auto Enhancement";

            } else if (job.getJobType() == JobType.BACKGROUND_REMOVAL) {
                String bgMode = "transparent";
                String bgColor = "#FFFFFF";
                if (job.getParamsJson() != null) {
                    Map map = objectMapper.readValue(job.getParamsJson(), Map.class);
                    if (map.containsKey("bg_mode")) bgMode = (String) map.get("bg_mode");
                    if (map.containsKey("bg_color_hex")) bgColor = (String) map.get("bg_color_hex");
                }
                Map<String, Object> res = cvServiceClient.removeBackground(inputBytes, image.getFilename(), bgMode, bgColor);
                job.setProgress(70);
                String b64 = (String) res.get("processed_image_base64");
                outputBytes = cvServiceClient.decodeBase64Image(b64);
                opName = "Background Removal (" + bgMode + ")";

            } else if (job.getJobType() == JobType.SMART_CROP) {
                String aspect = "1:1";
                if (job.getParamsJson() != null) {
                    Map map = objectMapper.readValue(job.getParamsJson(), Map.class);
                    if (map.containsKey("target_aspect")) aspect = (String) map.get("target_aspect");
                }
                Map<String, Object> res = cvServiceClient.smartCrop(inputBytes, image.getFilename(), aspect);
                job.setProgress(70);
                String b64 = (String) res.get("cropped_image_base64");
                outputBytes = cvServiceClient.decodeBase64Image(b64);
                opName = "Smart Crop " + aspect;

            } else if (job.getJobType() == JobType.UPSCALE) {
                int scale = 2;
                String algo = "bicubic";
                if (job.getParamsJson() != null) {
                    Map map = objectMapper.readValue(job.getParamsJson(), Map.class);
                    if (map.containsKey("scale_factor")) scale = ((Number) map.get("scale_factor")).intValue();
                    if (map.containsKey("algorithm")) algo = (String) map.get("algorithm");
                }
                Map<String, Object> res = cvServiceClient.upscaleImage(inputBytes, image.getFilename(), scale, algo);
                job.setProgress(70);
                String b64 = (String) res.get("upscaled_image_base64");
                outputBytes = cvServiceClient.decodeBase64Image(b64);
                opName = "Upscale " + scale + "x (" + algo + ")";
            }

            if (outputBytes != null && outputBytes.length > 0) {
                versionService.createNewVersion(image, outputBytes, opName, job.getParamsJson());
            }

            job.setStatus(JobStatus.COMPLETED);
            job.setProgress(100);
            job.setCompletedAt(LocalDateTime.now());
            jobRepository.save(job);

        } catch (Exception e) {
            job.setStatus(JobStatus.FAILED);
            job.setErrorMessage("Processing failed: " + e.getMessage());
            job.setCompletedAt(LocalDateTime.now());
            jobRepository.save(job);
        }
    }

    private JobResponseDto mapToDto(ProcessingJob j) {
        JobResponseDto dto = new JobResponseDto();
        dto.setId(j.getId());
        dto.setJobType(j.getJobType());
        dto.setStatus(j.getStatus());
        dto.setProgress(j.getProgress());
        dto.setParamsJson(j.getParamsJson());
        dto.setErrorMessage(j.getErrorMessage());
        if (j.getImage() != null) {
            dto.setImageId(j.getImage().getId());
            dto.setImageName(j.getImage().getFilename());
        }
        dto.setCreatedAt(j.getCreatedAt());
        dto.setCompletedAt(j.getCompletedAt());
        return dto;
    }
}
