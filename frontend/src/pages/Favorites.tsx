import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ImageItem } from '../types';
import { Star, Wand2, Trash2 } from 'lucide-react';

export const Favorites: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiClient.get('/images?favorites=true');
        if (res.data.success) setImages(res.data.data);
      } catch {
        // Ignore
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Star className="w-6 h-6 text-amber-400 fill-current" />
          <span>Favorite Assets</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Starred images saved for quick access and batch export</p>
      </div>

      {images.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-xs text-slate-500">
          No favorite images saved yet. Click the star icon on any image card to add it here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => navigate(`/analyze/${img.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
            >
              <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <img
                  src={`http://localhost:8080/api/images/${img.id}/bytes`}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-xs font-bold text-slate-200 truncate">{img.filename}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">v{img.currentVersionNumber}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
