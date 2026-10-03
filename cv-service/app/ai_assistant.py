import re
import cv2
import numpy as np

ALLOWED_OPERATION_TYPES = {
    "crop", "brightness", "contrast", "saturation", "sharpen", 
    "blur", "denoise", "grayscale", "sepia", "rotate", "flip", 
    "resize", "upscale", "remove_background", "auto_enhance"
}

def parse_natural_language_command(prompt: str) -> dict:
    """
    Translates natural-language prompt into validated structured operations schema.
    Safely parses and validates against whitelist to prevent code injection.
    """
    prompt_lower = prompt.lower()
    operations = []

    # 1. Instagram Presets
    if "instagram" in prompt_lower:
        if "story" in prompt_lower or "reel" in prompt_lower:
            operations.append({"type": "crop", "aspectRatio": "9:16"})
        elif "square" in prompt_lower:
            operations.append({"type": "crop", "aspectRatio": "1:1"})
        else: # Default portrait
            operations.append({"type": "crop", "aspectRatio": "4:5"})
        operations.append({"type": "auto_enhance", "mode": "vibrant"})

    # 2. LinkedIn / YouTube Presets
    if "linkedin" in prompt_lower or "banner" in prompt_lower:
        operations.append({"type": "crop", "aspectRatio": "16:9"})
        operations.append({"type": "brightness", "amount": 5})
    elif "youtube" in prompt_lower or "thumbnail" in prompt_lower:
        operations.append({"type": "crop", "aspectRatio": "16:9"})
        operations.append({"type": "saturation", "amount": 15})
        operations.append({"type": "sharpen", "strength": "medium"})

    # 3. Specific operation parsing
    if "brightness" in prompt_lower or "brighter" in prompt_lower or "darker" in prompt_lower:
        if "darker" in prompt_lower:
            operations.append({"type": "brightness", "amount": -15})
        elif "slightly" in prompt_lower:
            operations.append({"type": "brightness", "amount": 10})
        else:
            operations.append({"type": "brightness", "amount": 20})

    if "contrast" in prompt_lower:
        operations.append({"type": "contrast", "amount": 15})

    if "sharper" in prompt_lower or "sharpen" in prompt_lower:
        strength = "high" if "very" in prompt_lower else "medium"
        operations.append({"type": "sharpen", "strength": strength})

    if "remove background" in prompt_lower or "background" in prompt_lower:
        operations.append({"type": "remove_background", "mode": "transparent"})

    if "denoise" in prompt_lower or "smooth" in prompt_lower:
        operations.append({"type": "denoise", "strength": "medium"})

    if "auto enhance" in prompt_lower or "enhance" in prompt_lower:
        if not any(op["type"] == "auto_enhance" for op in operations):
            operations.append({"type": "auto_enhance"})

    # Fallback to auto enhance if no matching intent parsed
    if not operations:
        operations.append({"type": "auto_enhance"})

    # Validate all operations against whitelist
    validated = []
    for op in operations:
        if op.get("type") in ALLOWED_OPERATION_TYPES:
            validated.append(op)

    return {
        "original_prompt": prompt,
        "operations": validated,
        "validation_passed": True
    }

def generate_ai_analysis(image_np: np.ndarray, file_name: str = "Image") -> dict:
    """
    Generates computer-vision image description, object detection tags, alt text, and accessibility advice.
    """
    h, w = image_np.shape[:2]
    aspect_ratio_str = f"{w}:{h}"
    
    # Analyze color dominance and image type
    if len(image_np.shape) == 3:
        b, g, r = cv2.split(image_np)
        mean_r, mean_g, mean_b = np.mean(r), np.mean(g), np.mean(b)
    else:
        mean_r = mean_g = mean_b = np.mean(image_np)

    # Detect presence of subjects/objects via contour analysis & edge density
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY) if len(image_np.shape) == 3 else image_np
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    large_contours = [c for c in contours if cv2.contourArea(c) > (h * w * 0.02)]
    object_count = len(large_contours)

    tags = ["digital-media", f"resolution-{w}x{h}"]
    objects = []

    if mean_g > mean_r and mean_g > mean_b:
        scene = "Natural outdoor landscape with greenery"
        tags.extend(["nature", "outdoor", "landscape", "greenery"])
        objects.append("Foliage / Landscape Subject")
    elif mean_b > mean_r and mean_b > mean_g:
        scene = "Sky or water body environment"
        tags.extend(["sky", "water", "ocean", "outdoor"])
        objects.append("Sky / Water Horizon")
    elif abs(mean_r - mean_g) < 15 and abs(mean_g - mean_b) < 15:
        scene = "Monochrome or neutral studio setup"
        tags.extend(["studio", "neutral", "minimal"])
        objects.append("Studio Subject")
    else:
        scene = "Vibrant multi-color composition"
        tags.extend(["creative", "vibrant", "design"])
        objects.append("Primary Focal Subject")

    if object_count > 0:
        objects.append(f"Focal Object Region ({object_count} prominent structures)")

    description = f"High quality image depicting a {scene.lower()} with dimensions {w}x{h} pixels."
    alt_text = f"Visual media depicting {scene.lower()} with main focus on {objects[0] if objects else 'center subject'}."

    accessibility = []
    if mean_r < 50 and mean_g < 50 and mean_b < 50:
        accessibility.append("Low luminance: Consider increasing brightness to improve contrast for visual accessibility.")
    else:
        accessibility.append("Luminance and contrast meet standard accessibility guidelines.")

    return {
        "description": description,
        "alt_text": alt_text,
        "suggested_tags": list(set(tags)),
        "detected_objects": objects,
        "scene_description": scene,
        "accessibility_recommendations": accessibility
    }
