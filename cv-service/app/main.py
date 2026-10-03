import io
import base64
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.blur_detection import calculate_laplacian_variance, classify_blur
from app.brightness_contrast import analyze_brightness_contrast, generate_histograms
from app.color_extraction import extract_dominant_colors
from app.quality_scorer import calculate_quality_score
from app.smart_crop import calculate_smart_crop, ASPECT_RATIOS
from app.enhancement_pipeline import apply_auto_enhancement
from app.image_editor import (
    adjust_brightness_contrast, adjust_saturation, apply_sharpen,
    apply_blur, apply_denoise, convert_grayscale, convert_sepia,
    rotate_flip_image, crop_image, resize_upscale_image, remove_background
)
from app.similarity import compute_sha256, compute_perceptual_hashes, calculate_similarity_score
from app.ai_assistant import parse_natural_language_command, generate_ai_analysis

app = FastAPI(
    title="PixelForge AI - Computer Vision Microservice",
    version="1.0.0",
    description="High performance image processing and computer vision service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def decode_image_bytes(file_bytes: bytes) -> tuple[np.ndarray, Image.Image]:
    """Decodes image bytes to OpenCV BGR numpy array and PIL Image."""
    try:
        pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        image_np = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        return image_np, pil_img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupt image data: {str(e)}")

def encode_image_response(image_np: np.ndarray, format_str: str = "PNG") -> str:
    """Encodes image numpy array to Base64 string for API response transmission."""
    if len(image_np.shape) == 4 and image_np.shape[2] == 4:
        # BGRA -> RGBA
        rgb_img = cv2.cvtColor(image_np, cv2.COLOR_BGRA2RGBA)
        pil_img = Image.fromarray(rgb_img, mode="RGBA")
    elif len(image_np.shape) == 3 and image_np.shape[2] == 3:
        # BGR -> RGB
        rgb_img = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_img, mode="RGB")
    else:
        pil_img = Image.fromarray(image_np)

    buf = io.BytesIO()
    fmt = "PNG" if format_str.upper() in ["PNG", "WEBP"] else "JPEG"
    pil_img.save(buf, format=fmt)
    b64_bytes = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/{fmt.lower()};base64,{b64_bytes}"

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "PixelForge CV Microservice"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    content = await file.read()
    image_np, pil_img = decode_image_bytes(content)

    height, width = image_np.shape[:2]
    aspect_ratio = round(width / float(height), 2)
    file_size = len(content)

    lap_var = calculate_laplacian_variance(image_np)
    blur_analysis = classify_blur(lap_var)
    bc_analysis = analyze_brightness_contrast(image_np)
    histograms = generate_histograms(image_np)
    dominant_colors = extract_dominant_colors(image_np, num_colors=5)
    quality_assessment = calculate_quality_score(image_np)
    ai_breakdown = generate_ai_analysis(image_np, file.filename or "uploaded_image")
    hashes = compute_perceptual_hashes(pil_img)
    sha256_hash = compute_sha256(content)

    return {
        "success": True,
        "metadata": {
            "width": width,
            "height": height,
            "aspect_ratio": f"{width}:{height} ({aspect_ratio})",
            "file_size": file_size,
            "format": pil_img.format or "JPEG",
            "color_space": pil_img.mode
        },
        "quality_assessment": quality_assessment,
        "blur_analysis": blur_analysis,
        "brightness_contrast": bc_analysis,
        "dominant_colors": dominant_colors,
        "histograms": histograms,
        "ai_analysis": ai_breakdown,
        "hashes": {
            "sha256": sha256_hash,
            "ahash": hashes["ahash"],
            "dhash": hashes["dhash"],
            "phash": hashes["phash"]
        }
    }

@app.post("/enhance")
async def enhance_image(file: UploadFile = File(...)):
    content = await file.read()
    image_np, _ = decode_image_bytes(content)

    enhanced_np, report = apply_auto_enhancement(image_np)
    b64_data = encode_image_response(enhanced_np)

    return {
        "success": True,
        "report": report,
        "enhanced_image_base64": b64_data
    }

@app.post("/crop")
async def smart_crop_endpoint(file: UploadFile = File(...), target_aspect: str = Form("1:1")):
    content = await file.read()
    image_np, _ = decode_image_bytes(content)

    crop_info = calculate_smart_crop(image_np, target_aspect)
    box = crop_info["crop_box"]
    cropped_np = crop_image(image_np, box["x"], box["y"], box["width"], box["height"])
    b64_data = encode_image_response(cropped_np)

    return {
        "success": True,
        "crop_info": crop_info,
        "cropped_image_base64": b64_data
    }

class EditRequest(BaseModel):
    brightness: float = 0.0
    contrast: float = 0.0
    saturation: float = 0.0
    sharpen_strength: str = "none" # none, low, medium, high
    blur_ksize: int = 0
    denoise_strength: str = "none" # none, low, medium, high
    grayscale: bool = False
    sepia: bool = False
    rotate_angle: int = 0
    flip_h: bool = False
    flip_v: bool = False

@app.post("/edit")
async def edit_image(
    file: UploadFile = File(...),
    brightness: float = Form(0.0),
    contrast: float = Form(0.0),
    saturation: float = Form(0.0),
    sharpen_strength: str = Form("none"),
    blur_ksize: int = Form(0),
    denoise_strength: str = Form("none"),
    grayscale: bool = Form(False),
    sepia: bool = Form(False),
    rotate_angle: int = Form(0),
    flip_h: bool = Form(False),
    flip_v: bool = Form(False)
):
    content = await file.read()
    image_np, _ = decode_image_bytes(content)

    result = image_np.copy()

    if brightness != 0 or contrast != 0:
        result = adjust_brightness_contrast(result, brightness, contrast)
    if saturation != 0:
        result = adjust_saturation(result, saturation)
    if sharpen_strength != "none":
        result = apply_sharpen(result, sharpen_strength)
    if blur_ksize > 0:
        result = apply_blur(result, blur_ksize)
    if denoise_strength != "none":
        result = apply_denoise(result, denoise_strength)
    if grayscale:
        result = convert_grayscale(result)
    elif sepia:
        result = convert_sepia(result)
    if rotate_angle != 0 or flip_h or flip_v:
        result = rotate_flip_image(result, rotate_angle, flip_h, flip_v)

    b64_data = encode_image_response(result)
    return {
        "success": True,
        "edited_image_base64": b64_data
    }

@app.post("/remove-background")
async def bg_removal_endpoint(
    file: UploadFile = File(...),
    bg_mode: str = Form("transparent"),
    bg_color_hex: str = Form("#FFFFFF")
):
    content = await file.read()
    image_np, _ = decode_image_bytes(content)

    processed_np = remove_background(image_np, bg_mode, bg_color_hex)
    b64_data = encode_image_response(processed_np, format_str="PNG" if bg_mode == "transparent" else "JPEG")

    return {
        "success": True,
        "bg_mode": bg_mode,
        "processed_image_base64": b64_data
    }

@app.post("/upscale")
async def upscale_endpoint(
    file: UploadFile = File(...),
    scale_factor: int = Form(2),
    algorithm: str = Form("bicubic") # bicubic, lanczos, ai
):
    content = await file.read()
    image_np, _ = decode_image_bytes(content)

    h, w = image_np.shape[:2]
    upscaled_np = resize_upscale_image(image_np, w * scale_factor, h * scale_factor, algorithm, scale_factor)
    b64_data = encode_image_response(upscaled_np)

    return {
        "success": True,
        "original_resolution": f"{w}x{h}",
        "new_resolution": f"{w * scale_factor}x{h * scale_factor}",
        "scale_factor": scale_factor,
        "algorithm": algorithm,
        "upscaled_image_base64": b64_data
    }

class SimilarityRequest(BaseModel):
    phash1: str
    phash2: str

@app.post("/similarity")
def similarity_check(req: SimilarityRequest):
    score = calculate_similarity_score(req.phash1, req.phash2)
    return {
        "success": True,
        "phash1": req.phash1,
        "phash2": req.phash2,
        "similarity_percentage": score,
        "is_visually_similar": score >= 85.0
    }

class AICommandRequest(BaseModel):
    prompt: str

@app.post("/ai-command")
def ai_command_endpoint(req: AICommandRequest):
    parsed = parse_natural_language_command(req.prompt)
    return {
        "success": True,
        "parsed_operations": parsed
    }
