import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiFetch } from '../../services/api';
import type { Report, PageableResponse } from '../../types/verification';
import { Shield, ArrowRight,  Clock, RefreshCw } from 'lucide-react';

export const VerificationQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('SUBMITTED');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch<PageableResponse<Report> | Report[]>('/reports');
      const list = Array.isArray(data) ? data : data.content || [];
      setReports(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-sky-400" />
              Verification Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review incoming incident reports, dispatch field agents, and route cases to NGOs.
            </p>
          </div>

          <button
            onClick={fetchReports}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs overflow-x-auto">
          {['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'CASE_CREATED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* List Table / Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading queue reports...</div>
        ) : error ? (
          <div className="p-8 bg-rose-950/30 border border-rose-800/50 text-rose-300 rounded-xl text-xs text-center">
            {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
            No reports found matching status: <span className="font-mono text-slate-300">{filterStatus}</span>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.uuid}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-xl text-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        report.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : report.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {report.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono text-[10px]">
                      {report.status}
                    </span>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-white leading-snug">{report.title}</h2>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed">{report.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => navigate(`/verifier/reports/${report.uuid}`)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <span>Review Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
