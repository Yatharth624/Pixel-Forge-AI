# PixelForge AI — Architecture & System Design Documentation

This document describes the system design, microservice interaction topology, data storage strategy, security implementation, and error-handling architecture for **PixelForge AI**.

---

## 1. System Architecture Diagram

```text
┌────────────────────────────────────────────────────────┐
│               React 18 + TypeScript UI                 │
│         (Tailwind CSS, Vite, TanStack Query)           │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs (HTTP / JSON / MultiPart)
                            ▼
┌────────────────────────────────────────────────────────┐
│                Spring Boot 3 Backend                   │
│        (Spring Security, JWT, Spring Data JPA)         │
└─────────────┬─────────────────────────────┬────────────┘
              │                             │
    JPA / JDBC│                             │ HTTP RestClient
              ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│  PostgreSQL / H2 Database │ │  Python FastAPI Service   │
│  (Users, Images, Versions)│ │ (OpenCV, Pillow, PyTorch) │
└───────────────────────────┘ └───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│   Object File Storage     │
│   (Local Disk / AWS S3)   │
└───────────────────────────┘
```

---

## 2. Microservice Responsibilities

### Frontend (React 18 + Vite + TS)
- Single Page SaaS Application with responsive UI.
- Interactive canvas controls, Before/After split-screen slider, 256-bin RGB Histogram rendering, Quality Gauge.

### Java Spring Boot 3 Backend
- **Authentication & Security**: User registration, login, JWT token issuance & validation, BCrypt password hashing.
- **Resource Management**: Projects, Images, Version Lineage, Processing Job Queue, REST API routing.
- **Storage Abstraction**: SHA-256 duplicate checking, key generation, version storage management.

### Python FastAPI CV Service
- Computes computationally intensive computer vision tasks: Laplacian variance blur detection, luminance statistics, K-Means color clustering, GrabCut background removal, Lanczos & AI upscaling, natural language command parsing.

---

## 3. Database Schema (PostgreSQL / H2)

- **`users`**: `id` (UUID), `email`, `password`, `full_name`, `role`, `created_at`
- **`projects`**: `id` (UUID), `name`, `description`, `user_id` (FK), `created_at`
- **`images`**: `id` (UUID), `filename`, `storage_key`, `content_type`, `file_size`, `sha256_hash`, `phash`, `favorite`, `current_version_number`, `user_id` (FK), `project_id` (FK)
- **`image_versions`**: `id` (UUID), `version_number`, `storage_key`, `operation_name`, `operations_json`, `parent_version_id`, `file_size`, `sha256_hash`, `image_id` (FK)
- **`image_analysis`**: `id` (UUID), `width`, `height`, `aspect_ratio`, `quality_score`, `blur_classification`, `laplacian_variance`, `dominant_colors_json`, `histograms_json`, `ai_analysis_json`, `image_id` (FK)
- **`processing_jobs`**: `id` (UUID), `job_type`, `status`, `progress`, `params_json`, `error_message`, `user_id` (FK), `image_id` (FK)

---

## 4. Security & Quality Safeguards

1. **Stateless JWT Security**: Passwords hashed using BCrypt. Secret keys configured via environment variables.
2. **AI Operation Whitelist**: Natural language prompts parsed into structured JSON operations checked against strict whitelist (`crop`, `brightness`, `contrast`, `sharpen`, `denoise`, `remove_background`). Arbitrary code execution is strictly prevented.
3. **Non-Destructive Versioning**: Original uploaded binaries are never overwritten; every edit spawns a new version node.
