import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ImageItem } from '../types';
import { Bot, Sparkles, Send, CheckCircle2, Play, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AiStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [parsedOps, setParsedOps] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiClient.get('/images');
        if (res.data.success && res.data.data.length > 0) {
          setImages(res.data.data);
          setSelectedImageId(res.data.data[0].id);
        }
      } catch {
        // Ignore
      }
    };
    fetchImages();
  }, []);

  const handleParsePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setParsedOps(null);

    try {
      const res = await apiClient.post('/ai/command', { prompt });
      if (res.data.success) {
        setParsedOps(res.data.data.parsed_operations);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!selectedImageId || !parsedOps) return;
    setExecuting(true);
    try {
      // Create background processing job or execute directly
      const firstOp = parsedOps.operations?.[0];
      if (firstOp?.type === 'crop') {
        await apiClient.post(`/images/${selectedImageId}/crop?targetAspect=${firstOp.aspectRatio || '1:1'}`);
      } else if (firstOp?.type === 'remove_background') {
        await apiClient.post(`/images/${selectedImageId}/remove-background`);
      } else {
        await apiClient.post(`/images/${selectedImageId}/enhance`);
      }
      navigate(`/editor/${selectedImageId}`);
    } catch {
      // Ignore
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Studio & Assistant</h1>
          <p className="text-xs text-slate-400 mt-0.5">Translate natural language prompts into validated image operation schemas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Natural Language Input & Target Selector */}
        <div className="lg:col-span-6 space-y-6">
          {/* Target Image Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Target Image</label>
            {images.length === 0 ? (
              <p className="text-xs text-slate-500">No images available in repository.</p>
            ) : (
              <select
                value={selectedImageId}
                onChange={(e) => setSelectedImageId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              >
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.filename} (v{img.currentVersionNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleParsePrompt} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Natural Language Command</span>
              <Sparkles className="w-4 h-4 text-brand-400" />
            </label>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Make this suitable for Instagram portrait, increase brightness slightly, and sharpen high frequencies."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />

            <div className="flex items-center space-x-2 text-[11px] text-slate-500 flex-wrap gap-1">
              <span>Try:</span>
              <button type="button" onClick={() => setPrompt("Make this suitable for Instagram")} className="hover:text-brand-400 underline">"Make for Instagram"</button>
              <button type="button" onClick={() => setPrompt("Remove background and increase brightness")} className="hover:text-brand-400 underline">"Remove background"</button>
              <button type="button" onClick={() => setPrompt("Increase contrast and sharpen image")} className="hover:text-brand-400 underline">"Sharpen and boost contrast"</button>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Translating Command...' : 'Parse Natural Language Plan'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Schema Preview & Execution */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-brand-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Generated Operation Plan Schema</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-emerald-400">
                Validated Schema
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 min-h-[160px] overflow-x-auto">
              {parsedOps ? (
                <pre>{JSON.stringify(parsedOps, null, 2)}</pre>
              ) : (
                <span className="text-slate-600 italic">Enter a natural language command to generate structured operation plan...</span>
              )}
            </div>

            {parsedOps && (
              <button
                onClick={handleExecutePlan}
                disabled={executing || !selectedImageId}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
              >
                <Play className="w-4 h-4" />
                <span>{executing ? 'Executing AI Operations...' : 'Execute Operations on Image'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
