import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User as UserIcon, Cpu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search images, projects, operations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-150 flex items-center space-x-2"
          >
            <span>+ Upload Image</span>
          </button>
        )}

        {/* Processing Indicator */}
        <button
          onClick={() => navigate('/processing')}
          className="flex items-center space-x-2 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-brand-400" />
          <span>Queue Ready</span>
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-1.5 right-1.5"></span>
        </button>

        {/* Workspace Profile Badge */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{user.fullName}</div>
            <div className="text-[10px] text-slate-400">Active Workspace</div>
          </div>
        </div>
      </div>
    </header>
  );
};
