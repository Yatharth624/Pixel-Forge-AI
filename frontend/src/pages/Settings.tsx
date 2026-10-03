import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Shield, Server, Cpu } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configuration and system parameters</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-brand-400" />
            <span>User Account</span>
          </h2>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Full Name</span>
              <span className="font-bold text-white">{user?.fullName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Email</span>
              <span className="font-mono text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Role</span>
              <span className="font-bold text-brand-400">{user?.role}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
            <Server className="w-4 h-4 text-brand-400" />
            <span>Backend Services</span>
          </h2>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Spring Boot REST API</span>
              <span className="text-emerald-400">http://localhost:8080</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>FastAPI CV Microservice</span>
              <span className="text-emerald-400">http://localhost:8000</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Database URL</span>
              <span className="text-slate-300">jdbc:h2:mem:pixelforgedb / PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
