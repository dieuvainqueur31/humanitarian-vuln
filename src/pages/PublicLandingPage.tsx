import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  MapPin,
  FileText,
  LogIn,
  UserPlus,
  Send,
  Activity,
  Globe,
  Users,
  Eye,
  ArrowRight,
  HeartHandshake,
  Compass,
  Sun
} from 'lucide-react';
import type { PublicLandingData } from '../types/public';

export const PublicLandingPage: React.FC = () => {
  const [data, setData] = useState<PublicLandingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/public/landing')
      .then((res) => res.json())
      .then((apiData) => {
        setData(apiData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching landing data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-amber-950 font-sans selection:bg-amber-200">
      {/* Top Heritage Motif Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-700 via-amber-500 to-emerald-700"></div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-amber-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-700 text-amber-50 rounded-2xl shadow-md border border-amber-600/30">
              <Sun className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-amber-950 tracking-tight leading-none">
                Vulnerability<span className="text-amber-700">Management system for </span> NGO Support
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Community Early Warning
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-amber-900/80">
            <a href="#about" className="hover:text-amber-700 transition-colors">Ubuntu Mission</a>
            <a href="#features" className="hover:text-amber-700 transition-colors">Field Workflow</a>
            <a href="#impact" className="hover:text-amber-700 transition-colors">Regional Impact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/submit-report"
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-amber-50 bg-amber-700 hover:bg-amber-800 rounded-xl transition-all shadow-md hover:shadow-lg border border-amber-600/30"
            >
              <Send className="h-4 w-4" />
              <span>Report Anonymously</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100/60 rounded-xl transition-all"
            >
              <LogIn className="h-4 w-4 text-amber-800" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-xl transition-all border border-amber-300"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#1C130E] text-amber-50 overflow-hidden py-24 lg:py-32">
        {/* Subtle Traditional Geometric Motif Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80"
            alt="Community Support & Peacekeeping in Africa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C130E] via-[#1C130E]/90 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>Pan-African Early Warning & Response Network</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-amber-50">
              Grassroots Defense For <span className="text-amber-400">Peace</span> & <span className="text-amber-600">Humanitarian Dignity</span>
            </h1>

            <p className="text-lg text-amber-200/80 font-normal leading-relaxed">
              Bridging frontline African communities, local field verifiers, and response agencies. Empowering citizen observers while preserving safety through localized geospatial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/submit-report"
                className="inline-flex justify-center items-center space-x-2 px-8 py-4 text-base font-bold text-amber-50 bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xl transition-all border border-amber-600/40"
              >
                <span>Submit Crisis Alert</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#impact"
                className="inline-flex justify-center items-center space-x-2 px-8 py-4 text-base font-bold text-amber-100 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/50 rounded-xl transition-all"
              >
                <Compass className="h-5 w-5 text-amber-400" />
                <span>Explore Live Metrics</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Impact (Live Statistics Bar) */}
      <section id="impact" className="relative -mt-12 z-20 max-w-7xl mx-auto px-6">
        <div className="bg-[#FFFDF9] rounded-2xl shadow-xl border border-amber-900/10 p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-amber-950">{loading ? '...' : data?.statistics.totalPublicReports || 0}</p>
              <p className="text-xs font-bold text-amber-800/80 uppercase tracking-wider mt-1">Community Reports</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-amber-950">{loading ? '...' : data?.statistics.totalVerifiedIncidents || 0}</p>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-1">Verified Incidents</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-amber-200/60 text-amber-900 rounded-2xl border border-amber-300/60">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-amber-950">{loading ? '...' : data?.statistics.resolvedCases || 0}</p>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mt-1">NGO Deployments</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-[#F2E8DC] text-amber-900 rounded-2xl border border-amber-300">
              <MapPin className="h-7 w-7 text-amber-700" />
            </div>
            <div>
              <p className="text-3xl font-black text-amber-950">{loading ? '...' : Object.keys(data?.statistics.reportsByProvince || {}).length}</p>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1">Provinces Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features / Process */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            Community-Centered Architecture
          </span>
          <h2 className="text-3xl font-black text-amber-950 sm:text-4xl">How PeacePulse Resolves Field Crises</h2>
          <p className="text-amber-900/70 text-base leading-relaxed">
            Connecting isolated community observations with local verification teams and humanitarian partners across territories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#FFFDF9] rounded-2xl border border-amber-900/10 hover:shadow-xl transition-all space-y-4">
            <div className="p-3.5 bg-amber-100 text-amber-800 w-fit rounded-xl border border-amber-200">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-950">1. Grassroots Alert Filing</h3>
            <p className="text-amber-900/70 text-sm leading-relaxed">
              Citizens report displacement, food insecurity, water shortages, or regional threats anonymously, without fear of exposure.
            </p>
          </div>

          <div className="p-8 bg-[#FFFDF9] rounded-2xl border border-amber-900/10 hover:shadow-xl transition-all space-y-4">
            <div className="p-3.5 bg-amber-200/60 text-amber-900 w-fit rounded-xl border border-amber-300">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-950">2. Field Verification & Triage</h3>
            <p className="text-amber-900/70 text-sm leading-relaxed">
              Accredited field agents and verifiers corroborate reports on the ground, deduplicate logs, and reclassify urgency.
            </p>
          </div>

          <div className="p-8 bg-[#FFFDF9] rounded-2xl border border-amber-900/10 hover:shadow-xl transition-all space-y-4">
            <div className="p-3.5 bg-emerald-100 text-emerald-800 w-fit rounded-xl border border-emerald-200">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-950">3. Direct NGO Action</h3>
            <p className="text-amber-900/70 text-sm leading-relaxed">
              Verified crisis cases automatically match with local and international NGOs based on specialty and proximity.
            </p>
          </div>
        </div>
      </section>

      {/* Imagery & Mission Section (Ubuntu Philosophy) */}
      <section id="about" className="bg-[#F3ECE0] py-24 border-y border-amber-900/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"
              alt="African Community Action"
              className="rounded-2xl shadow-md h-64 w-full object-cover border-2 border-amber-100"
            />
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
              alt="Peacekeeping & Local Coordination"
              className="rounded-2xl shadow-md h-64 w-full object-cover mt-8 border-2 border-amber-100"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-200/60 px-3 py-1 rounded-full">
              Powered by Ubuntu — "I am because we are"
            </span>
            <h2 className="text-3xl font-black text-amber-950 leading-tight">
              Transforming local vigilance into coordinated protection.
            </h2>
            <p className="text-amber-900/80 leading-relaxed text-sm">
              In humanitarian response, rapid local insight saves lives. PeacePulse honors community resilience by granting citizens direct agency in crisis reporting while masking individual positions with secure spatial rounding algorithms.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 text-amber-800 font-bold hover:text-amber-900 underline underline-offset-4 decoration-amber-600"
              >
                <span>Register as an accredited field agency</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C130E] text-amber-200/70 py-12 border-t border-amber-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-700 text-amber-100 rounded-xl">
              <Sun className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-amber-50 text-lg">PeacePulse Africa</span>
          </div>
          <p className="text-xs text-amber-200/50">
            © 2026 PeacePulse African Humanitarian Infrastructure. Built for community protection.
          </p>
        </div>
      </footer>
    </div>
  );
};
