import cv2
import numpy as np

ASPECT_RATIOS = {
    "1:1": (1, 1),
    "4:5": (4, 5),
    "16:9": (16, 9),
    "9:16": (9, 16),
    "3:2": (3, 2),
    "2:3": (2, 3)
}

def detect_subject_roi(image_np: np.ndarray) -> tuple[int, int, int, int]:
    """
    Detects primary subject ROI using spectral residual saliency & Canny edge density.
    Returns bounding box (x_center, y_center, focus_width, focus_height).
    """
    h, w = image_np.shape[:2]
    
    # 1. Saliency map via spectral residual
    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_np

    saliency = cv2.saliency.StaticSaliencySpectralResidual_create() if hasattr(cv2, 'saliency') else None
    
    if saliency is not None:
        success, saliency_map = saliency.computeSaliency(image_np)
        saliency_map = (saliency_map * 255).astype(np.uint8)
    else:
        # Fallback edge density + contrast map
        edges = cv2.Canny(gray, 50, 150)
        saliency_map = cv2.GaussianBlur(edges, (21, 21), 0)

    # Calculate center of mass of saliency map
    M = cv2.moments(saliency_map)
    if M["m00"] > 0:
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
    else:
        cx, cy = w // 2, h // 2

    return cx, cy

def calculate_smart_crop(image_np: np.ndarray, target_aspect: str = "1:1") -> dict:
    """
    Calculates intelligent crop bounds centered around saliency subject ROI.
    """
    h, w = image_np.shape[:2]
    cx, cy = detect_subject_roi(image_np)

    if target_aspect in ASPECT_RATIOS:
        ar_w, ar_h = ASPECT_RATIOS[target_aspect]
        target_ar = ar_w / float(ar_h)
    else:
        target_ar = 1.0

    current_ar = w / float(h)

    if current_ar > target_ar:
        # Image is wider than target AR -> constrain height, adjust width
        crop_h = h
        crop_w = int(h * target_ar)
    else:
        # Image is taller than target AR -> constrain width, adjust height
        crop_w = w
        crop_h = int(w / target_ar)

    # Position crop window around subject center (cx, cy)
    x1 = cx - (crop_w // 2)
    y1 = cy - (crop_h // 2)

    # Clamp to image boundaries
    if x1 < 0:
        x1 = 0
    if y1 < 0:
        y1 = 0
    if x1 + crop_w > w:
        x1 = w - crop_w
    if y1 + crop_h > h:
        y1 = h - crop_h

    x1 = max(0, x1)
    y1 = max(0, y1)

    return {
        "aspect_ratio": target_aspect,
        "crop_box": {
            "x": int(x1),
            "y": int(y1),
            "width": int(crop_w),
            "height": int(crop_h)
        },
        "subject_center": {
            "x": int(cx),
            "y": int(cy)
        },
        "original_dimensions": {
            "width": w,
            "height": h
        }
    }
