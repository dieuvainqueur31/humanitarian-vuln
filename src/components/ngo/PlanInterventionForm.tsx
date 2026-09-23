import React, { useState } from 'react';
import type { CreateInterventionPayload, InterventionResponse } from '../../types/ngo';

interface PlanInterventionFormProps {
  caseUuid: string;
  onSuccess?: () => void;
  apiCreateIntervention: (payload: CreateInterventionPayload) => Promise<InterventionResponse | void>;
}

export const PlanInterventionForm: React.FC<PlanInterventionFormProps> = ({
  caseUuid,
  onSuccess,
  apiCreateIntervention,
}) => {
  const [interventionType, setInterventionType] = useState('MEDICAL_AID');
  const [description, setDescription] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionType.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await apiCreateIntervention({
        caseUuid,
        interventionType,
        description,
        plannedDate: plannedDate ? `${plannedDate}:00` : undefined,
        beneficiariesCount: Number(beneficiariesCount) || 0,
      });
      setDescription('');
      setPlannedDate('');
      setBeneficiariesCount(0);
      if (onSuccess) onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
        Plan New Intervention
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Intervention Type *</label>
          <select
            value={interventionType}
            onChange={(e) => setInterventionType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            required
          >
            <option value="MEDICAL_AID">Medical Aid</option>
            <option value="FOOD_SUPPLY">Food & Water Supply</option>
            <option value="SHELTER_DISPATCH">Shelter Dispatch</option>
            <option value="HUMANITARIAN_PROTECTION">Humanitarian Protection</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Target Beneficiaries Count</label>
          <input
            type="number"
            min="0"
            value={beneficiariesCount}
            onChange={(e) => setBeneficiariesCount(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-slate-400 mb-1">Target Date & Time</label>
        <input
          type="datetime-local"
          value={plannedDate}
          onChange={(e) => setPlannedDate(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label className="block text-[11px] text-slate-400 mb-1">Mission Description *</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detail scope, resources, and deployment objective..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !interventionType.trim() || !description.trim()}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors"
      >
        {submitting ? 'Creating Plan...' : 'Create Intervention Plan'}
      </button>
    </form>
  );
};
