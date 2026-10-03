import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ImageItem, ProcessingJob } from '../types';
import { ImageUploadModal } from '../components/ImageUploadModal';
import {
  ImageIcon,
  Wand2,
  Cpu,
  HardDrive,
  Upload,
  BarChart3,
  FolderPlus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [imgRes, jobsRes] = await Promise.all([
        apiClient.get('/images'),
        apiClient.get('/jobs')
      ]);
      if (imgRes.data.success) setImages(imgRes.data.data);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalStorageMb = (images.reduce((acc, img) => acc + img.fileSize, 0) / (1024 * 1024)).toFixed(1);
  const enhancedCount = images.filter((img) => img.currentVersionNumber > 1).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Computer Vision & AI Platform Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.fullName || 'Engineer'}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Upload, analyze image quality, perform Laplacian blur detection, K-Means dominant color extraction, and execute AI super-resolution upscaling.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/25 flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          {images.length > 0 && (
            <button
              onClick={() => navigate(`/editor/${images[0].id}`)}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <Wand2 className="w-4 h-4 text-brand-400" />
              <span>Enhance Image</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Images Processed</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">{images.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Uploaded & stored in object repository</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Images Enhanced</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">{enhancedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Multi-version transformations</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Analyses</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">{jobs.length > 0 ? jobs.length : images.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Metrics & computer vision passes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Used</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">{totalStorageMb} MB</div>
          <div className="text-[11px] text-slate-500 mt-1">Local / S3 object storage</div>
        </div>
      </div>

      {/* Main Grid: Recent Images & Recent Processing Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Images</h2>
            <button
              onClick={() => navigate('/images')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {images.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400">No images uploaded yet</p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Upload First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.slice(0, 6).map((img) => (
                <div
                  key={img.id}
                  onClick={() => navigate(`/analyze/${img.id}`)}
                  className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
                >
                  <div className="h-36 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={`http://localhost:8080/api/images/${img.id}/bytes`}
                      alt={img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-900/90 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                      v{img.currentVersionNumber}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-slate-200 truncate">{img.filename}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {(img.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processing Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Processing</h2>
            <button
              onClick={() => navigate('/processing')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Processing Center
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p>No active background jobs queued</p>
              </div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850"
                >
                  <div className="flex items-center space-x-3">
                    {job.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-200">{job.jobType.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{job.imageName || 'Image job'}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => fetchData()}
      />
    </div>
  );
};
