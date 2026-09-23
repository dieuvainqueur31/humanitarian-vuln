import React from 'react';
import type { CaseItem } from '../../types/ngo';
import { Clock } from 'lucide-react';

interface CaseListSidebarProps {
  cases: CaseItem[];
  selectedCaseUuid?: string;
  onSelectCase: (c: CaseItem) => void;
}

export const CaseListSidebar: React.FC<CaseListSidebarProps> = ({
  cases,
  selectedCaseUuid,
  onSelectCase,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <Clock className="w-4 h-4 text-sky-400" /> Organization Cases ({cases.length})
      </h2>

      <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
        {cases.map((c) => (
          <button
            key={c.uuid}
            onClick={() => onSelectCase(c)}
            className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
              selectedCaseUuid === c.uuid
                ? 'bg-sky-950/40 border-sky-500/50 text-white'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-sky-400 font-bold">{c.caseNumber}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  c.priority === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {c.priority}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>
                Status: <strong className="text-slate-200">{c.status}</strong>
              </span>
              <span className="text-slate-500 font-mono">
                {new Date(c.openedAt).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};