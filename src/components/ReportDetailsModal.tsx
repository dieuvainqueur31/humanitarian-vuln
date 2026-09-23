import React from 'react';
import type { ReportDetailsResponse } from '../types/report';
import { StatusBadge } from './StatusBadge';
import { X, Calendar, MapPin, User, Paperclip } from 'lucide-react';

interface Props {
  report: ReportDetailsResponse | null;
  onClose: () => void;
}

export const ReportDetailsModal: React.FC<Props> = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={report.status} />
              <span className="text-xs font-mono text-slate-400">UUID: {report.uuid}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{report.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-sm text-slate-700">
          <p className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
            {report.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <span className="text-xs font-semibold text-slate-400 block">Category & Type</span>
              <span className="font-semibold text-slate-800">
                [{report.category.reportType}] {report.category.name}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <span className="text-xs font-semibold text-slate-400 block">Priority</span>
              <span className="font-semibold text-slate-800">{report.priority}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>
                {report.location.locationName}, {report.location.city},{' '}
                {report.location.province} ({report.location.country})
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>
                Incident Date: {new Date(report.incidentDate).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>
                Reporter: {report.anonymous ? 'Anonymous' : report.reporterName}
              </span>
            </div>
          </div>

          {/* Attachments Section */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" /> Attachments ({report.attachments.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {report.attachments.map((att) => (
                  <div key={att.id} className="p-2 border border-slate-200 rounded-lg text-xs truncate">
                    <p className="font-medium truncate text-slate-800">{att.fileName}</p>
                    <p className="text-[10px] text-slate-400">
                      {(att.fileSize / 1024 / 1024).toFixed(2)} MB • {att.fileType}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};