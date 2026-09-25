import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LogOut, Radio, BarChart3, Building2
} from 'lucide-react';
import type { UserRole } from '../../context/AuthContextObject';
import { useAuth } from '../../context/useAuth';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userEmail, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation options per role
  const getNavItems = (role: UserRole | null): NavigationItem[] => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Activities', path: '/admin/dashboard', icon: <Radio className="w-4 h-4" /> },

        ];
      case 'FIELD_AGENT':
        return [
          { label: 'Active Missions', path: '/agent/missions', icon: <Radio className="w-4 h-4" /> },

        ];
      case 'NGO_MANAGER':
        return [
          { label: 'Resource Deployment', path: '/ngo/overview', icon: <Building2 className="w-4 h-4" /> },

        ];
      case 'ANALYST':
        return [
          { label: 'Predictive Analytics', path: '/analytics/reports', icon: <BarChart3 className="w-4 h-4" /> },

        ];
      case 'VERIFIER':
        return [
          { label: 'Verification Queue', path: '/verifier/queue', icon: <Shield className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(userRole);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-sky-400 font-bold text-base tracking-wider">
              <Shield className="w-5 h-5" />
              <span>Vulnerability & NGO Support</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-200">{userEmail}</p>
              <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-sky-400 font-bold border border-slate-700">
                {userRole?.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:border-rose-800 text-slate-300 hover:text-rose-400 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
