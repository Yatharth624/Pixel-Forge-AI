import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ImageItem, ImageVersion } from '../types';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { VersionTimeline } from '../components/VersionTimeline';
import { ExportModal } from '../components/ExportModal';
import {
  Wand2,
  Crop,
  Sliders,
  Maximize2,
  Scissors,
  RotateCcw,
  Save,
  Download,
  ArrowLeft,
  Sparkles,
  Check,
  Undo,
  Redo
} from 'lucide-react';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<ImageItem | null>(null);
  const [versions, setVersions] = useState<ImageVersion[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'auto' | 'crop' | 'adjust' | 'upscale' | 'bg'>('auto');
  const [loading, setLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Manual Adjustments State
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpenStrength, setSharpenStrength] = useState('none');
  const [blurKsize, setBlurKsize] = useState(0);
  const [denoiseStrength, setDenoiseStrength] = useState('none');
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);

  // Background removal mode
  const [bgMode, setBgMode] = useState('transparent');
  const [bgColorHex, setBgColorHex] = useState('#FFFFFF');

  // Upscale mode
  const [scaleFactor, setScaleFactor] = useState(2);
  const [upscaleAlgo, setUpscaleAlgo] = useState('bicubic');

  const fetchImageData = async (imageId: string) => {
    try {
      const [imgRes, verRes] = await Promise.all([
        apiClient.get(`/images/${imageId}`),
        apiClient.get(`/images/${imageId}/versions`)
      ]);

      if (imgRes.data.success) {
        setImage(imgRes.data.data);
        const timestamp = new Date().getTime();
        setOriginalImageUrl(`http://localhost:8080/api/images/${imageId}/bytes?version=1&t=${timestamp}`);
        setCurrentImageUrl(`http://localhost:8080/api/images/${imageId}/bytes?t=${timestamp}`);
      }
      if (verRes.data.success) {
        setVersions(verRes.data.data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (id && id !== 'active') {
      fetchImageData(id);
    }
  }, [id]);

  if (!id || id === 'active' || !image) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-sm">Please select an image from the gallery to open in the editor.</p>
        <button
          onClick={() => navigate('/images')}
          className="mt-4 bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          Select Image
        </button>
      </div>
    );
  }

  const handleApplyAutoEnhance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/images/${image.id}/enhance`);
      if (res.data.success) {
        await fetchImageData(image.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApplySmartCrop = async (targetAspect: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/images/${image.id}/crop?targetAspect=${targetAspect}`);
      if (res.data.success) {
        await fetchImageData(image.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApplyManualEdits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('brightness', brightness.toString());
      params.append('contrast', contrast.toString());
      params.append('saturation', saturation.toString());
      params.append('sharpenStrength', sharpenStrength);
      params.append('blurKsize', blurKsize.toString());
      params.append('denoiseStrength', denoiseStrength);
      params.append('grayscale', grayscale.toString());
      params.append('sepia', sepia.toString());

      const res = await apiClient.post(`/images/${image.id}/edit`, params);
      if (res.data.success) {
        await fetchImageData(image.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBgRemoval = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('bgMode', bgMode);
      params.append('bgColorHex', bgColorHex);

      const res = await apiClient.post(`/images/${image.id}/remove-background`, params);
      if (res.data.success) {
        await fetchImageData(image.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApplyUpscale = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('scaleFactor', scaleFactor.toString());
      params.append('algorithm', upscaleAlgo);

      const res = await apiClient.post(`/images/${image.id}/upscale`, params);
      if (res.data.success) {
        await fetchImageData(image.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/images/${image.id}/versions/${versionId}/restore`);
      if (res.data.success) {
        await fetchImageData(image.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Editor</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white truncate max-w-xs">{image.filename}</span>
          <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded">
            v{image.currentVersionNumber}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExportOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Version</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tool Sidebar */}
        <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
          {/* Tool Tabs */}
          <div className="flex border-b border-slate-800 p-1 bg-slate-950/50">
            <button
              onClick={() => setActiveTab('auto')}
              className={`flex-1 py-2 text-center text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'auto' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setActiveTab('crop')}
              className={`flex-1 py-2 text-center text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'crop' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crop
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-2 text-center text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'adjust' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Adjust
            </button>
            <button
              onClick={() => setActiveTab('bg')}
              className={`flex-1 py-2 text-center text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'bg' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BG Remove
            </button>
            <button
              onClick={() => setActiveTab('upscale')}
              className={`flex-1 py-2 text-center text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'upscale' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upscale
            </button>
          </div>

          {/* Tool Controls Panel */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            {activeTab === 'auto' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex items-center space-x-2 text-brand-400">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">✨ Auto Enhancement</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Analyzes sharpness, contrast, exposure, noise, and color balance. Automatically calculates and applies a customized enhancement pipeline.
                  </p>
                </div>
                <button
                  onClick={handleApplyAutoEnhance}
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/25 transition-all text-xs"
                >
                  {loading ? 'Processing Pipeline...' : 'Execute ✨ Auto Enhance'}
                </button>
              </div>
            )}

            {activeTab === 'crop' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Smart Crop Aspect Ratios</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['1:1', '4:5', '16:9', '9:16', '3:2', '2:3'].map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => handleApplySmartCrop(aspect)}
                      disabled={loading}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-white">{aspect}</div>
                      <div className="text-[10px] text-slate-500">Saliency ROI Focus</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Brightness</span>
                    <span className="font-mono">{brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Contrast</span>
                    <span className="font-mono">{contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Saturation</span>
                    <span className="font-mono">{saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sharpen Strength</label>
                  <select
                    value={sharpenStrength}
                    onChange={(e) => setSharpenStrength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="none">None</option>
                    <option value="low">Low (Kernel Convolution)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Denoise Filter</label>
                  <select
                    value={denoiseStrength}
                    onChange={(e) => setDenoiseStrength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="none">None</option>
                    <option value="low">Low (Bilateral Filter)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={grayscale}
                      onChange={(e) => setGrayscale(e.target.checked)}
                      className="accent-brand-500 rounded"
                    />
                    <span>Grayscale</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sepia}
                      onChange={(e) => setSepia(e.target.checked)}
                      className="accent-brand-500 rounded"
                    />
                    <span>Sepia</span>
                  </label>
                </div>

                <button
                  onClick={handleApplyManualEdits}
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs mt-4"
                >
                  Apply Manual Edits
                </button>
              </div>
            )}

            {activeTab === 'bg' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Background Mode</label>
                  <select
                    value={bgMode}
                    onChange={(e) => setBgMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="transparent">Transparent PNG</option>
                    <option value="color">Solid Background Color</option>
                  </select>
                </div>

                {bgMode === 'color' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Background Color (HEX)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={bgColorHex}
                        onChange={(e) => setBgColorHex(e.target.value)}
                        className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={bgColorHex}
                        onChange={(e) => setBgColorHex(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleApplyBgRemoval}
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs"
                >
                  {loading ? 'Segmenting Foreground...' : 'Remove Background'}
                </button>
              </div>
            )}

            {activeTab === 'upscale' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scale Factor</label>
                  <select
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value={2}>2× Resolution</option>
                    <option value={4}>4× Resolution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Interpolation Algorithm</label>
                  <select
                    value={upscaleAlgo}
                    onChange={(e) => setUpscaleAlgo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="bicubic">Bicubic Interpolation</option>
                    <option value="lanczos">Lanczos-4 Resampling</option>
                    <option value="ai">AI Super-Resolution Detail Expansion</option>
                  </select>
                </div>

                <button
                  onClick={handleApplyUpscale}
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs"
                >
                  {loading ? 'Upscaling Image...' : 'Execute Upscale'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas with Before/After Slider */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="text-center text-slate-400 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-semibold">Executing Computer Vision Transformation...</p>
            </div>
          ) : (
            <div className="w-full h-full max-w-4xl flex items-center justify-center">
              <BeforeAfterSlider
                beforeImage={originalImageUrl}
                afterImage={currentImageUrl}
                beforeLabel="v1 ORIGINAL"
                afterLabel={`v${image.currentVersionNumber} ENHANCED`}
                className="w-full max-h-full"
              />
            </div>
          )}
        </div>

        {/* Right Version Timeline Panel */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 p-5 shrink-0 overflow-y-auto">
          <VersionTimeline
            versions={versions}
            currentVersionNumber={image.currentVersionNumber}
            onRestoreVersion={handleRestoreVersion}
          />
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
