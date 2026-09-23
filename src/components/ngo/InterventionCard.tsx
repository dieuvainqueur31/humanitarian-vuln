import React, { useState } from 'react';
import type { Intervention } from '../../types/ngo';
import { Check, X } from 'lucide-react';

interface InterventionCardProps {
  intervention: Intervention;
  submitting: boolean;
  onRespond: (id: number, accept: boolean, rejectionReason?: string) => Promise<void>;
  onSelectForUpdate: (item: Intervention) => void;
}

export const InterventionCard: React.FC<InterventionCardProps> = ({
  intervention,
  submitting,
  onRespond,
  onSelectForUpdate,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-bold text-white text-sm">{intervention.interventionType}</span>
          <p className="text-slate-400">{intervention.description}</p>
        </div>
        <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-amber-400 font-mono rounded font-bold">
          {intervention.status}
        </span>
      </div>

      {intervention.status === 'PLANNED' && (
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
          <span className="text-slate-300 font-bold block">Accept or Reject Request:</span>
          <input
            type="text"
            placeholder="Rejection reason (if rejecting)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onRespond(intervention.id, true)}
              disabled={submitting}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 font-bold"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={() => onRespond(intervention.id, false, rejectionReason)}
              disabled={submitting}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded flex items-center gap-1 font-bold"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-300">
            Field Progress Logs ({intervention.updates?.length || 0})
          </span>
          <button
            onClick={() => onSelectForUpdate(intervention)}
            className="text-sky-400 hover:underline font-mono text-[11px]"
          >
            Manage Intervention
          </button>
        </div>

        <div className="space-y-1.5 max-h-28 overflow-y-auto">
          {intervention.updates?.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900 p-2 rounded border border-slate-800/60 text-[11px] flex justify-between"
            >
              <div>
                <span className="text-slate-200">{u.message}</span>
                <span className="block text-slate-500 font-mono">By: {u.createdByName}</span>
              </div>
              <span className="text-sky-400 font-mono">{u.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};