import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import type { Category } from '../../types/admin';
import { Layers, RefreshCw, Filter, CheckCircle2, XCircle } from 'lucide-react';

export const CategoryMgmt: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const endpoint = filterType === 'ALL' ? '/reports/categories' : `/reports/categories?type=${filterType}`;
      const res = await apiFetch<Category[]>(endpoint);
      setCategories(res || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filterType]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" /> Categorization Registry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage incident classification categories and reporting types.</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Report Types</option>
            <option value="HUMANITARIAN">HUMANITARIAN</option>
            <option value="PEACE_BUILDING">PEACE_BUILDING</option>
          </select>
          <button
            onClick={fetchCategories}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500 text-xs">Loading platform categories...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Category Name</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-950/50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">#{cat.id}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{cat.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{cat.description}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-amber-400">{cat.reportType}</td>
                  <td className="py-2.5 px-3">
                    {cat.active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-mono">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded text-[10px] font-mono">
                        <XCircle className="w-3 h-3" /> INACTIVE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};