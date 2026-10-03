package com.pixelforge.service;

import com.pixelforge.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
public class CvServiceClient {

    @Value("${pixelforge.cv-service.url:http://localhost:8000}")
    private String cvServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> analyzeImage(byte[] imageBytes, String filename) {
        return postMultipartRequest("/analyze", imageBytes, filename, new LinkedMultiValueMap<>());
    }

    public Map<String, Object> autoEnhance(byte[] imageBytes, String filename) {
        return postMultipartRequest("/enhance", imageBytes, filename, new LinkedMultiValueMap<>());
    }

    public Map<String, Object> smartCrop(byte[] imageBytes, String filename, String targetAspect) {
        MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
        params.add("target_aspect", targetAspect);
        return postMultipartRequest("/crop", imageBytes, filename, params);
    }

    public Map<String, Object> removeBackground(byte[] imageBytes, String filename, String bgMode, String bgColorHex) {
        MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
        params.add("bg_mode", bgMode);
        params.add("bg_color_hex", bgColorHex);
        return postMultipartRequest("/remove-background", imageBytes, filename, params);
    }

    public Map<String, Object> upscaleImage(byte[] imageBytes, String filename, int scaleFactor, String algorithm) {
        MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
        params.add("scale_factor", scaleFactor);
        params.add("algorithm", algorithm);
        return postMultipartRequest("/upscale", imageBytes, filename, params);
    }

    public Map<String, Object> editImage(byte[] imageBytes, String filename, MultiValueMap<String, Object> params) {
        return postMultipartRequest("/edit", imageBytes, filename, params);
    }

    public Map<String, Object> aiCommand(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of("prompt", prompt), headers);
            return restTemplate.postForObject(cvServiceUrl + "/ai-command", request, Map.class);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "CV_SERVICE_UNAVAILABLE", "Failed to communicate with CV Microservice: " + e.getMessage());
        }
    }

    public byte[] decodeBase64Image(String b64Data) {
        if (b64Data == null) return new byte[0];
        String cleanB64 = b64Data;
        if (b64Data.contains(",")) {
            cleanB64 = b64Data.split(",")[1];
        }
        return Base64.getDecoder().decode(cleanB64);
    }

    private Map<String, Object> postMultipartRequest(String endpoint, byte[] imageBytes, String filename, MultiValueMap<String, Object> extraParams) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource fileResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return filename != null ? filename : "image.png";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>(extraParams);
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    cvServiceUrl + endpoint,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "CV_SERVICE_ERROR", "CV Service operation failed: " + e.getMessage());
        }
    }
}
