import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiFetch } from '../../services/api';
import type { AnalyticsDashboardResponse } from '../../types/analytics';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BarChart3,
  TrendingUp,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  MapPin,
  Building2,
  PieChart,
  RefreshCw,
  FileText,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';

// Fix Leaflet marker icon rendering issues
const leafletIconPrototype = L.Icon.Default.prototype as unknown as Record<string, unknown>;
delete leafletIconPrototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const AnalyticsReportsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<AnalyticsDashboardResponse>('/analytics/dashboard');
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filtered Map Markers
  const filteredMarkers = useMemo(() => {
    if (!data?.mapMarkers) return [];
    if (selectedCategory === 'ALL') return data.mapMarkers;
    return data.mapMarkers.filter((m) => m.categoryName === selectedCategory);
  }, [data, selectedCategory]);

  // Center coordinates for the map based on markers or fallback to default
  const mapCenter: [number, number] = useMemo(() => {
    if (filteredMarkers.length > 0) {
      return [filteredMarkers[0].latitude, filteredMarkers[0].longitude];
    }
    return [-2.49, 28.84];
  }, [filteredMarkers]);

  // Export Data to CSV Spreadsheet
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    // Section 1: Core Statistics
    csvContent += 'PEACE & HUMANITARIAN PLATFORM - EXECUTIVE ANALYTICS EXPORT\n';
    csvContent += `Generated At,${new Date().toISOString()}\n\n`;
    csvContent += 'METRIC,VALUE\n';
    csvContent += `Total Reports,${data.stats.totalReports}\n`;
    csvContent += `Verified Reports,${data.stats.verifiedReports}\n`;
    csvContent += `Total Cases,${data.stats.totalCases}\n`;
    csvContent += `Active Cases,${data.stats.activeCases}\n`;
    csvContent += `Completed Cases,${data.stats.completedCases}\n`;
    csvContent += `Beneficiaries Reached,${data.stats.totalBeneficiariesReached}\n\n`;

    // Section 2: Cases & Map Spatial Markers
    csvContent += 'CASE NUMBER,TITLE,CATEGORY,PRIORITY,STATUS,PROVINCE,CITY,LATITUDE,LONGITUDE\n';
    data.mapMarkers.forEach((m) => {
      csvContent += `"${m.caseNumber}","${m.reportTitle.replace(/"/g, '""')}","${m.categoryName}","${m.priority}","${m.status}","${m.province}","${m.city}",${m.latitude},${m.longitude}\n`;
    });
    csvContent += '\n';

    // Section 3: Organization Performance
    csvContent += 'ORGANIZATION ID,ORGANIZATION NAME,ASSIGNED CASES,COMPLETED CASES,BENEFICIARIES REACHED\n';
    data.organizationPerformance.forEach((o) => {
      csvContent += `${o.organizationId},"${o.organizationName.replace(/"/g, '""')}",${o.totalAssignedCases},${o.completedCases},${o.totalBeneficiaries}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Analytics_Executive_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Formal PDF Administrative Document
  const handleGeneratePdfReport = () => {
    if (!data) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print/export the formal PDF document.');
      return;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Executive Intelligence & Analytical Forecast Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; }
            .header-table { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }
            .org-title { font-size: 18px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; }
            .doc-title { font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            .meta-bar { font-size: 11px; color: #64748b; margin-bottom: 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .section-heading { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
            .stat-box { border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; background-color: #f8fafc; }
            .stat-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .stat-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; }
            .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="org-title">PEACE & HUMANITARIAN REPORTING PLATFORM</div>
                <div class="doc-title">OFFICIAL HUMANITARIAN ANALYTICS & SITUATIONAL ASSESSMENT</div>
              </td>
              <td style="text-align: right; font-size: 11px; color: #475569;">
                <strong>CLASSIFICATION:</strong> INTERNAL USE<br/>
                <strong>REF NO:</strong> HAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}<br/>
                <strong>DATE:</strong> ${new Date().toLocaleDateString()}
              </td>
            </tr>
          </table>

          <div class="meta-bar">
            <span><strong>Generated By:</strong> Analytical Intelligence Unit</span>
            <span><strong>Target Sector:</strong> Conflict, Shelter & Water Vulnerabilities</span>
            <span><strong>Status:</strong> Verified Data Sync</span>
          </div>

          <div class="section-heading">1. Executive Key Performance Metrics</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Reports Received</div>
              <div class="stat-val">${data.stats.totalReports}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Verified Reports</div>
              <div class="stat-val">${data.stats.verifiedReports}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Active/Closed Cases</div>
              <div class="stat-val">${data.stats.totalCases}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Active Response Cases</div>
              <div class="stat-val">${data.stats.activeCases}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Completed Missions</div>
              <div class="stat-val">${data.stats.completedCases}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Beneficiaries Reached</div>
              <div class="stat-val">${data.stats.totalBeneficiariesReached.toLocaleString()}</div>
            </div>
          </div>

          <div class="section-heading">2. Spatial Incident & Case Mapping Registry</div>
          <table>
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Incident Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${data.mapMarkers
                .map(
                  (m) => `
                <tr>
                  <td><strong>${m.caseNumber}</strong></td>
                  <td>${m.reportTitle}</td>
                  <td>${m.categoryName}</td>
                  <td>${m.priority}</td>
                  <td>${m.status}</td>
                  <td>${m.city}, ${m.province} (${m.latitude}, ${m.longitude})</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="section-heading">3. Partner Organization Performance & Aid Impact</div>
          <table>
            <thead>
              <tr>
                <th>Org ID</th>
                <th>Organization Name</th>
                <th>Assigned Cases</th>
                <th>Completed Cases</th>
                <th>Beneficiaries Reached</th>
              </tr>
            </thead>
            <tbody>
              ${data.organizationPerformance
                .map(
                  (o) => `
                <tr>
                  <td>${o.organizationId}</td>
                  <td><strong>${o.organizationName}</strong></td>
                  <td>${o.totalAssignedCases}</td>
                  <td>${o.completedCases}</td>
                  <td>${o.totalBeneficiaries.toLocaleString()}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            CONFIDENTIAL & PROPRIETARY — PEACE & HUMANITARIAN REPORTING PLATFORM &copy; ${new Date().getFullYear()}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" /> Executive Analytical Dashboard & Threat Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Aggregated conflict density, case progress tracking, partner performance, and spatial mapping models.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-xs font-semibold rounded-xl text-slate-200 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleGeneratePdfReport}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-purple-950/40 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Official PDF Report
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Loading aggregated analytics data...
          </div>
        )}

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Core Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Reports</span>
                <div className="text-2xl font-bold text-white font-mono">{data.stats.totalReports}</div>
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> System Wide
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Verified Reports</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">{data.stats.verifiedReports}</div>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verifier Cleared
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Cases</span>
                <div className="text-2xl font-bold text-amber-400 font-mono">{data.stats.totalCases}</div>
                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Escalated Missions
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Cases</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">{data.stats.activeCases}</div>
                <span className="text-[10px] text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Field Deployment
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Completed Cases</span>
                <div className="text-2xl font-bold text-sky-400 font-mono">{data.stats.completedCases}</div>
                <span className="text-[10px] text-sky-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Resolved
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Beneficiaries</span>
                <div className="text-2xl font-bold text-purple-400 font-mono">
                  {data.stats.totalBeneficiariesReached.toLocaleString()}
                </div>
                <span className="text-[10px] text-purple-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> People Assisted
                </span>
              </div>
            </div>

            {/* Trends Chart & Category Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trends Bar Visualization */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" /> Incident & Case Trends Over Time
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Daily volume of incoming incident reports vs converted cases.</p>
                  </div>
                </div>

                <div className="space-y-3 my-4">
                  {data.trends.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-8">No historical trend data available.</div>
                  ) : (
                    data.trends.map((t, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                          <span>{t.date}</span>
                          <span>
                            Reports: <strong className="text-purple-400">{t.reportCount}</strong> | Cases:{' '}
                            <strong className="text-amber-400">{t.caseCount}</strong>
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden flex border border-slate-800">
                          <div
                            className="bg-purple-500 h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, t.reportCount * 25)}%` }}
                            title={`Reports: ${t.reportCount}`}
                          />
                          <div
                            className="bg-amber-500 h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, t.caseCount * 25)}%` }}
                            title={`Cases: ${t.caseCount}`}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Incident Reports
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Escalated Cases
                  </span>
                </div>
              </div>

              {/* Categorical Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-sky-400" /> Category & Status Distribution
                </h3>

                <div className="space-y-3">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Reports By Category
                  </span>
                  {Object.keys(data.reportsByCategory).length === 0 ? (
                    <div className="text-slate-500 text-xs">No category data.</div>
                  ) : (
                    Object.entries(data.reportsByCategory).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-800/50">
                        <span className="text-slate-300 font-medium">{cat}</span>
                        <span className="text-sky-400 font-mono font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                          {count}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Cases By Status
                  </span>
                  {Object.keys(data.casesByStatus).length === 0 ? (
                    <div className="text-slate-500 text-xs">No case status data.</div>
                  ) : (
                    Object.entries(data.casesByStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-800/50">
                        <span className="text-slate-300 font-medium">{status}</span>
                        <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          {count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Spatial Map Component */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" /> Geospatial Active Case Locations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Interactive field deployment map showing GPS coordinates of humanitarian cases.
                  </p>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ALL">All Categories</option>
                    {Object.keys(data.reportsByCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
                <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={true} className="h-full w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredMarkers.map((marker, idx) => (
                    <Marker key={idx} position={[marker.latitude, marker.longitude]}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <strong className="text-purple-700 block">{marker.caseNumber}</strong>
                          <p className="font-bold">{marker.reportTitle}</p>
                          <div className="text-[10px] text-slate-600">
                            Category: {marker.categoryName} | Priority: {marker.priority}
                          </div>
                          <div className="text-[10px] text-slate-600">
                            Location: {marker.city}, {marker.province}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Organization Performance Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> NGO & Partner Humanitarian Performance
              </h3>

              {data.organizationPerformance.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-6">No organization performance metrics available.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-4">Org ID</th>
                        <th className="py-2.5 px-4">Organization Name</th>
                        <th className="py-2.5 px-4">Assigned Cases</th>
                        <th className="py-2.5 px-4">Completed Cases</th>
                        <th className="py-2.5 px-4">Beneficiaries Reached</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {data.organizationPerformance.map((org) => (
                        <tr key={org.organizationId} className="hover:bg-slate-950/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500">#{org.organizationId}</td>
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {org.organizationName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">{org.totalAssignedCases}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">{org.completedCases}</td>
                          <td className="py-3 px-4 font-mono font-bold text-purple-400">
                            {org.totalBeneficiaries.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};