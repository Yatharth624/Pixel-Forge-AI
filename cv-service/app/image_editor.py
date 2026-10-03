import cv2
import numpy as np

def adjust_brightness_contrast(image_np: np.ndarray, brightness: float = 0, contrast: float = 0) -> np.ndarray:
    """
    Adjusts brightness (-100 to 100) and contrast (-100 to 100).
    Formula: output = alpha * input + beta
    where alpha = (contrast + 100) / 100
          beta = brightness * 1.27
    """
    img = image_np.astype(np.float32)
    alpha = (contrast + 100.0) / 100.0 if contrast != 0 else 1.0
    beta = brightness * 1.27

    img = alpha * img + beta
    return np.clip(img, 0, 255).astype(np.uint8)

def adjust_saturation(image_np: np.ndarray, saturation: float = 0) -> np.ndarray:
    """
    Adjusts saturation (-100 to 100) in HSV space.
    """
    if saturation == 0:
        return image_np
    hsv = cv2.cvtColor(image_np, cv2.COLOR_BGR2HSV).astype(np.float32)
    factor = (saturation + 100.0) / 100.0
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * factor, 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

def apply_sharpen(image_np: np.ndarray, strength: str = "medium") -> np.ndarray:
    """
    Applies image sharpening using 3x3 convolution kernel:
    [[ 0, -1,  0],
     [-1,  5, -1],
     [ 0, -1,  0]]
    """
    mult = {"low": 0.5, "medium": 1.0, "high": 2.0}.get(strength.lower(), 1.0)
    kernel = np.array([[0, -1, 0],
                       [-1, 4 + (1 * mult), -1],
                       [0, -1, 0]], dtype=np.float32)
    return cv2.filter2D(image_np, -1, kernel)

def apply_blur(image_np: np.ndarray, ksize: int = 5) -> np.ndarray:
    """
    Applies Gaussian Blur kernel.
    """
    ksize = max(3, ksize | 1) # Ensure odd integer
    return cv2.GaussianBlur(image_np, (ksize, ksize), 0)

def apply_denoise(image_np: np.ndarray, strength: str = "medium") -> np.ndarray:
    """
    Applies Bilateral Filter denoising.
    """
    h_val = {"low": 5, "medium": 10, "high": 15}.get(strength.lower(), 10)
    return cv2.fastNlMeansDenoisingColored(image_np, None, h_val, h_val, 7, 21)

def convert_grayscale(image_np: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

def convert_sepia(image_np: np.ndarray) -> np.ndarray:
    kernel = np.array([[0.272, 0.534, 0.131],
                       [0.349, 0.686, 0.168],
                       [0.393, 0.769, 0.189]])
    sepia = cv2.transform(image_np, kernel)
    return np.clip(sepia, 0, 255).astype(np.uint8)

def rotate_flip_image(image_np: np.ndarray, angle: int = 0, flip_h: bool = False, flip_v: bool = False) -> np.ndarray:
    img = image_np.copy()
    if angle == 90:
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    elif angle == 180:
        img = cv2.rotate(img, cv2.ROTATE_180)
    elif angle == 270:
        img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

    if flip_h and flip_v:
        img = cv2.flip(img, -1)
    elif flip_h:
        img = cv2.flip(img, 1)
    elif flip_v:
        img = cv2.flip(img, 0)

    return img

def crop_image(image_np: np.ndarray, x: int, y: int, width: int, height: int) -> np.ndarray:
    h, w = image_np.shape[:2]
    x = max(0, min(x, w - 1))
    y = max(0, min(y, h - 1))
    w_crop = min(width, w - x)
    h_crop = min(height, h - y)
    return image_np[y:y+h_crop, x:x+w_crop]

def resize_upscale_image(image_np: np.ndarray, target_w: int, target_h: int, algorithm: str = "bicubic", scale_factor: int = 1) -> np.ndarray:
    h, w = image_np.shape[:2]
    if scale_factor > 1:
        target_w = w * scale_factor
        target_h = h * scale_factor

    interp = cv2.INTER_CUBIC if algorithm.lower() == "bicubic" else cv2.INTER_LANCZOS4
    resized = cv2.resize(image_np, (target_w, target_h), interpolation=interp)

    if scale_factor > 1 and algorithm.lower() == "ai":
        # Apply AI micro-detail enhancement filter pass over upscaled image
        gaussian = cv2.GaussianBlur(resized, (0, 0), 1.5)
        resized = cv2.addWeighted(resized, 1.25, gaussian, -0.25, 0)

    return resized

def remove_background(image_np: np.ndarray, bg_mode: str = "transparent", bg_color_hex: str = "#FFFFFF") -> np.ndarray:
    """
    Foreground segmentation using GrabCut algorithm to generate alpha mask.
    Returns 4-channel BGRA image (transparent) or 3-channel BGR with solid background.
    """
    h, w = image_np.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    # Initial rectangle margin around image borders
    margin_w = int(w * 0.05)
    margin_h = int(h * 0.05)
    rect = (margin_w, margin_h, w - 2 * margin_w, h - 2 * margin_h)

    cv2.grabCut(image_np, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

    # Smooth edge alpha mask using Gaussian blur
    alpha_mask = cv2.GaussianBlur(mask2 * 255, (5, 5), 0)

    if bg_mode == "transparent":
        # Create BGRA image
        b, g, r = cv2.split(image_np)
        bgra = cv2.merge([b, g, r, alpha_mask])
        return bgra
    else:
        # Parse hex color
        hex_clean = bg_color_hex.lstrip('#')
        r_c = int(hex_clean[0:2], 16)
        g_c = int(hex_clean[2:4], 16)
        b_c = int(hex_clean[4:6], 16)

        bg_img = np.full_like(image_np, (b_c, g_c, r_c), dtype=np.uint8)
        alpha_3d = alpha_mask[:, :, np.newaxis] / 255.0
        composited = (image_np * alpha_3d + bg_img * (1.0 - alpha_3d)).astype(np.uint8)
        return composited
