import React, { useState, useRef, useEffect } from 'react';
import { Histograms } from '../types';

interface HistogramChartProps {
  histograms: Histograms;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ histograms }) => {
  const [mode, setMode] = useState<'RGB' | 'GRAY'>('RGB');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !histograms) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const drawChannel = (bins: number[], color: string) => {
      if (!bins || bins.length === 0) return;
      const maxFreq = Math.max(...bins, 1);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, height);

      const step = width / 256.0;
      for (let i = 0; i < 256; i++) {
        const val = (bins[i] / maxFreq) * height;
        const x = i * step;
        const y = height - val;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    };

    ctx.globalCompositeOperation = 'screen';

    if (mode === 'RGB') {
      drawChannel(histograms.red, 'rgba(239, 68, 68, 0.45)');
      drawChannel(histograms.green, 'rgba(34, 197, 94, 0.45)');
      drawChannel(histograms.blue, 'rgba(59, 130, 246, 0.45)');
    } else {
      ctx.globalCompositeOperation = 'source-over';
      drawChannel(histograms.luminance, 'rgba(148, 163, 184, 0.6)');
    }

  }, [histograms, mode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Color Histogram</h3>
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setMode('RGB')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'RGB' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RGB Channels
          </button>
          <button
            onClick={() => setMode('GRAY')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'GRAY' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Luminance
          </button>
        </div>
      </div>

      <div className="relative w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          className="w-full h-full block"
        />
        <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] text-slate-600 font-mono">
          <span>0 (Dark)</span>
          <span>128</span>
          <span>255 (Bright)</span>
        </div>
      </div>
    </div>
  );
};
