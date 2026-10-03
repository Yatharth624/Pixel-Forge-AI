import cv2
import numpy as np
from app.quality_scorer import calculate_quality_score
from app.brightness_contrast import analyze_brightness_contrast

def apply_auto_enhancement(image_np: np.ndarray) -> tuple[np.ndarray, dict]:
    """
    Intelligent Auto Enhancement Pipeline:
    1. Analyzes current metrics (brightness, contrast, blur, noise).
    2. Builds an adaptive transformation plan tailored to the image defects.
    3. Executes plan (brightness correction, CLAHE contrast enhancement, unsharp masking, bilateral denoising, HSV saturation boost).
    4. Re-analyzes quality score and returns enhanced image + execution log.
    """
    before_analysis = calculate_quality_score(image_np)
    enhanced = image_np.copy()
    plan_actions = []

    # 1. Exposure Correction
    b_pct = before_analysis["brightness_percentage"]
    if b_pct < 40.0:
        # Underexposed: increase brightness
        gamma = 1.3
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in range(256)]).astype("uint8")
        enhanced = cv2.LUT(enhanced, table)
        plan_actions.append(f"Increased brightness (Gamma correction {gamma})")
    elif b_pct > 75.0:
        # Overexposed: slight darkening
        gamma = 0.85
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in range(256)]).astype("uint8")
        enhanced = cv2.LUT(enhanced, table)
        plan_actions.append("Reduced overexposure (Gamma 0.85)")

    # 2. Contrast Enhancement (Adaptive Histogram Equalization CLAHE in LAB space)
    c_score = before_analysis["contrast_score"]
    if c_score < 60.0:
        lab = cv2.cvtColor(enhanced, cv2.COLOR_BGR2LAB)
        l, a, b_channel = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b_channel))
        enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        plan_actions.append("Applied CLAHE adaptive contrast enhancement")

    # 3. Noise Reduction (Bilateral Filter preserves sharp edges)
    noise_sigma = before_analysis["noise_sigma"]
    if noise_sigma > 2.5:
        enhanced = cv2.bilateralFilter(enhanced, d=9, sigmaColor=75, sigmaSpace=75)
        plan_actions.append(f"Reduced high-frequency noise (Bilateral filter, noise level: {before_analysis['noise_level']})")

    # 4. Sharpening via Unsharp Masking Kernel
    sharpness = before_analysis["sharpness_score"]
    if sharpness < 75.0:
        gaussian_blur = cv2.GaussianBlur(enhanced, (0, 0), 3)
        enhanced = cv2.addWeighted(enhanced, 1.4, gaussian_blur, -0.4, 0)
        plan_actions.append("Applied unsharp masking sharpening convolution")

    # 5. Controlled Color Saturation Boost in HSV space
    hsv = cv2.cvtColor(enhanced, cv2.COLOR_BGR2HSV).astype(np.float64)
    h_chan, s_chan, v_chan = cv2.split(hsv)
    mean_sat = np.mean(s_chan)
    if mean_sat < 100.0:
        s_chan = np.clip(s_chan * 1.15, 0, 255)
        hsv_enhanced = cv2.merge([h_chan, s_chan, v_chan]).astype(np.uint8)
        enhanced = cv2.cvtColor(hsv_enhanced, cv2.COLOR_HSV2BGR)
        plan_actions.append("Enhanced color vibrancy (+15% saturation boost)")

    after_analysis = calculate_quality_score(enhanced)

    report = {
        "applied_actions": plan_actions if plan_actions else ["Image metrics are already optimal"],
        "quality_before": before_analysis["overall_score"],
        "quality_after": after_analysis["overall_score"],
        "score_improvement": after_analysis["overall_score"] - before_analysis["overall_score"],
        "before_metrics": before_analysis,
        "after_metrics": after_analysis
    }

    return enhanced, report
