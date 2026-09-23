import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  interventionId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apiRespond: (id: number, accept: boolean, reason?: string) => Promise<void>;
}

export const InterventionActionModal: React.FC<Props> = ({
  interventionId,
  isOpen,
  onClose,
  onSuccess,
  apiRespond,
}) => {
  const [accept, setAccept] = useState<boolean>(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accept && !rejectionReason.trim()) {
      setError('A rejection reason is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiRespond(interventionId, accept, accept ? undefined : rejectionReason);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Respond to Intervention Request
        </h2>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccept(true)}
              className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                accept
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => setAccept(false)}
              className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                !accept
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>

          {!accept && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Rejection Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Lack of available field personnel in this sector..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 min-h-[80px]"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Confirm Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};