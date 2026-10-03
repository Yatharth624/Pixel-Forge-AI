import numpy as np
import cv2
from PIL import Image
import pytest

from app.blur_detection import calculate_laplacian_variance, classify_blur
from app.brightness_contrast import analyze_brightness_contrast, generate_histograms
from app.color_extraction import extract_dominant_colors
from app.quality_scorer import calculate_quality_score
from app.smart_crop import calculate_smart_crop
from app.similarity import compute_perceptual_hashes, calculate_similarity_score
from app.ai_assistant import parse_natural_language_command

@pytest.fixture
def sample_image():
    # Synthetic 200x200 RGB image with shapes
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    cv2.circle(img, (100, 100), 50, (0, 0, 255), -1) # Red circle
    cv2.rectangle(img, (20, 20), (60, 60), (0, 255, 0), -1) # Green square
    return img

def test_blur_detection(sample_image):
    var = calculate_laplacian_variance(sample_image)
    assert var > 0.0
    res = classify_blur(var)
    assert "classification" in res
    assert "sharpness_score" in res

def test_brightness_contrast(sample_image):
    bc = analyze_brightness_contrast(sample_image)
    assert 0 <= bc["brightness_percentage"] <= 100
    assert 0 <= bc["contrast_percentage"] <= 100
    hist = generate_histograms(sample_image)
    assert len(hist["red"]) == 256
    assert len(hist["luminance"]) == 256

def test_color_extraction(sample_image):
    colors = extract_dominant_colors(sample_image, num_colors=3)
    assert len(colors) > 0
    assert "hex" in colors[0]
    assert "percentage" in colors[0]

def test_quality_scorer(sample_image):
    score_data = calculate_quality_score(sample_image)
    assert 0 <= score_data["overall_score"] <= 100
    assert "breakdown" in score_data

def test_smart_crop(sample_image):
    crop_res = calculate_smart_crop(sample_image, target_aspect="1:1")
    assert crop_res["crop_box"]["width"] == crop_res["crop_box"]["height"]

def test_perceptual_similarity(sample_image):
    pil_img = Image.fromarray(cv2.cvtColor(sample_image, cv2.COLOR_BGR2RGB))
    hashes = compute_perceptual_hashes(pil_img)
    score = calculate_similarity_score(hashes["phash"], hashes["phash"])
    assert score == 100.0

def test_ai_command_parser():
    res = parse_natural_language_command("Make this suitable for Instagram and sharpen slightly")
    assert any(op["type"] == "crop" for op in res["operations"])
    assert any(op["type"] == "sharpen" for op in res["operations"])
