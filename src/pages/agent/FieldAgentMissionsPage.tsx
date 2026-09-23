import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiFetch } from '../../services/api';
import { Radio, MapPin  } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  location: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export const FieldAgentMissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMissions = async () => {
      try {
        const data = await apiFetch<Mission[]>('/agent/missions');
        if (isMounted) {
          setMissions(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          // Fallback mock data if endpoint is not created yet
          setMissions([
            { id: 'm-1', title: 'Water Source Assessment Zone 4', location: 'Goma, Sector B', priority: 'HIGH', status: 'ASSIGNED' },
            { id: 'm-2', title: 'Displacement Reconnaissance', location: 'Bukavu Rural', priority: 'CRITICAL', status: 'IN_PROGRESS' }
          ]);
          setLoading(false);
        }
      }
    };
    fetchMissions();
    return () => { isMounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-400" /> Active Recon Missions
          </h1>
          <p className="text-xs text-slate-400">Assigned tactical field ops and rapid incident verification routes.</p>
        </div>

        {loading ? (
          <div className="text-xs font-mono text-slate-500 py-10 text-center">Synchronizing tactical telemetry...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    m.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {m.priority}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">{m.status}</span>
                </div>
                <h3 className="font-bold text-white">{m.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{m.location}</span>
                </div>
                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors">
                  Submit Field Assessment Log
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
