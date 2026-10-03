import React, { useState } from 'react';
import { X, Download, Sliders, Check } from 'lucide-react';
import { ImageItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageItem;
}

const PRESETS = [
  { name: 'Instagram Portrait', aspect: '4:5', dims: '1080 × 1350', format: 'JPEG', quality: 90 },
  { name: 'Instagram Square', aspect: '1:1', dims: '1080 × 1080', format: 'JPEG', quality: 90 },
  { name: 'Instagram Story / Reel', aspect: '9:16', dims: '1080 × 1920', format: 'JPEG', quality: 90 },
  { name: 'YouTube Thumbnail', aspect: '16:9', dims: '1280 × 720', format: 'JPEG', quality: 95 },
  { name: 'LinkedIn Banner', aspect: '4:1', dims: '1584 × 396', format: 'PNG', quality: 100 },
  { name: 'Website Optimized', aspect: 'Original', dims: '1920 × 1080', format: 'WEBP', quality: 85 },
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, image }) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [format, setFormat] = useState('JPEG');
  const [quality, setQuality] = useState(90);
  const [removeMetadata, setRemoveMetadata] = useState(true);

  if (!isOpen) return null;

  const handleExportDownload = () => {
    // Download image from backend
    const link = document.createElement('a');
    link.href = `http://localhost:8080/api/images/${image.id}/bytes`;
    link.download = `exported_${selectedPreset.name.toLowerCase().replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const estimatedSizeMb = ((image.fileSize * (quality / 100)) / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Download className="w-5 h-5 text-brand-500" />
            <span>Export & Platform Optimization</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Platform Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setSelectedPreset(p);
                    setFormat(p.format);
                    setQuality(p.quality);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPreset.name === p.name
                      ? 'bg-brand-600/15 border-brand-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{p.name}</span>
                    {selectedPreset.name === p.name && <Check className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">{p.dims} • {p.aspect}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Settings */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="JPEG">JPEG (.jpg)</option>
                <option value="PNG">PNG (.png)</option>
                <option value="WEBP">WebP (.webp)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                <span>Compression Quality</span>
                <span className="text-brand-400 font-mono">{quality}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Estimated Details */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-4 py-3 rounded-xl border border-slate-850">
            <div>
              Estimated File Size: <span className="font-bold text-white font-mono">{estimatedSizeMb} MB</span>
            </div>
            <div>
              Dimensions: <span className="font-bold text-white font-mono">{selectedPreset.dims}</span>
            </div>
          </div>

          {/* Download Action */}
          <button
            onClick={handleExportDownload}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Optimized Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
