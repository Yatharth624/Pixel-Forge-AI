import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Project } from '../types';
import { FolderKanban, Plus, Folder, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/projects');
      if (res.data.success) setProjects(res.data.data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await apiClient.post('/projects', { name, description });
      if (res.data.success) {
        setName('');
        setDescription('');
        setIsOpen(false);
        fetchProjects();
      }
    } catch {
      // Ignore
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete project? Images will remain in main library.')) return;
    try {
      const res = await apiClient.delete(`/projects/${id}`);
      if (res.data.success) fetchProjects();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects & Collections</h1>
          <p className="text-xs text-slate-400 mt-1">Organize your images by client, campaign, or category</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/25 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No projects created yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Group images into projects like "Instagram Campaign", "Product Catalog", or "Portfolio".
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/images?projectId=${proj.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Folder className="w-5 h-5" />
                </div>

                <button
                  onClick={(e) => handleDeleteProject(e, proj.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description || 'No description'}</p>
                <div className="text-[11px] text-slate-500 font-mono mt-4 pt-3 border-t border-slate-850">
                  {proj.imageCount} Images in Collection
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Create New Project</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Instagram Campaign 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Campaign asset details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
