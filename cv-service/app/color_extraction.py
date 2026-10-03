import cv2
import numpy as np
from sklearn.cluster import KMeans

def extract_dominant_colors(image_np: np.ndarray, num_colors: int = 5) -> list[dict]:
    """
    Extracts dominant colors using K-means clustering on downsampled image pixels.
    Returns RGB, HEX, and percentage coverage.
    """
    if len(image_np.shape) == 2:
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_GRAY2RGB)
    else:
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)

    # Downsample for fast clustering
    h, w, _ = image_rgb.shape
    max_dim = 150
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        resized = cv2.resize(image_rgb, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    else:
        resized = image_rgb

    pixels = resized.reshape(-1, 3)

    num_clusters = min(num_colors, len(pixels))
    kmeans = KMeans(n_clusters=num_clusters, n_init=5, random_state=42)
    labels = kmeans.fit_predict(pixels)
    centroids = kmeans.cluster_centers_

    # Calculate cluster percentages
    counts = np.bincount(labels)
    total_pixels = len(labels)

    color_info = []
    for i in range(len(centroids)):
        r, g, b = [int(c) for c in centroids[i]]
        percentage = round((counts[i] / total_pixels) * 100, 1)
        hex_code = f"#{r:02X}{g:02X}{b:02X}"

        color_info.append({
            "hex": hex_code,
            "rgb": [r, g, b],
            "percentage": percentage
        })

    # Sort by percentage descending
    color_info.sort(key=lambda x: x["percentage"], reverse=True)
    return color_info
