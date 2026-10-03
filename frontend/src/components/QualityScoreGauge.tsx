import React from 'react';
import { QualityScoreBreakdown } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface QualityScoreGaugeProps {
  score: number;
  breakdown?: QualityScoreBreakdown;
  blurClassification?: string;
  exposureClassification?: string;
  contrastClassification?: string;
  noiseLevel?: string;
}

export const QualityScoreGauge: React.FC<QualityScoreGaugeProps> = ({
  score,
  breakdown,
  blurClassification,
  exposureClassification,
  contrastClassification,
  noiseLevel,
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', stroke: '#10b981' };
    if (s >= 60) return { text: 'text-brand-400', bg: 'bg-brand-500', stroke: '#3b82f6' };
    if (s >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', stroke: '#f59e0b' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', stroke: '#ef4444' };
  };

  const colors = getScoreColor(score);
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className={`w-5 h-5 ${colors.text}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quality Assessment Score</h3>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${colors.bg}/15 ${colors.text}`}>
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low Quality'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Score Ring */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-800 stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black tracking-tight ${colors.text}`}>{score}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">out of 100</span>
          </div>
        </div>

        {/* Diagnostic Badges */}
        <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Blur Classification</div>
            <div className="font-bold text-slate-200 mt-0.5">{blurClassification || 'Normal'}</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Exposure Balance</div>
            <div className="font-bold text-slate-200 mt-0.5">{exposureClassification || 'Balanced'}</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Contrast</div>
            <div className="font-bold text-slate-200 mt-0.5">{contrastClassification || 'Optimal'}</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Noise Level</div>
            <div className="font-bold text-slate-200 mt-0.5">{noiseLevel || 'Low'}</div>
          </div>
        </div>
      </div>

      {/* Formula Breakdown */}
      {breakdown && (
        <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1 mb-2">
            <Info className="w-3 h-3 text-brand-400" />
            <span>Documented Score Contribution Formula</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>+ Sharpness Contribution</span>
            <span className="text-emerald-400 font-mono font-semibold">+{breakdown.sharpness_contrib} pts</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>+ Contrast Contribution</span>
            <span className="text-emerald-400 font-mono font-semibold">+{breakdown.contrast_contrib} pts</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>+ Exposure Contribution</span>
            <span className="text-emerald-400 font-mono font-semibold">+{breakdown.exposure_contrib} pts</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>+ Resolution Contribution</span>
            <span className="text-emerald-400 font-mono font-semibold">+{breakdown.resolution_contrib} pts</span>
          </div>
          {breakdown.noise_penalty > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>- Noise Penalty</span>
              <span className="text-rose-400 font-mono font-semibold">-{breakdown.noise_penalty} pts</span>
            </div>
          )}
          {breakdown.blur_penalty > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>- Blur Penalty</span>
              <span className="text-rose-400 font-mono font-semibold">-{breakdown.blur_penalty} pts</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
