# PixelForge AI — Intelligent Image Enhancement & Computer Vision Platform

PixelForge AI is a production-quality full-stack web application and computer-vision microservice platform built to showcase high-level software engineering, algorithmic problem solving, REST API design, microservices architecture, and UI/UX design.

---

## 🌟 Key Capabilities

1. **Deterministic Quality Scoring**: Multi-metric quality assessment score ($0 - 100$) based on Laplacian variance, contrast deviation, luminance exposure balance, megapixel resolution density, noise estimation, and blur penalties.
2. **Blur Detection (Variance of Laplacian)**: Edge derivative analysis calculating second-order spatial Laplacian convolution $Var(\nabla^2 I)$ to classify image sharpness.
3. **K-Means Dominant Color Clustering**: Unsupervised K-means clustering in downsampled RGB/LAB color space extracting primary hex swatches and percentage area coverage.
4. **Intelligent Auto-Enhancement**: Adaptive pipeline analyzing initial metrics before applying custom gamma exposure correction, CLAHE contrast enhancement, bilateral denoising, unsharp mask sharpening, and HSV saturation boost.
5. **Smart Crop (Saliency ROI Focus)**: Spectral residual saliency and edge-density center-of-mass detection computing aspect ratio bounding boxes ($1:1, 4:5, 16:9, 9:16, 3:2, 2:3$).
6. **Perceptual Visual Similarity & SHA-256 Duplicate Detection**: Cryptographic binary hashing alongside 64-bit DCT perceptual hashing ($pHash$) measuring Hamming distance similarity.
7. **AI Natural Language Assistant**: Safe natural language prompt parsing translating requests like *"Make this suitable for Instagram"* into validated structured operation schemas.
8. **Interactive Split-Screen Before/After Slider**: Real-time vertical drag divider for comparing original vs enhanced/edited images side-by-side.
9. **Version Lineage Tree & 1-Click Restore**: Non-destructive operation lineage tracking every modification as an immutable version node with instant historic restore.

---

## 🏗️ Architecture & Tech Stack

```text
React 18 + TS (Vite, Tailwind CSS, TanStack Query)
                   │
                   ▼ REST API (JWT Auth)
         Spring Boot 3 Java Backend
        (Spring Security, JPA, H2 / PG)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
Python FastAPI CV     Object Storage
 (OpenCV, Pillow)     (Local Disk / S3)
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6, TanStack Query, Axios.
- **Backend**: Java 17/21, Spring Boot 3, Spring Web, Spring Security, JWT, Spring Data JPA, H2 / PostgreSQL, Bean Validation.
- **Computer Vision Microservice**: Python 3.12, FastAPI, OpenCV, Pillow, NumPy, scikit-learn, imagehash, pytest.

---

## 🚀 Quick Start Guide

### 1. Run Python CV Microservice
```bash
cd cv-service
pip install -r requirements.txt
python -m pytest tests # Run CV unit test suite
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Run Java Spring Boot Backend
```bash
cd backend
mvn test # Run Spring Boot integration tests
mvn spring-boot:run
```

### 3. Run React Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Compose Setup
```bash
docker compose up --build
```

---

## 📚 Technical Documentation

- [Algorithm Implementation & Math Documentation](docs/algorithms.md)
- [System Architecture & Design Document](docs/architecture.md)

---

## 🧪 Testing Summary

- **Python CV Microservice**: 7/7 unit tests passing ($100\%$).
- **Spring Boot Backend**: Context loading & JWT registration/login tests passing ($100\%$).
- **React Frontend**: TypeScript build compilation passing with $0$ errors.
