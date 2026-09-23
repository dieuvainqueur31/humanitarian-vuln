import React, { useState } from 'react';
import type { CaseItem } from '../../types/ngo';

interface CaseDetailsHeaderProps {
  caseData: CaseItem;
  submitting: boolean;
  onUpdateStatus: (newStatus: string, reason: string) => Promise<void>;
}

export const CaseDetailsHeader: React.FC<CaseDetailsHeaderProps> = ({
  caseData,
  submitting,
  onUpdateStatus,
}) => {
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStatus(newStatus, reason);
    setReason('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs font-mono text-sky-400 uppercase tracking-wide">
            Selected Case
          </span>
          <h2 className="text-xl font-bold text-white">{caseData.caseNumber}</h2>
          <p className="text-xs text-slate-400">
            Assigned Org: {caseData.assignedOrganization?.name || 'Unassigned'}
          </p>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono font-bold rounded-lg">
          {caseData.status}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs"
      >
        <div>
          <label className="block text-slate-400 mb-1">Update Case Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          >
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Transition Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Relief trucks dispatched."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            Update Case Status
          </button>
        </div>
      </form>
    </div>
  );
};