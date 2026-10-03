import cv2
import numpy as np

def analyze_brightness_contrast(image_np: np.ndarray) -> dict:
    """
    Analyzes brightness using ITU-R BT.601 luminance weights:
    Y = 0.299 R + 0.587 G + 0.114 B
    
    Contrast is derived from standard deviation of luminance:
    Contrast = std(Y) / 128.0 * 100%
    """
    if len(image_np.shape) == 3:
        b, g, r = cv2.split(image_np)
        luminance = 0.299 * r + 0.587 * g + 0.114 * b
    else:
        luminance = image_np.astype(np.float64)

    mean_brightness = float(np.mean(luminance))
    brightness_percentage = round((mean_brightness / 255.0) * 100, 1)

    if brightness_percentage < 35.0:
        exposure = "Underexposed"
    elif brightness_percentage > 75.0:
        exposure = "Overexposed"
    else:
        exposure = "Balanced"

    std_dev = float(np.std(luminance))
    contrast_score = round(min(100.0, (std_dev / 64.0) * 100), 1)

    if contrast_score < 35.0:
        contrast_class = "Low Contrast"
    elif contrast_score > 75.0:
        contrast_class = "High Contrast"
    else:
        contrast_class = "Optimal Contrast"

    return {
        "mean_brightness": round(mean_brightness, 2),
        "brightness_percentage": brightness_percentage,
        "exposure_classification": exposure,
        "contrast_std_dev": round(std_dev, 2),
        "contrast_percentage": contrast_score,
        "contrast_classification": contrast_class
    }

def generate_histograms(image_np: np.ndarray) -> dict:
    """
    Calculates 256-bin frequency histograms for Red, Green, Blue channels and Luminance.
    """
    if len(image_np.shape) == 3:
        b, g, r = cv2.split(image_np)
        lum = (0.299 * r + 0.587 * g + 0.114 * b).astype(np.uint8)

        hist_r = cv2.calcHist([r], [0], None, [256], [0, 256]).flatten().tolist()
        hist_g = cv2.calcHist([g], [0], None, [256], [0, 256]).flatten().tolist()
        hist_b = cv2.calcHist([b], [0], None, [256], [0, 256]).flatten().tolist()
        hist_lum = cv2.calcHist([lum], [0], None, [256], [0, 256]).flatten().tolist()
    else:
        hist_r = hist_g = hist_b = []
        hist_lum = cv2.calcHist([image_np], [0], None, [256], [0, 256]).flatten().tolist()

    return {
        "red": [int(x) for x in hist_r],
        "green": [int(x) for x in hist_g],
        "blue": [int(x) for x in hist_b],
        "luminance": [int(x) for x in hist_lum]
    }
