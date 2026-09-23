import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  LayoutDashboard,
  LogOut,
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import type { UserRole } from '../context/AuthContextObject';

interface UnauthorizedPageProps {
  /** Title message for access restriction */
  title?: string;
  /** Detailed reason or explanation */
  description?: string;
  /** Optional custom required role string to inform the user */
  requiredRole?: string;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  title = "Access Restricted",
  description = "You do not have the required security credentials or operational clearances to access this humanitarian module.",
  requiredRole
}) => {
  const { userEmail, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Helper to resolve where the user should go based on their role
  const getAuthorizedDashboardPath = (role: UserRole | null): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'FIELD_AGENT':
        return '/agent/missions';
      case 'NGO_MANAGER':
        return '/ngo/overview';
      case 'ANALYST':
        return '/analytics/reports';
      case 'VERIFIER':
        return '/verifier/queue';
      default:
        return '/login';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = getAuthorizedDashboardPath(userRole);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">

        {/* Background Decorative Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-rose-700" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge & Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="p-4 bg-rose-950/60 text-rose-500 border border-rose-800/80 rounded-2xl shadow-lg ring-8 ring-rose-950/20">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 border border-slate-800 rounded-full text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Heading & Information */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/80 border border-rose-800/80 rounded-full text-[11px] font-mono font-bold text-rose-400 tracking-wider uppercase">
            <span>HTTP 403: Forbidden Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* User Role Details Pill */}
        {userEmail && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 max-w-md mx-auto flex items-center justify-between">
            <span className="truncate text-slate-300 font-medium">
              Signed in as <strong className="text-white">{userEmail}</strong>
            </span>
            <span className="font-mono text-[10px] uppercase bg-slate-900 border border-slate-700 text-sky-400 font-bold px-2 py-0.5 rounded ml-2 shrink-0">
              {userRole ? userRole.replace('_', ' ') : 'NO ROLE ASSIGNED'}
            </span>
          </div>
        )}

        {/* Specific Role Needed Callout (If provided) */}
        {requiredRole && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300 font-mono">
            ⚠️ Restricted: Requires <strong>{requiredRole}</strong> role permissions.
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          {/* Go to User's Authorized Module */}
          {userRole ? (
            <Link
              to={dashboardPath}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-900/30 transition-all border border-sky-500"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-900/30 transition-all border border-amber-600"
            >
              <Home className="w-4 h-4" />
              <span>Landing Page</span>
            </Link>
          )}

          {/* Home Page Link */}
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Public Home</span>
          </Link>
        </div>

        {/* Switch Account Action */}
        <div className="border-t border-slate-800/80 pt-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Need to sign in with a different account?</span>
          </button>
        </div>

      </div>
    </div>
  );
};
