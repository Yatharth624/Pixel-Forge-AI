import cv2
import numpy as np
from app.blur_detection import calculate_laplacian_variance, classify_blur
from app.brightness_contrast import analyze_brightness_contrast

def estimate_noise(image_np: np.ndarray) -> float:
    """
    Estimates high-frequency noise using standard deviation of Laplacian difference.
    Implements Immerkaer noise estimation algorithm.
    """
    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_np

    H, W = gray.shape
    M = np.array([[1, -2, 1],
                  [-2, 4, -2],
                  [1, -2, 1]], dtype=np.float64)
    sigma = np.sum(np.abs(cv2.filter2D(gray.astype(np.float64), -1, M)))
    sigma = sigma * np.sqrt(0.5 * np.pi) / (6.0 * (W - 2) * (H - 2))
    return float(sigma)

def calculate_quality_score(image_np: np.ndarray) -> dict:
    """
    Calculates normalized quality score (0 - 100) using a deterministic formula:
    
    Quality Score = 
          Sharpness Contribution (0..30)
        + Contrast Contribution  (0..25)
        + Exposure Contribution  (0..25)
        + Resolution Contribution(0..20)
        - Noise Penalty          (0..15)
        - Blur Penalty           (0..20)
    """
    height, width = image_np.shape[:2]
    total_pixels = height * width
    megapixels = total_pixels / 1_000_000.0

    # 1. Blur & Sharpness
    lap_var = calculate_laplacian_variance(image_np)
    blur_info = classify_blur(lap_var)
    sharpness_score = blur_info["sharpness_score"]
    sharpness_contrib = (sharpness_score / 100.0) * 30.0

    # Blur Penalty
    if lap_var < 50.0:
        blur_penalty = 20.0
    elif lap_var < 100.0:
        blur_penalty = 10.0
    else:
        blur_penalty = 0.0

    # 2. Brightness & Exposure
    bc_analysis = analyze_brightness_contrast(image_np)
    brightness_pct = bc_analysis["brightness_percentage"]
    # Ideal brightness around 50%
    exposure_dev = abs(brightness_pct - 50.0)
    exposure_contrib = max(0.0, 25.0 - (exposure_dev / 50.0) * 25.0)

    # 3. Contrast Contribution
    contrast_pct = bc_analysis["contrast_percentage"]
    contrast_contrib = (contrast_pct / 100.0) * 25.0

    # 4. Resolution Contribution
    res_contrib = min(20.0, (megapixels / 2.0) * 20.0)

    # 5. Noise Estimation & Penalty
    noise_sigma = estimate_noise(image_np)
    noise_penalty = min(15.0, (noise_sigma / 10.0) * 15.0)
    if noise_sigma < 2.0:
        noise_level = "Low"
    elif noise_sigma < 5.0:
        noise_level = "Medium"
    else:
        noise_level = "High"

    raw_score = sharpness_contrib + contrast_contrib + exposure_contrib + res_contrib - noise_penalty - blur_penalty
    final_score = int(round(max(0.0, min(100.0, raw_score))))

    return {
        "overall_score": final_score,
        "sharpness_score": sharpness_score,
        "contrast_score": contrast_pct,
        "brightness_percentage": brightness_pct,
        "noise_sigma": round(noise_sigma, 2),
        "noise_level": noise_level,
        "blur_classification": blur_info["classification"],
        "laplacian_variance": blur_info["laplacian_variance"],
        "breakdown": {
            "sharpness_contrib": round(sharpness_contrib, 1),
            "contrast_contrib": round(contrast_contrib, 1),
            "exposure_contrib": round(exposure_contrib, 1),
            "resolution_contrib": round(res_contrib, 1),
            "noise_penalty": round(noise_penalty, 1),
            "blur_penalty": round(blur_penalty, 1)
        }
    }
