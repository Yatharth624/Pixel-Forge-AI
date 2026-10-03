export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ImageItem {
  id: string;
  filename: string;
  contentType: string;
  fileSize: number;
  sha256Hash: string;
  phash?: string;
  favorite: boolean;
  currentVersionNumber: number;
  projectId?: string;
  projectName?: string;
  createdAt: string;
}

export interface ImageVersion {
  id: string;
  versionNumber: number;
  operationName: string;
  operationsJson?: string;
  parentVersionId?: string;
  fileSize: number;
  sha256Hash: string;
  createdAt: string;
}

export interface DominantColor {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
}

export interface Histograms {
  red: number[];
  green: number[];
  blue: number[];
  luminance: number[];
}

export interface QualityScoreBreakdown {
  sharpness_contrib: number;
  contrast_contrib: number;
  exposure_contrib: number;
  resolution_contrib: number;
  noise_penalty: number;
  blur_penalty: number;
}

export interface QualityAssessment {
  overall_score: number;
  sharpness_score: number;
  contrast_score: number;
  brightness_percentage: number;
  noise_sigma: number;
  noise_level: string;
  blur_classification: string;
  laplacian_variance: number;
  breakdown: QualityScoreBreakdown;
}

export interface AiAnalysisData {
  description: string;
  alt_text: string;
  suggested_tags: string[];
  detected_objects: string[];
  scene_description: string;
  accessibility_recommendations: string[];
}

export interface ImageAnalysisResponse {
  imageId: string;
  filename: string;
  width: number;
  height: number;
  aspectRatio: string;
  qualityScore: number;
  blurClassification: string;
  laplacianVariance: number;
  sharpnessScore: number;
  brightnessPercentage: number;
  exposureClassification: string;
  contrastPercentage: number;
  contrastClassification: string;
  noiseLevel: string;
  dominantColors: DominantColor[];
  histograms: Histograms;
  aiAnalysis: AiAnalysisData;
}

export interface ProcessingJob {
  id: string;
  jobType: 'ANALYSIS' | 'AUTO_ENHANCE' | 'SMART_CROP' | 'MANUAL_EDIT' | 'BACKGROUND_REMOVAL' | 'UPSCALE' | 'AI_ANALYSIS' | 'BATCH_PROCESS';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  paramsJson?: string;
  errorMessage?: string;
  imageId?: string;
  imageName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  imageCount: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  errorCode?: string;
  message: string;
  data: T;
}
