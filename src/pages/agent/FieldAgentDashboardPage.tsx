import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiFetch, apiUpload } from '../../services/api';
import Swal from 'sweetalert2';
import {
  getPendingObservations,
  saveObservationOffline,
  syncPendingObservations,
} from '../../services/offlineStorage';
import type { PageableResponse } from '../../types/verification';
import type {
  AssignedMission,
  ObservationPayload,
  FieldObservation,
  MissionSynthesisResponse,
} from '../../types/fieldAgent';
import {
  Compass,
  FileSpreadsheet,
  Upload,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  FileText,
  Navigation,
  Wifi,
  WifiOff,
  CloudOff,
  Layers,
} from 'lucide-react';

// Fix Leaflet default marker icon issue without using `any`
const leafletIconPrototype = L.Icon.Default.prototype as unknown as Record<string, unknown>;
delete leafletIconPrototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPickerMarker: React.FC<{
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
};

export const FieldAgentDashboardPage: React.FC = () => {
  const [missions, setMissions] = useState<AssignedMission[]>([]);
  const [selectedMission, setSelectedMission] = useState<AssignedMission | null>(null);
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingObs, setLoadingObs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(() => getPendingObservations().length);

  // Form State: Log Observation
  const [observationDetails, setObservationDetails] = useState('');
  const [assessmentLevel, setAssessmentLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [latitude, setLatitude] = useState<number>(-2.5085);
  const [longitude, setLongitude] = useState<number>(28.861);
  const [submittingObs, setSubmittingObs] = useState(false);

  // Form State: PDF Synthesis Upload
  const [summary, setSummary] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Helper: Fetch Observation Records
  // const fetchObservations = async (missionUuid: string) => {
  //   try {
  //     setLoadingObs(true);
  //     const res = await apiFetch<FieldObservation[]>(`/missions/${missionUuid}/observations`);

  //     const localPending = getPendingObservations()
  //       .filter((o) => o.missionUuid === missionUuid)
  //       .map((o, idx) => ({
  //         id: -idx - 1,
  //         ...o.payload,
  //         createdAt: o.timestamp,
  //         isOfflinePending: true,
  //       }));

  //     setObservations([...localPending, ...(res || [])]);
  //   } catch {
  //     const localPending = getPendingObservations()
  //       .filter((o) => o.missionUuid === missionUuid)
  //       .map((o, idx) => ({
  //         id: -idx - 1,
  //         ...o.payload,
  //         createdAt: o.timestamp,
  //         isOfflinePending: true,
  //       }));
  //     setObservations(localPending);
  //   } finally {
  //     setLoadingObs(false);
  //   }
  // };

  const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  const DarkSwal = Swal.mixin({
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#0284c7',
    });

  // Helper: Sync pending offline logs
  // const handleSync = async () => {
  //   const synced = await syncPendingObservations();
  //   const remaining = getPendingObservations().length;
  //   setPendingCount(remaining);
  //   if (synced > 0) {
  //    // alert(`Network restored! Successfully synced ${synced} offline field observations.`);
  //    Toast.fire({
  //            icon: 'success',
  //            title: `Synced ${synced} offline observation(s)!`,
  //          });
  //     if (selectedMission) {
  //       fetchObservations(selectedMission.missionUuid);
  //     }
  //   }
  // };
  // Helper: Sync pending offline logs
    const handleSync = async () => {
      const synced = await syncPendingObservations();
      const remaining = getPendingObservations().length;
      setPendingCount(remaining);
      if (synced > 0) {
        Toast.fire({
          icon: 'success',
          title: `Synced ${synced} offline observation(s)!`,
        });
        if (selectedMission) {
          // Fetch fresh observations directly without trigger issues
          const res = await apiFetch<FieldObservation[]>(`/missions/${selectedMission.missionUuid}/observations`);
          setObservations(res || []);
        }
      }
    };
  // Helper: Fetch assigned missions
  // const fetchAssignedMissions = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const res = await apiFetch<PageableResponse<AssignedMission>>('/missions/assigned');
  //     const loadedMissions = res.content || [];
  //     setMissions(loadedMissions);
  //     if (loadedMissions.length > 0) {
  //       setSelectedMission((prev) => prev ?? loadedMissions[0]);
  //     }
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : 'Failed to load assigned missions.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // Helper: Fetch assigned missions (for manual refresh button)
    const fetchAssignedMissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch<PageableResponse<AssignedMission>>('/missions/assigned');
        const loadedMissions = res.content || [];
        setMissions(loadedMissions);
        if (loadedMissions.length > 0) {
          setSelectedMission((prev) => prev ?? loadedMissions[0]);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load assigned missions.');
      } finally {
        setLoading(false);
      }
    };
    // Helper: Fetch observations (for manual refresh button)
      const fetchObservations = async (missionUuid: string) => {
        try {
          setLoadingObs(true);
          const res = await apiFetch<FieldObservation[]>(`/missions/${missionUuid}/observations`);

          const localPending = getPendingObservations()
            .filter((o) => o.missionUuid === missionUuid)
            .map((o, idx) => ({
              id: -idx - 1,
              ...o.payload,
              createdAt: o.timestamp,
              isOfflinePending: true,
            }));

          setObservations([...localPending, ...(res || [])]);
        } catch {
          const localPending = getPendingObservations()
            .filter((o) => o.missionUuid === missionUuid)
            .map((o, idx) => ({
              id: -idx - 1,
              ...o.payload,
              createdAt: o.timestamp,
              isOfflinePending: true,
            }));
          setObservations(localPending);
        } finally {
          setLoadingObs(false);
        }
      };

  // Monitor network connectivity & handle auto-sync
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        handleSync();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [selectedMission]);

  // Load missions on initial mount
  // useEffect(() => {
  //   fetchAssignedMissions();
  // }, []);
  // Initial load: Fetch assigned missions asynchronously inside effect
    useEffect(() => {
      let ignore = false;

      const loadInitialMissions = async () => {
        try {
          setError(null);
          const res = await apiFetch<PageableResponse<AssignedMission>>('/missions/assigned');
          if (!ignore) {
            const loadedMissions = res.content || [];
            setMissions(loadedMissions);
            if (loadedMissions.length > 0) {
              setSelectedMission((prev) => prev ?? loadedMissions[0]);
            }
            setLoading(false);
          }
        } catch (err: unknown) {
          if (!ignore) {
            setError(err instanceof Error ? err.message : 'Failed to load assigned missions.');
            setLoading(false);
          }
        }
      };

      loadInitialMissions();

      return () => {
        ignore = true;
      };
    }, []);
  // Fetch observations whenever active mission changes
  // useEffect(() => {
  //   if (selectedMission) {
  //     fetchObservations(selectedMission.missionUuid);
  //   }
  // }, [selectedMission]);
  // Fetch observations whenever active mission changes
    useEffect(() => {
      if (!selectedMission) return;

      let ignore = false;
      const missionUuid = selectedMission.missionUuid;

      const loadMissionObservations = async () => {
        setLoadingObs(true);
        const localPending = getPendingObservations()
          .filter((o) => o.missionUuid === missionUuid)
          .map((o, idx) => ({
            id: -idx - 1,
            ...o.payload,
            createdAt: o.timestamp,
            isOfflinePending: true,
          }));

        try {
          const res = await apiFetch<FieldObservation[]>(`/missions/${missionUuid}/observations`);
          if (!ignore) {
            setObservations([...localPending, ...(res || [])]);
          }
        } catch {
          if (!ignore) {
            setObservations(localPending);
          }
        } finally {
          if (!ignore) {
            setLoadingObs(false);
          }
        }
      };

      loadMissionObservations();

      return () => {
        ignore = true;
      };
    }, [selectedMission]);
  const handleGetCurrentLocation = () => {
      if (!navigator.geolocation) {
        DarkSwal.fire({
          icon: 'warning',
          title: 'Geolocation Unsupported',
          text: 'Geolocation is not supported by your browser.',
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          Toast.fire({
            icon: 'info',
            title: 'GPS Coordinates Updated',
          });
        },
        (err) => {
          DarkSwal.fire({
            icon: 'error',
            title: 'GPS Error',
            text: `Failed to retrieve current location: ${err.message}`,
          });
        }
      );
    };
  const handleLogObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;

    const payload: ObservationPayload = {
      observationDetails,
      assessmentLevel,
      observedLatitude: Number(latitude),
      observedLongitude: Number(longitude),
    };

    setSubmittingObs(true);

    if (!navigator.onLine) {
      saveObservationOffline(selectedMission.missionUuid, payload);
      setPendingCount(getPendingObservations().length);
      //alert('No internet connection. Observation cached locally and queued for auto-sync.');
      Toast.fire({
              icon: 'warning',
              title: 'Observation cached locally (Offline mode)',
            });
      setObservationDetails('');
      fetchObservations(selectedMission.missionUuid);
      setSubmittingObs(false);
      return;
    }

    try {
      await apiFetch(`/missions/${selectedMission.missionUuid}/observations`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      //alert('Observation logged successfully!');
      Toast.fire({
              icon: 'success',
              title: 'Observation logged successfully!',
            });
      setObservationDetails('');
      fetchObservations(selectedMission.missionUuid);
    } catch {
      saveObservationOffline(selectedMission.missionUuid, payload);
      setPendingCount(getPendingObservations().length);
      //alert('Server error. Observation saved to local cache for retry.');
      Toast.fire({
              icon: 'warning',
              title: 'Server error: Saved to local queue for retry',
            });
    } finally {
      setSubmittingObs(false);
    }
  };

  const handleSynthesizePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission || !pdfFile || !summary) {
   //   alert('Please provide both summary notes and a PDF document.');
      DarkSwal.fire({
              icon: 'warning',
              title: 'Missing Fields',
              text: 'Please provide both summary notes and a PDF document.',
            });
      return;
    }

    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('summary', summary);
      formData.append('file', pdfFile);

      const result = await apiUpload<MissionSynthesisResponse>(
        `/missions/${selectedMission.missionUuid}/synthesize-pdf`,
        formData
      );

      //alert(`Mission concluded successfully! Summary recorded for ${result.missionTitle}.`);
      DarkSwal.fire({
              icon: 'success',
              title: 'Mission Concluded',
              text: `Summary successfully recorded for ${result.missionTitle}.`,
              confirmButtonColor: '#d97706',
            });
      setSummary('');
      setPdfFile(null);
      fetchAssignedMissions();
    } catch (err: unknown) {
     // alert(err instanceof Error ? err.message : 'Failed to upload PDF synthesis.');
      DarkSwal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text: err instanceof Error ? err.message : 'Failed to upload PDF synthesis.',
            });
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Network & Offline Status Banner */}
        <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3.5 px-5">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                isOnline
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'ONLINE MODE' : 'OFFLINE MODE'}
            </span>

            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-950 text-amber-400 border border-amber-800 px-3 py-1 rounded-full font-bold">
                <CloudOff className="w-3.5 h-3.5" />
                {pendingCount} Observation(s) Queued Locally
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && isOnline && (
              <button
                onClick={handleSync}
                className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg font-bold transition-colors"
              >
                Sync Now
              </button>
            )}
            <button
              onClick={fetchAssignedMissions}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="border-b border-slate-800 pb-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            Field Agent Operational Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log real-time field observations with offline caching, interactive GPS pin, and synthesis reporting.
          </p>
        </div>

        {loading && <div className="text-center text-slate-400 text-sm py-8">Loading field assignments...</div>}
        {error && <div className="text-center text-rose-400 text-sm py-8">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mission Selector Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                Assigned Recon Missions ({missions.length})
              </h2>

              {missions.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No active field missions assigned to you.</p>
              ) : (
                <div className="space-y-2">
                  {missions.map((m) => {
                    const isSelected = selectedMission?.missionUuid === m.missionUuid;
                    return (
                      <div
                        key={m.missionUuid}
                        onClick={() => setSelectedMission(m)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all text-xs space-y-1.5 ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-lg shadow-amber-950/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate max-w-[180px]">{m.missionTitle}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              m.missionStatus === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {m.missionStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{m.reportTitle}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                          <Clock className="w-3 h-3" />
                          <span>Started: {new Date(m.startedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Mission Operations */}
            {selectedMission ? (
              <div className="lg:col-span-2 space-y-6">
                {/* Mission Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      MISSION UUID: {selectedMission.missionUuid}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
                      PRIORITY: {selectedMission.reportPriority}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedMission.missionTitle}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <strong className="text-slate-400 block mb-0.5">Original Incident Report:</strong>
                    {selectedMission.reportDescription}
                  </p>
                </div>

                {/* Section 1: Log Observation Form & Map */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      1. Log Field Observation (Team Member)
                    </h3>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="flex items-center gap-1 text-[11px] bg-sky-950 text-sky-400 border border-sky-800 px-2.5 py-1 rounded hover:bg-sky-900 transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      Use My GPS
                    </button>
                  </div>

                  <div className="h-56 w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
                    <MapContainer center={[latitude, longitude]} zoom={12} scrollWheelZoom={true} className="h-full w-full">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPickerMarker
                        position={[latitude, longitude]}
                        onPositionChange={(lat, lng) => {
                          setLatitude(Number(lat.toFixed(6)));
                          setLongitude(Number(lng.toFixed(6)));
                        }}
                      />
                      {observations.map((obs) => (
                        <Marker key={obs.id} position={[obs.observedLatitude, obs.observedLongitude]}>
                          <Popup>
                            <div className="text-xs space-y-1">
                              <strong>Level: {obs.assessmentLevel}</strong>
                              <p>{obs.observationDetails}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>

                  <form onSubmit={handleLogObservation} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Observation Details</label>
                      <textarea
                        value={observationDetails}
                        onChange={(e) => setObservationDetails(e.target.value)}
                        rows={3}
                        placeholder="Detail findings from location (e.g. Observed 30 families in urgent need...)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Assessment Level</label>
                        <select
                          value={assessmentLevel}
                          onChange={(e) => setAssessmentLevel(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) => setLatitude(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) => setLongitude(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingObs}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingObs ? 'Saving...' : 'Submit Field Observation'}
                    </button>
                  </form>
                </div>

                {/* Section 2: Logged Observations Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Logged Field Observations ({observations.length})
                    </h3>
                    <button
                      onClick={() => fetchObservations(selectedMission.missionUuid)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingObs ? 'animate-spin' : ''}`} />
                      Refresh Logs
                    </button>
                  </div>

                  {observations.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-950 rounded-lg border border-slate-800">
                      No observations recorded yet for this mission.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Level</th>
                            <th className="py-2 px-3">Observation Details</th>
                            <th className="py-2 px-3">Coordinates</th>
                            <th className="py-2 px-3">Logged Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {observations.map((obs) => (
                            <tr key={obs.id} className="hover:bg-slate-950/50">
                              <td className="py-2.5 px-3">
                                {obs.isOfflinePending ? (
                                  <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-mono">
                                    QUEUED
                                  </span>
                                ) : (
                                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                                    SYNCED
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-bold font-mono">
                                <span
                                  className={
                                    obs.assessmentLevel === 'CRITICAL' || obs.assessmentLevel === 'HIGH'
                                      ? 'text-rose-400'
                                      : 'text-sky-400'
                                  }
                                >
                                  {obs.assessmentLevel}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 max-w-xs truncate">{obs.observationDetails}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                                {obs.observedLatitude}, {obs.observedLongitude}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">
                                {new Date(obs.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 3: Lead Agent Upload Synthesized PDF */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    3. Lead Agent Synthesized PDF Upload & Mission Conclude
                  </h3>

                  {selectedMission.missionStatus === 'COMPLETED' ? (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>This field mission is officially COMPLETED. Synthesized summary and PDF are uploaded.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSynthesizePdf} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Reconciled Summary Notes</label>
                        <textarea
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          rows={3}
                          placeholder="Reconciled team reports: Immediate intervention required for clean water supply..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Upload Synthesized PDF Document</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 w-full text-xs file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={uploadingPdf || !pdfFile}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {uploadingPdf ? 'Uploading & Concluding...' : 'Upload PDF & Conclude Mission'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                Select a mission from the left panel to view operations and observations.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
