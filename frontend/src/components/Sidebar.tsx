import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderKanban,
  Wand2,
  BarChart3,
  Bot,
  Cpu,
  Star,
  History,
  Settings,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Images', path: '/images', icon: ImageIcon },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Enhance', path: '/editor/active', icon: Wand2 },
    { label: 'Analyze', path: '/analyze/active', icon: BarChart3 },
    { label: 'AI Studio', path: '/ai-studio', icon: Bot },
    { label: 'Processing', path: '/processing', icon: Cpu },
    { label: 'Favorites', path: '/favorites', icon: Star },
    { label: 'History', path: '/history', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight leading-none">PixelForge <span className="text-brand-500 font-extrabold">AI</span></h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Vision Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Engine Status</span>
          <span className="flex items-center text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Online
          </span>
        </div>
        <div className="text-[11px] text-slate-500">FastAPI CV + Spring Boot 3</div>
      </div>
    </aside>
  );
};
