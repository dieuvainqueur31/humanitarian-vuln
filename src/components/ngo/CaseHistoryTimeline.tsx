import React from 'react';
import type { CaseHistory } from '../../types/ngo';

export const CaseHistoryTimeline: React.FC<{ history: CaseHistory[] }> = ({ history }) => {
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
        Audit & Transition History
      </h3>
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {history.map((h) => (
          <div
            key={h.id}
            className="bg-slate-950/80 border border-slate-800 p-2 rounded text-xs flex justify-between items-center"
          >
            <div>
              <span className="text-slate-400 font-mono">
                {h.oldStatus || 'NONE'} → <strong className="text-sky-400">{h.newStatus}</strong>
              </span>
              <p className="text-slate-300 italic">"{h.reason}"</p>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-mono">
              <div>{h.changedByName}</div>
              <div>{new Date(h.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};