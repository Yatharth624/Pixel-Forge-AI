import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ImageItem } from '../types';
import { ImageUploadModal } from '../components/ImageUploadModal';
import {
  Image as ImageIcon,
  Star,
  Trash2,
  Wand2,
  BarChart3,
  Upload,
  Search,
  Filter
} from 'lucide-react';

export const ImagesGallery: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const res = await apiClient.get('/images');
      if (res.data.success) setImages(res.data.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await apiClient.post(`/images/${id}/favorite`);
      if (res.data.success) {
        setImages(images.map((img) => (img.id === id ? res.data.data : img)));
      }
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await apiClient.delete(`/images/${id}`);
      if (res.data.success) {
        setImages(images.filter((img) => img.id !== id));
      }
    } catch {
      // Ignore
    }
  };

  const filtered = images.filter((img) =>
    img.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Image Repository</h1>
          <p className="text-xs text-slate-400 mt-1">Manage, analyze, and transform your image assets</p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/25 flex items-center space-x-2 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter images by filename..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold px-3">{filtered.length} Images</div>
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No images found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload images to analyze brightness, contrast, Laplacian blur variance, and K-means dominant colors.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((img) => (
            <div
              key={img.id}
              onClick={() => navigate(`/analyze/${img.id}`)}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 shadow-md flex flex-col"
            >
              <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <img
                  src={`http://localhost:8080/api/images/${img.id}/bytes`}
                  alt={img.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  <button
                    onClick={(e) => handleToggleFavorite(e, img.id)}
                    className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                      img.favorite ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <span className="absolute bottom-2 left-2 bg-slate-900/90 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                  v{img.currentVersionNumber}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 truncate">{img.filename}</h3>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {(img.fileSize / 1024).toFixed(1)} KB • {img.contentType.split('/')[1]?.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/editor/${img.id}`); }}
                    className="text-brand-400 hover:text-brand-300 font-bold flex items-center space-x-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Editor</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, img.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => fetchImages()}
      />
    </div>
  );
};
