import cv2
import numpy as np

def calculate_laplacian_variance(image_np: np.ndarray) -> float:
    """
    Calculates the Variance of Laplacian for an image array.
    
    Mathematical formula:
    Variance = Var( \nabla^2 I )
    where \nabla^2 I is the 2D Laplacian operator convolution with kernel:
    [[0,  1, 0],
     [1, -4, 1],
     [0,  1, 0]]
    """
    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_np
        
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = float(laplacian.var())
    return variance

def classify_blur(laplacian_var: float, threshold: float = 100.0) -> dict:
    """
    Classifies image sharpness based on Laplacian variance threshold.
    """
    if laplacian_var < threshold * 0.3:
        classification = "Heavily Blurred"
        score = max(0.0, min(100.0, (laplacian_var / (threshold * 0.3)) * 30))
    elif laplacian_var < threshold:
        classification = "Moderately Blurred"
        score = 30.0 + ((laplacian_var - threshold * 0.3) / (threshold * 0.7)) * 35
    elif laplacian_var < threshold * 3.0:
        classification = "Slightly Blurred / Normal"
        score = 65.0 + ((laplacian_var - threshold) / (threshold * 2.0)) * 25
    else:
        classification = "Pristine / Very Sharp"
        score = min(100.0, 90.0 + (laplacian_var / (threshold * 10.0)) * 10)

    return {
        "laplacian_variance": round(laplacian_var, 2),
        "threshold": threshold,
        "classification": classification,
        "sharpness_score": round(score, 1)
    }
