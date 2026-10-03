import React, { useState } from 'react';
import { DominantColor } from '../types';
import { Copy, Check } from 'lucide-react';

interface ColorPaletteProps {
  colors: DominantColor[];
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dominant Color Palette (K-Means)</h3>

      {/* Color Swatches Bar */}
      <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-800 mb-4 shadow-inner">
        {colors?.map((color, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: color.hex, width: `${color.percentage}%` }}
            className="h-full relative group transition-all duration-200 hover:opacity-90"
            title={`${color.hex} (${color.percentage}%)`}
          />
        ))}
      </div>

      {/* Hex List */}
      <div className="space-y-2">
        {colors?.map((color, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-850 hover:border-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-5 h-5 rounded-md border border-white/10 shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-mono text-xs text-slate-200 font-semibold">{color.hex}</span>
              <span className="text-[10px] text-slate-500 font-mono">RGB({color.rgb.join(', ')})</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-slate-400">{color.percentage}%</span>
              <button
                onClick={() => handleCopy(color.hex)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Copy HEX"
              >
                {copiedHex === color.hex ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
