import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { ImageItem } from '../types';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newImage: ImageItem) => void;
  projectId?: string;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  projectId,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('File must be a valid image (JPG, PNG, WEBP, TIFF)');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', projectId);

    try {
      const res = await apiClient.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onUploadSuccess(res.data.data);
        onClose();
      } else {
        setError(res.data.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Upload className="w-5 h-5 text-brand-500" />
            <span>Upload Image to PixelForge</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center space-x-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/tiff"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            <div className="w-14 h-14 rounded-2xl bg-brand-600/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
              <FileImage className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-slate-200 mb-1">
              Drag & drop image here, or <span className="text-brand-400">browse</span>
            </p>
            <p className="text-xs text-slate-500">
              Supports JPG, PNG, WEBP, TIFF (Max 50MB)
            </p>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading & Generating SHA-256 Hash...</span>
                <span className="font-semibold text-brand-400">Processing</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
