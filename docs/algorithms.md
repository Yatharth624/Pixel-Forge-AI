# PixelForge AI — Technical & Algorithmic Documentation

This document outlines the computer vision algorithms, mathematical formulas, and data structures implemented across **PixelForge AI**.

---

## 1. Blur Detection (Variance of Laplacian)

### Problem Definition
Determining whether an image suffers from out-of-focus blur or motion blur without requiring deep network inference.

### Approach
We use the 2D Laplacian operator $\nabla^2 I$ to compute the second-order spatial derivative of the grayscale image $I(x, y)$:

$$\nabla^2 I = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}$$

In discrete space, this is evaluated using the 3x3 convolution kernel:

$$K_{lap} = \begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$$

The **Variance of Laplacian** $Var(\nabla^2 I)$ measures edge sharpness across the image:

$$Var(\nabla^2 I) = \frac{1}{N} \sum_{x,y} \left( \nabla^2 I(x,y) - \mu_{\nabla^2 I} \right)^2$$

### Classification Thresholds
- **$Var < 30.0$**: Heavily Blurred
- **$30.0 \le Var < 100.0$**: Moderately Blurred
- **$100.0 \le Var < 300.0$**: Slightly Blurred / Normal
- **$Var \ge 300.0$**: Pristine / Very Sharp

### Complexity
- **Time Complexity**: $\mathcal{O}(W \times H)$ where $W, H$ are image dimensions.
- **Space Complexity**: $\mathcal{O}(W \times H)$ for the single-channel grayscale buffer.

---

## 2. Dominant Color Extraction (K-Means Clustering)

### Problem Definition
Identifying the $K$ primary dominant colors of an image and calculating their percentage area coverage.

### Algorithm Flow
1. **Downsampling**: Resize image to a maximum dimension of 150px preserving aspect ratio for computational efficiency.
2. **Color Space Representation**: Convert pixels to RGB vectors $\mathbf{x}_i \in \mathbb{R}^3$.
3. **Clustering Optimization**: Minimize the within-cluster sum of squares (WCSS):

$$\arg\min_{\mathbf{S}} \sum_{i=1}^{K} \sum_{\mathbf{x} \in S_i} \|\mathbf{x} - \boldsymbol{\mu}_i\|^2$$

4. **Percentage Calculation**:

$$P_k = \frac{|S_k|}{N} \times 100\%$$

### Complexity
- **Time Complexity**: $\mathcal{O}(N \cdot K \cdot d \cdot I)$ where $N$ is downsampled pixel count ($N \le 22500$), $K=5$, $d=3$, $I$ iterations.
- **Space Complexity**: $\mathcal{O}(N \cdot d)$.

---

## 3. Image Quality Scoring Model

### Equation & Weight Distribution
PixelForge AI derives a normalized quality score $Q \in [0, 100]$ using measurable objective properties:

$$Q = \text{clamp}\Big(0, 100, S_{\text{contrib}} + C_{\text{contrib}} + E_{\text{contrib}} + R_{\text{contrib}} - P_{\text{noise}} - P_{\text{blur}}\Big)$$

Where:
- **Sharpness Contribution** ($S_{\text{contrib}} \in [0, 30]$): Derived from $Var(\nabla^2 I)$.
- **Contrast Contribution** ($C_{\text{contrib}} \in [0, 25]$): Derived from standard deviation of luminance $\sigma_Y / 64.0$.
- **Exposure Contribution** ($E_{\text{contrib}} \in [0, 25]$): Distance from ideal 50% mean luminance:
  $$E_{\text{contrib}} = \max\left(0, 25 - \frac{|\mu_Y - 128|}{128} \times 25\right)$$
- **Resolution Contribution** ($R_{\text{contrib}} \in [0, 20]$): Megapixel density scaling up to 2MP.
- **Noise Penalty** ($P_{\text{noise}} \in [0, 15]$): High-frequency noise standard deviation $\sigma_{immer}$.
- **Blur Penalty** ($P_{\text{blur}} \in [0, 20]$): Applied if $Var(\nabla^2 I) < 100$.

---

## 4. Duplicate Detection & Perceptual Visual Similarity

### Exact Duplicate Detection
- **SHA-256 Checksum**: Calculates a 256-bit cryptographic hash of raw file byte content. Two files with matching SHA-256 hashes are 100% byte-for-byte identical.

### Visual Similarity (Perceptual Hashing)
- **Difference Hash (dHash)**: Tracks relative gradient differences between adjacent pixels on an 8x9 grid.
- **Perceptual Hash (pHash)**: Computes Discrete Cosine Transform (DCT) on 32x32 grayscale image, isolates low frequencies (8x8 matrix), and generates a 64-bit binary fingerprint.
- **Hamming Distance Similarity**:

$$\text{Similarity \%} = \frac{64 - D_{\text{Hamming}}(\mathbf{h}_1, \mathbf{h}_2)}{64} \times 100\%$$

---

## 5. Smart Crop (Saliency Focus Detection)

### Algorithm
1. Compute Spectral Residual Saliency map or Canny edge density map to locate ROI.
2. Determine saliency center of mass $(c_x, c_y)$ using image moments:

$$c_x = \frac{M_{10}}{M_{00}}, \quad c_y = \frac{M_{01}}{M_{00}}$$

3. Position target aspect ratio crop box $(W_{\text{crop}}, H_{\text{crop}})$ centered at $(c_x, c_y)$ and clamp within original image bounds.

---

## 6. Undo/Redo Version Lineage (Stack Data Structure)

### Operations Tree
- Each modification creates a new `ImageVersion` node pointing to `parentVersionId`.
- Undo/Redo state is maintained via a doubly-linked list or version stack:

$$\text{Original } (v1) \longrightarrow \text{Auto Enhance } (v2) \longrightarrow \text{Smart Crop } (v3)$$

- Restoring $v1$ generates $v4$ with lineage metadata `{"restoredFrom": 1}` keeping historic nodes immutable.
