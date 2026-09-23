import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { reportService } from '../services/reportService';
import Swal from 'sweetalert2';
import type {
  ReportCategory,
  LocationItem,
  LocalTrackingRecord,
  ReportDetailsResponse,
} from '../types/report';
import { ReportMap } from '../components/ReportMap';
import { StatusBadge } from '../components/StatusBadge';
import { ReportDetailsModal } from '../components/ReportDetailsModal';
import {
  Send,
  ShieldCheck,
  UserCheck,
  MapPin,
  Paperclip,
  Copy,
  Check,
  Clock,
  RefreshCw,
  Eye,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export const SubmitReportPage: React.FC = () => {
  const { isAuthenticated, userEmail } = useAuth();

  // Data Sources
  const [categories] = useState<ReportCategory[]>([]);
  const [locations] = useState<LocationItem[]>([]);
  const [trackedReports, setTrackedReports] = useState<LocalTrackingRecord[]>([]);

  // Form State
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [anonymous, setAnonymous] = useState(!isAuthenticated);
  const [files, setFiles] = useState<File[]>([]);

  // Sidebar Lookup State
  const [searchUuidInput, setSearchUuidInput] = useState('');
  const [searchingUuid, setSearchingUuid] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDetailsResponse | null>(null);
  const [loadingUuid, setLoadingUuid] = useState<string | null>(null);
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form Submission UI State
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Toast Helper Configuration
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

  // Selected Location for Leaflet Map Rendering
  const selectedLocation = locations.find((loc) => loc.id === Number(locationId)) || null;


  // Synchronize local tracked report statuses with the backend
  const loadAndSyncReports = async () => {
    const saved = localStorage.getItem('submitted_reports');
    if (!saved) return;

    try {
      const records: LocalTrackingRecord[] = JSON.parse(saved);
      setTrackedReports(records);

      setRefreshing(true);
      const updated = await Promise.all(
        records.map(async (rec) => {
          try {
            const data = await reportService.getReportByUuid(rec.uuid);
            return { ...rec, status: data.status };
          } catch {
            return rec;
          }
        })
      );
      setTrackedReports(updated);
      localStorage.setItem('submitted_reports', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to load tracked reports', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const copyToClipboard = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    Toast.fire({
      icon: 'success',
      title: 'UUID copied to clipboard',
    });
    setCopiedUuid(uuid);
    setTimeout(() => setCopiedUuid(null), 2000);
  };

  // Inspect report details modal by UUID
  const handleInspectReport = async (uuid: string) => {
    setLoadingUuid(uuid);
    try {
      const reportData = await reportService.getReportByUuid(uuid);
      setSelectedReport(reportData);
    } catch {
      Swal.fire({
              icon: 'error',
              title: 'Fetch Failed',
              text: 'Could not fetch report details. Please verify the UUID.',
              confirmButtonColor: '#0284c7',
            });
    } finally {
      setLoadingUuid(null);
    }
  };

  // Search report directly by input UUID
  const handleSearchUuid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUuidInput.trim()) return;

    setSearchingUuid(true);
    try {
      const data = await reportService.getReportByUuid(searchUuidInput.trim());
      setSelectedReport(data);
      setSearchUuidInput('');
    } catch {
      Swal.fire({
              icon: 'warning',
              title: 'Not found',
              text: 'No report found matching that UUID or unauthorized.',
              confirmButtonColor: '#0284c7',
            });
    } finally {
      setSearchingUuid(false);
    }
  };

  // Submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return  Swal.fire({
            icon: 'warning',
            title: 'Category Required',
            text: 'Please select a category.',
            confirmButtonColor: '#0284c7',
          });
    if (!locationId) return Swal.fire({
            icon: 'warning',
            title: 'Location Required',
            text: 'Please select an incident location from the database.',
            confirmButtonColor: '#0284c7',
          });

    setSubmitting(true);
    try {
      // 1. Post Main Report Payload
      const reportResponse = await reportService.createReport({
        categoryId: Number(categoryId),
        locationId: Number(locationId),
        title,
        description,
        priority,
        anonymous,
        incidentDate: new Date().toISOString(),
      });

      // 2. Upload attachments if provided (uses payload key 'files')
      if (files.length > 0 && reportResponse.uuid) {
        await reportService.uploadAttachments(reportResponse.uuid, files);
      }

      // 3. Save to localStorage for tracking history
      const newRecord: LocalTrackingRecord = {
        uuid: reportResponse.uuid,
        title: reportResponse.title,
        submittedAt: reportResponse.submittedAt,
        status: reportResponse.status,
      };

      const updatedHistory = [newRecord, ...trackedReports];
      setTrackedReports(updatedHistory);
      localStorage.setItem('submitted_reports', JSON.stringify(updatedHistory));

      Swal.fire({
              icon: 'success',
              title: 'Report Submitted Successfully!',
              html: `
                <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">Your report has been saved. Tracking ID:</p>
                <div style="background-color: #f1f5f9; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #0f172a; word-break: break-all;">
                  ${reportResponse.uuid}
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: 'Copy Tracking ID',
              cancelButtonText: 'Close',
              confirmButtonColor: '#0284c7',
            }).then((result) => {
              if (result.isConfirmed) {
                copyToClipboard(reportResponse.uuid);
              }
            });

      // Reset form
      setTitle('');
      setDescription('');
      setFiles([]);
      setCategoryId('');
      setLocationId('');

      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while submitting the report.';
            Swal.fire({
              icon: 'error',
              title: 'Submission Error',
              text: msg,
              confirmButtonColor: '#e11d48',
            });
          } finally {
            setSubmitting(false);
          }
        };
  return (
  <DashboardLayout>

    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 Columns: Main Report Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Submit Incident Report</h1>
              <p className="text-sm text-slate-500">
                Provide details about humanitarian needs or peace & security threats.
              </p>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                <UserCheck className="h-4 w-4" />
                <span className="truncate max-w-[120px]">{userEmail}</span>
              </div>
            ) : (
              <Link to="/login" className="text-xs text-sky-600 hover:underline font-semibold">
                Sign in to link report
              </Link>
            )}
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium text-sm flex items-center justify-between">
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Toggle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-sky-600" />
                <div>
                  <label className="text-sm font-semibold text-slate-900">Anonymous Submission</label>
                  <p className="text-xs text-slate-500">Hide your identity on public channels.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-5 w-5 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.reportType}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Priority Level *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as  'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Report Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the incident"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, parties involved, and current status..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            {/* Location Selector (DB Location) & Leaflet Map */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>Select Location (Database) *</span>
              </label>

              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">-- Choose Incident Location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.locationName} - {loc.city}, {loc.territory}, {loc.province} ({loc.country})
                  </option>
                ))}
              </select>

              {/* Leaflet Map Preview */}
              <ReportMap selectedLocation={selectedLocation} />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <span>Attach Files / Images</span>
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Report'}</span>
            </button>
          </form>
        </div>

        {/* Right 1 Column: Submitted Reports Sidebar & UUID Lookup */}
        <div className="space-y-6">
          {/* UUID Search Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-sky-600" /> Lookup Report by UUID
            </h3>
            <form onSubmit={handleSearchUuid} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Report UUID..."
                value={searchUuidInput}
                onChange={(e) => setSearchUuidInput(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-sky-500 outline-none font-mono"
              />
              <button
                type="submit"
                disabled={searchingUuid}
                className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 disabled:opacity-50"
              >
                {searchingUuid ? '...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Submitted Reports Tracker */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-600" />
                <h2 className="font-bold text-slate-900">Your Submitted Reports</h2>
              </div>
              <button
                onClick={loadAndSyncReports}
                disabled={refreshing}
                className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition-colors"
                title="Refresh statuses"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Keep track of reports submitted from this device. Check live status updates below.
            </p>

            {trackedReports.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                No reports submitted yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {trackedReports.map((rec) => (
                  <div key={rec.uuid} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 line-clamp-1">{rec.title}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rec.uuid)}
                        className="text-slate-400 hover:text-sky-600 transition-colors p-0.5"
                        title="Copy UUID"
                      >
                        {copiedUuid === rec.uuid ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={rec.status || 'SUBMITTED'} />
                      <span className="text-[10px] text-slate-400">
                        {new Date(rec.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-slate-500 bg-white p-1 rounded border border-slate-100 truncate">
                      {rec.uuid}
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleInspectReport(rec.uuid)}
                        disabled={loadingUuid === rec.uuid}
                        className="text-sky-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="h-3 w-3" />
                        {loadingUuid === rec.uuid ? 'Loading...' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Details & Status Modal */}
      <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      </div>
  </DashboardLayout>
  );
};
