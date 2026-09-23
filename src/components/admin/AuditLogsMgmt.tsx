import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../services/api';
import type { AuditLog } from '../../types/admin';
import { History, Search, RefreshCw, User, Calendar, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

export const AuditLogsMgmt: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<AuditLog[]>('/verification/audit-logs');
      setLogs(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch audit logs.';
      setError(msg);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        background: '#0f172a',
        color: '#f8fafc',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = logs.filter(
    (log) =>
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.oldValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes('VERIFIED')) return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
    if (action.includes('REJECTED')) return 'bg-rose-950/80 text-rose-400 border-rose-800';
    if (action.includes('FLAGGED') || action.includes('DUPLICATE'))
      return 'bg-amber-950/80 text-amber-400 border-amber-800';
    return 'bg-sky-950/80 text-sky-400 border-sky-800';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" /> System Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of system events, verification decisions, and state transformations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search actions, users, state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>

          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300">{error}</div>}

      {/* Audit Logs Table */}
      {loading && logs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading audit records...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">No audit records found matching criteria.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-medium">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">State Transformation (Old → New)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-500">#{log.id}</td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      {log.userName}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {log.entityType} #{log.entityId}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="space-y-1 font-mono text-[11px]">
                      {log.oldValue && (
                        <div className="text-rose-400/80 line-through truncate" title={log.oldValue}>
                          - {log.oldValue}
                        </div>
                      )}
                      {log.newValue && (
                        <div className="text-emerald-400 truncate" title={log.newValue}>
                          + {log.newValue}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
