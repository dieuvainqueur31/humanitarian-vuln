import React, { useState } from 'react';
import type { InterventionUpdateStatus, InterventionUpdateResponse } from '../../types/ngo';

interface FieldUpdateFormProps {
  interventionId: number;
  onUpdateAdded?: () => void;
  apiPostUpdate: (
    interventionId: number,
    message: string,
    status: InterventionUpdateStatus
  ) => Promise<InterventionUpdateResponse | void>;
}

export const FieldUpdateForm: React.FC<FieldUpdateFormProps> = ({
  interventionId,
  onUpdateAdded,
  apiPostUpdate,
}) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<InterventionUpdateStatus>('ON_SITE');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await apiPostUpdate(interventionId, message, status);
      setMessage('');
      if (onUpdateAdded) onUpdateAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Field Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InterventionUpdateStatus)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="INITIALIZED">INITIALIZED</option>
          <option value="TEAM_DISPATCHED">TEAM DISPATCHED</option>
          <option value="ON_SITE">ON SITE</option>
          <option value="RESOURCES_DEPLOYED">RESOURCES DEPLOYED</option>
          <option value="STABILIZED">STABILIZED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Progress Log
        </label>
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe current situation on ground..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !message.trim()}
        className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors"
      >
        {submitting ? 'Logging Update...' : 'Submit Field Update'}
      </button>
    </form>
  );
};
