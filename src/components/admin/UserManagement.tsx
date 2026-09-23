import React, { useState } from 'react';
import { apiFetch } from '../../services/api';
import type { RegisterUserPayload } from '../../types/admin';
import { UserPlus, Shield, Mail, Lock, Phone, UserCheck } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [formData, setFormData] = useState<RegisterUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'Password123!',
    preferredLanguage: 'EN',
    roles: ['VERIFIER'],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setMessage({ type: 'success', text: `User ${formData.email} registered successfully!` });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: 'Password123!',
        preferredLanguage: 'EN',
        roles: ['VERIFIER'],
      });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'User creation failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-sky-400" /> System User Registration & Provisioning
        </h2>
        <p className="text-xs text-slate-400 mt-1">Register system users and assign role permissions across the platform.</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
              : 'bg-rose-950/80 text-rose-400 border border-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" /> Temporary Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" /> Primary Access Role
            </label>
            <select
              value={formData.roles[0]}
              onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="VERIFIER">VERIFIER</option>
              <option value="FIELD_AGENT">FIELD_AGENT</option>
              <option value="NGO_MANAGER">NGO_MANAGER</option>
              <option value="ANALYST">ANALYST</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          {loading ? 'Provisioning...' : 'Provision User Account'}
        </button>
      </form>
    </div>
  );
};