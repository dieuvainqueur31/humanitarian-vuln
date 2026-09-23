import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiFetch, apiDownload } from '../../services/api';
import Swal from 'sweetalert2';
import type {
  Report,
  VerifyReportPayload,
  VerificationRecordResponse,
  NgoRecommendation,
  User,
  Mission,
  PageableResponse,
  CaseResponse,
} from '../../types/verification';
import {
  Shield,
  Send,
  Briefcase,
  ArrowLeft,
  Download,
  Award,
  CheckCircle2,
  Building2,
  Users,
  RefreshCw,
  UserPlus,
  UserCheck,
  FileCheck2,
  Calendar,
  UserCheck2,
} from 'lucide-react';

export const VerifierDetailPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification Form State
  const [decision, setDecision] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [notes, setNotes] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<
    'PHONE_CONFIRMATION' | 'FIELD_VISIT' | 'COMMUNITY_SOURCE' | 'SATELLITE_IMAGE'
  >('PHONE_CONFIRMATION');
  const [updatedPriority, setUpdatedPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  >('MEDIUM');
  const [verifying, setVerifying] = useState(false);

  // Field Mission Dispatch State
  const [missionTitle, setMissionTitle] = useState('');
  const [selectedLeadAgentId, setSelectedLeadAgentId] = useState<number | ''>('');
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<number[]>([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [dispatching, setDispatching] = useState(false);

  // Active Case & Matching State
  const [activeCaseUuid, setActiveCaseUuid] = useState<string | null>(null);
  const [ngoRecommendations, setNgoRecommendations] = useState<NgoRecommendation[]>([]);
  const [fetchingNgos, setFetchingNgos] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState<NgoRecommendation | null>(null);
  const [assigningCase, setAssigningCase] = useState(false);
  const [assignedCase, setAssignedCase] = useState<CaseResponse | null>(null);
  // SweetAlert2 Mixins for Dark UI
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#0f172a',
      color: '#f8fafc',
    });

    const DarkSwal = Swal.mixin({
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#0284c7',
    });

  const loadInitialData = useCallback(async () => {
    if (!uuid) return;
    try {
      setLoading(true);
      setError(null);

      const [reportData, usersData, missionsResponse] = await Promise.all([
        apiFetch<Report>(`/reports/${uuid}`),
        apiFetch<User[]>('/users'),
        apiFetch<PageableResponse<Mission>>('/missions').catch(() => ({ content: [] })),
      ]);

      setReport(reportData);
      setUpdatedPriority(reportData.priority);
      setMissionTitle(`Field Verification Mission for ${reportData.title}`);

      // Filter Field Agents
      const fieldAgents = usersData.filter((user) =>
        user.roles.some((r) => r.includes('FIELD_AGENT'))
      );
      setAgents(fieldAgents);

      // Default Lead and Team Selection
      if (fieldAgents.length > 0) {
        setSelectedLeadAgentId(fieldAgents[0].id);
        setSelectedTeamMemberIds([fieldAgents[0].id]);
      }

      if (missionsResponse && missionsResponse.content) {
        setMissions(missionsResponse.content.filter((m) => m.reportUuid === uuid));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch details.');
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  // useEffect(() => {
  //   loadInitialData();
  // }, [loadInitialData]);

  useEffect(() => {
    if (!uuid) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        const [reportData, usersData, missionsResponse] = await Promise.all([
          apiFetch<Report>(`/reports/${uuid}`),
          apiFetch<User[]>('/users'),
          apiFetch<PageableResponse<Mission>>('/missions').catch(() => ({ content: [] })),
        ]);

        if (!isMounted) return;

        setReport(reportData);
        setUpdatedPriority(reportData.priority);
        setMissionTitle(`Field Verification Mission for ${reportData.title}`);

        // Filter Field Agents
        const fieldAgents = usersData.filter((user) =>
          user.roles.some((r) => r.includes('FIELD_AGENT'))
        );
        setAgents(fieldAgents);

        // Default Lead and Team Selection
        if (fieldAgents.length > 0) {
          setSelectedLeadAgentId(fieldAgents[0].id);
          setSelectedTeamMemberIds([fieldAgents[0].id]);
        }

        if (missionsResponse && missionsResponse.content) {
          setMissions(missionsResponse.content.filter((m) => m.reportUuid === uuid));
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [uuid]);
  // Fetch NGO Recommendations via caseUuid
  const fetchNgoRecommendations = async (caseUuid: string) => {
    try {
      setFetchingNgos(true);
      const ngos = await apiFetch<NgoRecommendation[]>(`/cases/${caseUuid}/match-ngo`);
      setNgoRecommendations(ngos);
      if (ngos.length > 0) {
        setSelectedNgo(ngos[0]);
      }
    } catch (err: unknown) {
      //alert(err instanceof Error ? err.message : 'Failed to fetch NGO recommendations.');
      DarkSwal.fire({
              icon: 'error',
              title: 'Fetch Error',
              text: err instanceof Error ? err.message : 'Failed to fetch NGO recommendations.',
            });
    } finally {
      setFetchingNgos(false);
    }
  };

  // 1. Submit Verification Decision (Creates Case if VERIFIED)
  const handleVerifyOrReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uuid) return;
    try {
      setVerifying(true);
      const payload: VerifyReportPayload = {
        decision,
        notes,
        verificationMethod,
        updatedPriority,
      };

      const verificationResponse = await apiFetch<VerificationRecordResponse>(
        `/verification/reports/${uuid}/verify`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const updatedReport = await apiFetch<Report>(`/reports/${uuid}`);
      setReport(updatedReport);

      if (decision === 'VERIFIED' && verificationResponse.caseUuid) {
        setActiveCaseUuid(verificationResponse.caseUuid);
       // alert(`Report VERIFIED! Case ${verificationResponse.caseNumber} created. Fetching NGO matches...`);
       DarkSwal.fire({
                 icon: 'success',
                 title: 'Report Verified',
                 text: `Case ${verificationResponse.caseNumber} created. Fetching NGO matches...`,
                 confirmButtonColor: '#10b981',
               });
        await fetchNgoRecommendations(verificationResponse.caseUuid);
      } else {
        //alert(`Report decision recorded as ${decision}`);
        //
        Toast.fire({
                  icon: 'info',
                  title: `Report decision recorded as ${decision}`,
                });
      }
    } catch (err: unknown) {
      //alert(err instanceof Error ? err.message : 'Failed to record decision.');
      DarkSwal.fire({
              icon: 'error',
              title: 'Submission Failed',
              text: err instanceof Error ? err.message : 'Failed to record decision.',
            });
    } finally {
      setVerifying(false);
    }
  };

  // 2. Dispatch Field Mission
  const handleDispatchMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uuid || !selectedLeadAgentId) {
      alert('Please select a lead field agent.');
      return;
    }
    if (selectedTeamMemberIds.length === 0) {
     // alert('Please add at least one team member to the mission.');
     DarkSwal.fire({
             icon: 'warning',
             title: 'Team Required',
             text: 'Please add at least one team member to the mission.',
           });
      return;
    }

    try {
      setDispatching(true);
      const newMission = await apiFetch<Mission>('/missions', {
        method: 'POST',
        body: JSON.stringify({
          reportUuid: uuid,
          leadAgentId: Number(selectedLeadAgentId),
          teamMemberIds: selectedTeamMemberIds,
          missionTitle,
        }),
      });

      setMissions((prev) => [newMission, ...prev]);
      //alert('Field verification mission successfully dispatched!');
      Toast.fire({
              icon: 'success',
              title: 'Field verification mission dispatched!',
            });
    } catch (err: unknown) {
      //alert(err instanceof Error ? err.message : 'Failed to dispatch mission
      DarkSwal.fire({
              icon: 'error',
              title: 'Dispatch Failed',
              text: err instanceof Error ? err.message : 'Failed to dispatch mission.',
            });
    } finally {
      setDispatching(false);
    }
  };

  // 3. Map Chosen Organization to Case
  const handleAssignOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseUuid || !selectedNgo) {
      //alert('Please select an NGO from the recommendations list.');
      DarkSwal.fire({
              icon: 'warning',
              title: 'Selection Required',
              text: 'Please select an NGO from the recommendations list.',
            });
      return;
    }
    try {
      setAssigningCase(true);
      const caseResult = await apiFetch<CaseResponse>(`/cases/${activeCaseUuid}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({
          assignedOrganizationId: selectedNgo.organizationId,
        }),
      });

      setAssignedCase(caseResult);
      //alert(`Case successfully assigned and sent to ${selectedNgo.organizationName}!`);
      DarkSwal.fire({
              icon: 'success',
              title: 'Case Assigned',
              text: `Case successfully assigned and sent to ${selectedNgo.organizationName}!`,
            });
    } catch (err: unknown) {
      //alert(err instanceof Error ? err.message : 'Failed to assign case.');
      DarkSwal.fire({
              icon: 'error',
              title: 'Assignment Failed',
              text: err instanceof Error ? err.message : 'Failed to assign case.',
            });
    } finally {
      setAssigningCase(false);
    }
  };

  const handleDownloadSynthesis = async (missionUuid: string, fileName: string) => {
    try {
      await apiDownload(`/missions/${missionUuid}/download`, fileName || 'mission_synthesis.pdf');
    } catch (err: unknown) {
      //alert(err instanceof Error ? err.message : 'Failed to download mission PDF.');
      DarkSwal.fire({
              icon: 'error',
              title: 'Download Failed',
              text: err instanceof Error ? err.message : 'Failed to download mission PDF.',
            });
    }
  };

  // Toggle Team Member Selection
  const toggleTeamMember = (agentId: number) => {
    setSelectedTeamMemberIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  // Filter Agents based on search
  const filteredAgents = agents.filter(
    (agent) =>
      `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(agentSearch.toLowerCase()) ||
      agent.email.toLowerCase().includes(agentSearch.toLowerCase())
  );

  if (loading) return <DashboardLayout><div className="p-8 text-center text-slate-400">Loading details...</div></DashboardLayout>;
  if (error || !report) return <DashboardLayout><div className="p-8 text-center text-rose-400">{error || 'Report not found.'}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <button
          onClick={() => navigate('/verifier/queue')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification Queue</span>
        </button>

        {/* Report Overview Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 text-sky-400 px-2.5 py-1 rounded font-mono font-bold">
                {report.status}
              </span>
              <span className="text-xs bg-slate-800 text-amber-400 px-2.5 py-1 rounded font-mono font-bold">
                {report.priority} PRIORITY
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Submitted: {new Date(report.submittedAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-xl font-bold text-white">{report.title}</h1>
          <p className="text-sm text-slate-300 leading-relaxed">{report.description}</p>
        </div>

        {/* SECTION 1: Field Mission Dispatch & Team Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            1. Field Verification Mission & Team Selection
          </h2>

          <form onSubmit={handleDispatchMission} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Mission Title</label>
                <input
                  type="text"
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Team Leader (Required)</label>
                <select
                  value={selectedLeadAgentId}
                  onChange={(e) => {
                    const leadId = Number(e.target.value);
                    setSelectedLeadAgentId(leadId);
                    // Ensure lead agent is automatically added to team members
                    if (leadId && !selectedTeamMemberIds.includes(leadId)) {
                      setSelectedTeamMemberIds((prev) => [...prev, leadId]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                >
                  <option value="">Select Team Leader</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.firstName} {agent.lastName} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Agent Search & Dynamic Team Member Add/Remove */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-medium">
                  Select Team Members ({selectedTeamMemberIds.length} Selected):
                </label>
                <input
                  type="text"
                  placeholder="Filter agents by name or email..."
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 w-64 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
                {filteredAgents.map((agent) => {
                  const isSelected = selectedTeamMemberIds.includes(agent.id);
                  const isLeader = selectedLeadAgentId === agent.id;

                  return (
                    <div
                      key={agent.id}
                      onClick={() => toggleTeamMember(agent.id)}
                      className={`p-2 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                        ) : (
                          <UserPlus className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">
                          {agent.firstName} {agent.lastName}
                        </span>
                      </div>
                      {isLeader && (
                        <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                          LEADER
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={dispatching || agents.length === 0}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {dispatching ? 'Dispatching Mission...' : 'Dispatch Field Mission'}
            </button>
          </form>

          {/* Previous Dispatched Missions & Reports History */}
          {missions.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                Previous Dispatched Missions & Synthesis Reports ({missions.length})
              </h3>
              <div className="space-y-2">
                {missions.map((mission) => (
                  <div
                    key={mission.uuid}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{mission.missionTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          mission.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {mission.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <UserCheck2 className="w-3.5 h-3.5 text-amber-400" /> Lead: <strong className="text-slate-200">{mission.leadAgentName}</strong>
                      </span>
                      <span>
                        Team ({mission.teamMemberNames.length}): <strong className="text-slate-200">{mission.teamMemberNames.join(', ')}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Started: {new Date(mission.startedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {mission.synthesizedSummary && (
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300 text-[11px] space-y-1">
                        <strong className="text-sky-400">Field Synthesized Summary:</strong>
                        <p className="leading-relaxed">{mission.synthesizedSummary}</p>
                      </div>
                    )}

                    {mission.pdfReportFileName && (
                      <button
                        onClick={() =>
                          handleDownloadSynthesis(mission.uuid, mission.pdfReportFileName!)
                        }
                        className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold pt-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Field Synthesis PDF ({mission.pdfReportFileName})</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Submit Verification Decision */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            2. Submit Verification Decision
          </h2>

          <form onSubmit={handleVerifyOrReject} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as 'VERIFIED' | 'REJECTED')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="VERIFIED">VERIFIED (Creates Case)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Verification Method</label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="PHONE_CONFIRMATION">Phone Confirmation</option>
                  <option value="FIELD_VISIT">Field Visit</option>
                  <option value="COMMUNITY_SOURCE">Community Source</option>
                  <option value="SATELLITE_IMAGE">Satellite Image</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reclassify Priority</label>
                <select
                  value={updatedPriority}
                  onChange={(e) => setUpdatedPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Verifier Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Detail verification findings..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                decision === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {verifying ? 'Verifying...' : `Submit Decision (${decision})`}
            </button>
          </form>
        </div>

        {/* SECTION 3: NGO Matching & Case Assignment */}
        {activeCaseUuid && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-400" />
                3. Match & Assign Organization to Case
              </h2>
              <button
                onClick={() => fetchNgoRecommendations(activeCaseUuid)}
                disabled={fetchingNgos}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sky-400 rounded text-xs border border-slate-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingNgos ? 'animate-spin' : ''}`} />
                {fetchingNgos ? 'Fetching Matches...' : 'Refresh Matches'}
              </button>
            </div>

            {/* NGO Match Suggestions Pop-Up List */}
            {ngoRecommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Suggested NGO Recommendations:</p>
                <div className="grid gap-2">
                  {ngoRecommendations.map((ngo) => {
                    const isSelected = selectedNgo?.organizationId === ngo.organizationId;
                    return (
                      <div
                        key={ngo.organizationId}
                        onClick={() => setSelectedNgo(ngo)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-sky-950/60 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className={`w-5 h-5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                          <div>
                            <p className="font-bold text-sm">{ngo.organizationName}</p>
                            <p className="text-[11px] text-slate-400">
                              Type: <span className="text-slate-300">{ngo.organizationType}</span> | Distance:{' '}
                              <span className="text-slate-300">
                                {ngo.distanceKm !== null ? `${ngo.distanceKm} km` : 'N/A'}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-mono font-bold text-amber-400 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/50">
                            <Award className="w-3.5 h-3.5" />
                            {ngo.matchScore}% Match
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assign Selected NGO Form */}
            {!assignedCase ? (
              <form onSubmit={handleAssignOrganization} className="space-y-4 text-xs pt-4 border-t border-slate-800">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 block mb-1">Selected NGO for Case Mapping:</span>
                  <span className="text-sky-400 font-bold">
                    {selectedNgo ? `${selectedNgo.organizationName} (ID: ${selectedNgo.organizationId})` : 'Select an NGO above'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={assigningCase || !selectedNgo}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                >
                  {assigningCase ? 'Mapping Organization...' : `Map & Send Case to ${selectedNgo ? selectedNgo.organizationName : 'NGO'}`}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-lg flex items-center gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Organization successfully mapped to Case!</p>
                  <p className="text-[11px] text-emerald-400/80">
                    Case Number: <span className="font-mono">{assignedCase.caseNumber}</span> | Assigned Org:{' '}
                    {assignedCase.assignedOrganization.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
