import React from 'react';
import type { ReportStatus } from '../types/report';
import { CheckCircle2, Clock, AlertTriangle, XCircle, CopyCheck, FolderCheck } from 'lucide-react';

interface StatusBadgeProps {
  status?: ReportStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'SUBMITTED' }) => {
  const badgeConfig: Record<ReportStatus, { label: string; style: string; icon: React.ReactNode }> = {
    SUBMITTED: {
      label: 'Submitted',
      style: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <Clock className="w-3 h-3 text-slate-500" />,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      style: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
    },
    VERIFIED: {
      label: 'Approved / Verified',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
    },
    REJECTED: {
      label: 'Rejected',
      style: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
    },
    DUPLICATE: {
      label: 'Duplicate',
      style: 'bg-purple-50 text-purple-800 border-purple-300',
      icon: <CopyCheck className="w-3 h-3 text-purple-600" />,
    },
    CONVERTED_TO_CASE: {
      label: 'Converted to Case',
      style: 'bg-sky-50 text-sky-800 border-sky-300',
      icon: <FolderCheck className="w-3 h-3 text-sky-600" />,
    },
  };

  const config = badgeConfig[status] || badgeConfig.SUBMITTED;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${config.style}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};