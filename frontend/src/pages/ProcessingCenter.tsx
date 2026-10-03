import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ProcessingJob } from '../types';
import { Cpu, CheckCircle2, AlertCircle, Clock, Play } from 'lucide-react';

export const ProcessingCenter: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/jobs');
      if (res.data.success) setJobs(res.data.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Live poll queue state
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Processing Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Asynchronous background worker queue monitoring and job execution status</p>
        </div>
      </div>

      {/* Jobs Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Execution Queue</h2>
          <span className="text-xs text-slate-400 font-semibold">{jobs.length} Total Jobs</span>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p>No processing jobs currently in queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {job.status === 'COMPLETED' ? (
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : job.status === 'FAILED' ? (
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                      <Clock className="w-5 h-5 animate-spin" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{job.jobType.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-400 font-mono">({job.imageName || 'Target Asset'})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ID: {job.id.substring(0, 8)}... • Queued at {new Date(job.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Badges */}
                <div className="w-full md:w-64 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className={`px-2 py-0.5 rounded ${
                      job.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400' :
                      job.status === 'FAILED' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {job.status}
                    </span>
                    <span className="font-mono text-slate-400">{job.progress}%</span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        job.status === 'COMPLETED' ? 'bg-emerald-500' :
                        job.status === 'FAILED' ? 'bg-rose-500' : 'bg-brand-500 animate-pulse'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
