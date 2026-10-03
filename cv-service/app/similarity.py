import hashlib
import imagehash
from PIL import Image
import numpy as np

def compute_sha256(file_bytes: bytes) -> str:
    """Calculates exact SHA-256 checksum hash of binary data."""
    return hashlib.sha256(file_bytes).hexdigest()

def compute_perceptual_hashes(pil_image: Image.Image) -> dict:
    """
    Calculates perceptual image hashes:
    - aHash: Average Hash
    - dHash: Difference Hash
    - pHash: Perceptual Hash (DCT based)
    """
    ahash = str(imagehash.average_hash(pil_image))
    dhash = str(imagehash.dhash(pil_image))
    phash = str(imagehash.phash(pil_image))

    return {
        "ahash": ahash,
        "dhash": dhash,
        "phash": phash
    }

def calculate_similarity_score(phash1_str: str, phash2_str: str) -> float:
    """
    Calculates visual similarity percentage based on Hamming distance between 64-bit perceptual hashes.
    Max Hamming Distance = 64.
    Similarity = ((64 - distance) / 64) * 100%
    """
    try:
        h1 = imagehash.hex_to_hash(phash1_str)
        h2 = imagehash.hex_to_hash(phash2_str)
        hamming_dist = h1 - h2
        similarity_pct = max(0.0, min(100.0, ((64.0 - hamming_dist) / 64.0) * 100.0))
        return round(similarity_pct, 1)
    except Exception:
        return 0.0
