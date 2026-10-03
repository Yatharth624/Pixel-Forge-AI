import React from 'react';
import { ImageVersion } from '../types';
import { GitCommit, RotateCcw, Clock } from 'lucide-react';

interface VersionTimelineProps {
  versions: ImageVersion[];
  currentVersionNumber: number;
  onRestoreVersion: (versionId: string) => void;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  currentVersionNumber,
  onRestoreVersion,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <span>Version Lineage History</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">{versions?.length || 0} Saved Versions</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {versions?.map((ver) => {
          const isCurrent = ver.versionNumber === currentVersionNumber;
          return (
            <div key={ver.id} className="relative flex items-start justify-between group">
              {/* Timeline Marker Node */}
              <div
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'bg-brand-500 border-white ring-4 ring-brand-500/20'
                    : 'bg-slate-900 border-slate-600 group-hover:border-brand-400'
                }`}
              />

              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-brand-400' : 'text-slate-200'}`}>
                    v{ver.versionNumber} — {ver.operationName}
                  </span>
                  {isCurrent && (
                    <span className="bg-brand-500/20 text-brand-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ACTIVE HEAD
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {(ver.fileSize / 1024).toFixed(1)} KB • Hash: {ver.sha256Hash.substring(0, 8)}...
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(ver.createdAt).toLocaleString()}
                </div>
              </div>

              {!isCurrent && (
                <button
                  onClick={() => onRestoreVersion(ver.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
