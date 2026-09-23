import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiFetch } from '../../services/api';
import { showAlert } from '../../utils/alert';
import type { CaseResponse, PageableResponse, ReportDetails } from '../../types/verification';
import type {
  OrganizationMember,
  InterventionUpdateStatus,
  CreateInterventionPayload,
  InterventionResponse,
} from '../../types/ngo';
import { PlanInterventionForm } from '../../components/ngo/PlanInterventionForm';
import { FieldUpdateForm } from '../../components/ngo/FieldUpdateForm';
import { InterventionActionModal } from '../../components/ngo/InterventionActionModal';
import {
  Briefcase,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  Clock,
  ShieldAlert,
  MapPin,
  AlertCircle,
  Activity,
  Layers,
  UserCheck,
} from 'lucide-react';

export const NgoOverviewPage: React.FC = () => {
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseResponse | null>(null);
  const [detailedCasesMap, setDetailedCasesMap] = useState<Record<string, CaseResponse>>({});
  const [orgInterventions, setOrgInterventions] = useState<InterventionResponse[]>([]);
  const [activeIntervention, setActiveIntervention] = useState<InterventionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assignment Modal State
  const [activeCase, setActiveCase] = useState<CaseResponse | null>(null);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);

  // Formatting Helpers
  const formatLocation = (location?: ReportDetails['location']): string => {
    if (!location) return 'Location Unspecified';
    if (typeof location === 'string') return location;
    return (
      [location.locationName, location.city, location.province, location.country]
        .filter(Boolean)
        .join(', ') || 'Location details unavailable'
    );
  };

  const formatCategory = (category?: ReportDetails['category']): string => {
    if (!category) return 'General';
    return typeof category === 'string' ? category : 'General';
  };

  // Fetch intervention specifically by Case UUID using /interventions/case/{caseUuid}
  const refreshInterventionForCase = async (caseUuid: string) => {
    try {
      const result = await apiFetch<InterventionResponse[] | InterventionResponse>(
        `/interventions/case/${caseUuid}`
      );
      if (Array.isArray(result)) {
        setActiveIntervention(result.length > 0 ? result[0] : null);
      } else if (result && typeof result === 'object') {
        setActiveIntervention(result);
      } else {
        setActiveIntervention(null);
      }
    } catch {
      setActiveIntervention(null);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);

      // 1. Fetch assigned cases for the NGO
      let loadedCases: CaseResponse[] = [];
      try {
        const caseData = await apiFetch<PageableResponse<CaseResponse>>(
          '/ngo/cases/?page=0&size=50'
        );
        loadedCases = caseData.content || [];
      } catch {
        const pendingData = await apiFetch<PageableResponse<CaseResponse>>(
          '/ngo/cases/pending?page=0&size=50'
        );
        loadedCases = pendingData.content || [];
      }

      // 2. Fetch full Report Details
      const detailsPromises = loadedCases.map(async (c) => {
        try {
          const detailedCase = await apiFetch<CaseResponse>(`/cases/${c.uuid}`);
          if (detailedCase.reportUuid) {
            try {
              detailedCase.report = await apiFetch<ReportDetails>(`/reports/${detailedCase.reportUuid}`);
            } catch {
              // Ignore report fetch errors
            }
          }
          return detailedCase;
        } catch {
          return c;
        }
      });

      const fullCases = await Promise.all(detailsPromises);
      const map: Record<string, CaseResponse> = {};
      fullCases.forEach((fc) => {
        map[fc.uuid] = fc;
      });

      // 3. Fetch Organization Interventions (getMyorganizationIntervention endpoint)
      try {
        const myOrgInterventions = await apiFetch<PageableResponse<InterventionResponse>>(
          '/interventions/'
        );
        setOrgInterventions(myOrgInterventions?.content || []);
      } catch (err) {
        console.warn('Could not fetch organization interventions:', err);
        setOrgInterventions([]);
      }

      // 4. Fetch Organization Members
      let orgMembers: OrganizationMember[] = [];
      if (loadedCases.length > 0) {
        const orgId = loadedCases[0].assignedOrganization?.id;
        if (orgId) {
          try {
            orgMembers = (await apiFetch<OrganizationMember[]>(
              `/organization-users/organization/${orgId}`
            )) || [];
          } catch (mErr) {
            console.warn('Could not fetch members:', mErr);
          }
        }
      }

      setCases(loadedCases);
      setDetailedCasesMap(map);
      setMembers(orgMembers);

      if (selectedCase) {
        refreshInterventionForCase(selectedCase.uuid);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load NGO dashboard.';
      setError(msg);
      showAlert.error('Dashboard Error', msg);
    }  finally {
      setLoading(false);
    }
  }, [selectedCase]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchDashboard();
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchDashboard]);

  // Expand case details and fetch associated intervention using interventionBycase endpoint
  const handleSelectCase = async (uuid: string) => {
    if (selectedCase?.uuid === uuid) {
      setSelectedCase(null);
      setActiveIntervention(null);
      return;
    }

    const targetCase = detailedCasesMap[uuid] || (await apiFetch<CaseResponse>(`/cases/${uuid}`));
    setSelectedCase(targetCase);
    await refreshInterventionForCase(uuid);
  };

  const handleRespondCaseAssignment = async (
    caseUuid: string,
    accept: boolean,
    rejectionReason?: string
  ) => {
    try {
      await apiFetch(`/interventions/${caseUuid}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ accept, rejectionReason }),
      });

      showAlert.success(
        accept ? 'Assignment Accepted' : 'Assignment Declined',
        accept
          ? 'Case status updated to IN_PROGRESS. You can now configure field operations.'
          : 'Case assignment was declined.'
      );
      fetchDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not submit assignment response.';
      showAlert.error('Action Failed', msg);
    }
  };

  const handleCreateIntervention = async (payload: CreateInterventionPayload) => {
    try {
      const created = await apiFetch<InterventionResponse>('/interventions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setActiveIntervention(created);
      showAlert.success('Intervention Planned', 'Field intervention parameters recorded successfully.');
      if (selectedCase) {
        refreshInterventionForCase(selectedCase.uuid);
      }
      fetchDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not record intervention details.';
      showAlert.error('Intervention Creation Failed', msg);
    }
  };

  const handlePostFieldUpdate = async (
    interventionId: number,
    message: string,
    status: InterventionUpdateStatus
  ) => {
    try {
      await apiFetch(`/interventions/${interventionId}/field-updates`, {
        method: 'POST',
        body: JSON.stringify({ message, status }),
      });

      showAlert.success('Status Updated', 'Field progress update logged to mission timeline.');
      if (selectedCase) {
        await refreshInterventionForCase(selectedCase.uuid);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save field status update.';
      showAlert.error('Update Failed', msg);
    }
  };

  const handleCompleteCase = async (caseUuid: string) => {
    const confirmed = await showAlert.confirm(
      'Complete Case Operation?',
      'This will mark all intervention activities as completed and finalize the operation.'
    );

    if (!confirmed) return;

    try {
      await apiFetch(
        `/interventions/case/${caseUuid}/complete?reason=${encodeURIComponent(
          'Intervention completed successfully and relief verified in field.'
        )}`,
        { method: 'POST' }
      );

      showAlert.success('Operation Completed', 'Case has been successfully finalized.');
      fetchDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize case completion.';
      showAlert.error('Completion Error', msg);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-slate-400 text-center">Loading NGO operations workspace...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400" /> NGO Operations Workspace
            </h1>
            <p className="text-xs text-slate-400">
              Manage assigned humanitarian cases, dispatch interventions, and log live field progress.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" /> Assigned Cases ({cases.length})
            </h2>

            {cases.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                No active or pending cases assigned to your organization.
              </div>
            ) : (
              cases.map((c) => {
                const fullDetails = detailedCasesMap[c.uuid] || c;
                const report = fullDetails.report;
                const isSelected = selectedCase?.uuid === c.uuid;

                // Check if an intervention exists in orgInterventions list for this case
                const caseIntervention = activeIntervention?.caseUuid === c.uuid
                  ? activeIntervention
                  : orgInterventions.find((item) => item.caseUuid === c.uuid);

                return (
                  <div
                    key={c.uuid}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded font-bold">
                            {c.status}
                          </span>
                          <span className="text-[10px] font-mono bg-rose-950/80 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                            {c.priority} PRIORITY
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">{c.caseNumber}</h3>
                      </div>

                      {c.status === 'ASSIGNED' && (
                        <button
                          onClick={() => {
                            setActiveCase(fullDetails);
                            setIsRespondModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" /> Respond to Assignment
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          {report?.title || `Incident Report #${c.reportUuid?.substring(0, 8)}`}
                        </span>

                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                          {formatCategory(report?.category)}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed">
                        {report?.description || 'Loading incident report summary...'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" /> {formatLocation(report?.location)}
                        </span>

                        {report?.affectedCount !== undefined && (
                          <span className="flex items-center gap-1 text-amber-300 font-semibold">
                            <Users className="w-3.5 h-3.5 text-amber-400" /> ~{report.affectedCount} People Affected
                          </span>
                        )}

                        <span className="flex items-center gap-1 ml-auto text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> Opened: {new Date(c.openedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => handleSelectCase(c.uuid)}
                        className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>{isSelected ? 'Collapse Details' : 'Manage Intervention & Field Operations'}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </button>

                      {(c.status === 'IN_PROGRESS' || selectedCase?.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => handleCompleteCase(c.uuid)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Finalize Operation
                        </button>
                      )}
                    </div>

                    {isSelected && (
                      <div className="pt-4 border-t border-slate-800 space-y-5">
                        {caseIntervention ? (
                          <div className="bg-sky-950/30 border border-sky-800/60 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center border-b border-sky-800/40 pb-2">
                              <h5 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-sky-400" /> Planned Intervention Details
                              </h5>
                              <span className="text-[10px] font-mono bg-sky-900 text-sky-200 px-2 py-0.5 rounded font-bold">
                                STATUS: {caseIntervention.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[11px]">Type:</span>
                                <span className="font-semibold text-slate-200">{caseIntervention.interventionType}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Target Beneficiaries:</span>
                                <span className="font-semibold text-amber-300">
                                  {caseIntervention.beneficiariesCount || 0} People
                                </span>
                              </div>
                              {caseIntervention.plannedDate && (
                                <div className="md:col-span-2">
                                  <span className="text-slate-400 block text-[11px]">Planned Target Date:</span>
                                  <span className="font-semibold text-slate-200">
                                    {new Date(caseIntervention.plannedDate).toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <div className="md:col-span-2">
                                <span className="text-slate-400 block text-[11px]">Mission Description:</span>
                                <p className="text-slate-300 mt-0.5">{caseIntervention.description}</p>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-sky-900/50 space-y-2">
                              <h6 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-sky-400" /> Field Progress Log
                              </h6>
                              {caseIntervention.updates && caseIntervention.updates.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {caseIntervention.updates.map((up) => (
                                    <div
                                      key={up.id}
                                      className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs space-y-1"
                                    >
                                      <div className="flex justify-between text-[11px]">
                                        <span className="font-bold text-sky-400">{up.status}</span>
                                        <span className="text-slate-500">
                                          {new Date(up.createdAt).toLocaleTimeString()}
                                        </span>
                                      </div>
                                      <p className="text-slate-300">{up.message}</p>
                                      {up.createdByName && (
                                        <p className="text-[10px] text-slate-500 text-right">By: {up.createdByName}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No field updates logged yet.</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <PlanInterventionForm
                            caseUuid={c.uuid}
                            onSuccess={fetchDashboard}
                            apiCreateIntervention={handleCreateIntervention}
                          />
                        )}

                        {/* Continuous Field Update Logging: accessible throughout the mission lifecycle until completed or cancelled */}
                        {caseIntervention &&
                          caseIntervention.status !== 'COMPLETED' &&
                          caseIntervention.status !== 'CANCELLED' && (
                            <div className="pt-2">
                              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Post Live Field Update
                              </h5>
                              <FieldUpdateForm
                                interventionId={caseIntervention.id}
                                onUpdateAdded={fetchDashboard}
                                apiPostUpdate={handlePostFieldUpdate}
                              />
                            </div>
                          )}

                        <div className="bg-slate-950 p-3.5 rounded-lg space-y-2 border border-slate-800">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Case Audit Trail
                          </h5>
                          {fullDetails.history && fullDetails.history.length > 0 ? (
                            fullDetails.history.map((h) => (
                              <div
                                key={h.id}
                                className="text-xs text-slate-300 flex justify-between border-b border-slate-900 pb-1.5 pt-1"
                              >
                                <div>
                                  <span className="font-semibold text-sky-400">
                                    {h.oldStatus ?? 'CREATED'} → {h.newStatus}
                                  </span>
                                  {h.reason && <p className="text-[11px] text-slate-400">{h.reason}</p>}
                                </div>
                                <span className="text-slate-500 text-[11px]">{h.changedByName}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">No status audit entries available.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" /> Field Responders
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 divide-y divide-slate-800">
              {members.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">No organization members found.</div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{m.name || m.lastName ||m.firstName || m.email}</p>
                      <p className="text-[11px] text-slate-400">{m.position}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                      {m.status || 'ACTIVE'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {activeCase && (
          <InterventionActionModal
            interventionId={activeCase.uuid as unknown as number}
            isOpen={isRespondModalOpen}
            onClose={() => setIsRespondModalOpen(false)}
            onSuccess={fetchDashboard}
            apiRespond={(_id, accept, rejectionReason) =>
              handleRespondCaseAssignment(activeCase.uuid, accept, rejectionReason)
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
};
