import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ImageUploadModal } from './components/ImageUploadModal';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ImagesGallery } from './pages/ImagesGallery';
import { ImageDetail } from './pages/ImageDetail';
import { Editor } from './pages/Editor';
import { AiStudio } from './pages/AiStudio';
import { ProcessingCenter } from './pages/ProcessingCenter';
import { Projects } from './pages/Projects';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient();

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-xs font-semibold">Loading PixelForge AI...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar onOpenUpload={() => setIsUploadOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/images" element={<ImagesGallery />} />
            <Route path="/analyze/:id" element={<ImageDetail />} />
            <Route path="/images/:id" element={<ImageDetail />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/history" element={<ImagesGallery />} />
            <Route path="/ai-studio" element={<AiStudio />} />
            <Route path="/processing" element={<ProcessingCenter />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      <ImageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
