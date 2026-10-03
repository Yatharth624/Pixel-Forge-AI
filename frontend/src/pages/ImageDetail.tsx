import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ImageItem, ImageAnalysisResponse } from '../types';
import { QualityScoreGauge } from '../components/QualityScoreGauge';
import { HistogramChart } from '../components/HistogramChart';
import { ColorPalette } from '../components/ColorPalette';
import { Wand2, Download, ArrowLeft, Bot, Sparkles, Tag, Eye } from 'lucide-react';
import { ExportModal } from '../components/ExportModal';

export const ImageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<ImageItem | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!id || id === 'active') return;
      try {
        const [imgRes, analysisRes] = await Promise.all([
          apiClient.get(`/images/${id}`),
          apiClient.get(`/images/${id}/analysis`)
        ]);
        if (imgRes.data.success) setImage(imgRes.data.data);
        if (analysisRes.data.success) setAnalysis(analysisRes.data.data);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisData();
  }, [id]);

  if (id === 'active') {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-sm">Please select an image from the gallery to view analysis.</p>
        <button
          onClick={() => navigate('/images')}
          className="mt-4 bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          Go to Image Gallery
        </button>
      </div>
    );
  }

  if (loading || !image) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs">Analyzing Image & Calculating Computer Vision Metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/editor/${image.id}`)}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/25 flex items-center space-x-2 transition-all"
          >
            <Wand2 className="w-4 h-4" />
            <span>Open in Editor</span>
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Preset</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Large Preview & Computer Vision AI Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 shadow-xl">
            <div className="h-80 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative">
              <img
                src={`http://localhost:8080/api/images/${image.id}/bytes`}
                alt={image.filename}
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute bottom-3 left-3 bg-slate-900/90 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-md backdrop-blur-sm">
                {analysis?.width || 0} × {analysis?.height || 0} ({analysis?.aspectRatio || '1:1'})
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-850 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Filename</span>
                <span className="font-bold text-white font-mono">{image.filename}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SHA-256 Hash</span>
                <span className="font-mono text-slate-300">{image.sha256Hash.substring(0, 16)}...</span>
              </div>
              {image.phash && (
                <div className="flex justify-between text-slate-400">
                  <span>Perceptual Hash (pHash)</span>
                  <span className="font-mono text-slate-300">{image.phash}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Computer Vision Summary */}
          {analysis?.aiAnalysis && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-brand-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Scene Analysis & Vision Tags</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                {analysis.aiAnalysis.description}
              </p>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Suggested Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.aiAnalysis.suggested_tags?.map((t) => (
                    <span key={t} className="bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Generated Alt Text</span>
                <p className="text-[11px] text-slate-400 italic font-mono bg-slate-950 p-2 rounded-lg border border-slate-850">
                  "{analysis.aiAnalysis.alt_text}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quantitative Metrics, Histograms, Color Palette */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quality Score Gauge */}
          {analysis && (
            <QualityScoreGauge
              score={analysis.qualityScore}
              blurClassification={analysis.blurClassification}
              exposureClassification={analysis.exposureClassification}
              contrastClassification={analysis.contrastClassification}
              noiseLevel={analysis.noiseLevel}
            />
          )}

          {/* Color Histogram */}
          {analysis?.histograms && (
            <HistogramChart histograms={analysis.histograms} />
          )}

          {/* Dominant Colors */}
          {analysis?.dominantColors && (
            <ColorPalette colors={analysis.dominantColors} />
          )}
        </div>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        image={image}
      />
    </div>
  );
};
