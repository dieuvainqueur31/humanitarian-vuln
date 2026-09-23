import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserManagement } from '../../components/admin/UserManagement';
import { OrganizationMgmt } from '../../components/admin/OrganizationMgmt';
import { CategoryMgmt } from '../../components/admin/CategoryMgmt';
import { LocationMgmt } from '../../components/admin/LocationMgmt';
import { AuditLogsMgmt } from '../../components/admin/AuditLogsMgmt';
import { Shield, UserPlus, Building2, Layers, MapPin, Settings, History } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'orgs' | 'categories' | 'locations' | 'audit-logs'>('users');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-rose-500" /> Platform Administration Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Full control system management: user provisioning, organization onboarding, category registries, GPS locations, and audit tracking.
            </p>
          </div>
          <span className="bg-rose-950/80 text-rose-400 border border-rose-800 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> ROOT ADMIN ACCESS
          </span>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Provision Users
          </button>

          <button
            onClick={() => setActiveTab('orgs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orgs'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" /> Manage Organizations
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Categories Registry
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'locations'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" /> Location Registry
          </button>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audit-logs'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Audit Logs
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <div>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'orgs' && <OrganizationMgmt />}
          {activeTab === 'categories' && <CategoryMgmt />}
          {activeTab === 'locations' && <LocationMgmt />}
          {activeTab === 'audit-logs' && <AuditLogsMgmt />}
        </div>
      </div>
    </DashboardLayout>
  );
};
