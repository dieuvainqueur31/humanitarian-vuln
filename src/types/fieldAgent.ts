export interface AssignedMission {
  missionId: number;
  missionUuid: string;
  missionTitle: string;
  missionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  reportId: number;
  reportTitle: string;
  reportDescription: string;
  reportPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reportStatus: string;
  isAnonymous: boolean;
  incidentDate: string;
}

export interface ObservationPayload {
  observationDetails: string;
  assessmentLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedLatitude: number;
  observedLongitude: number;
}

export interface MissionSynthesisResponse {
  uuid: string;
  reportUuid: string;
  reportTitle: string;
  leadAgentName: string;
  teamMemberNames: string[];
  missionTitle: string;
  status: string;
  synthesizedSummary: string;
  pdfReportStoragePath: string;
  startedAt: string;
  completedAt: string;
}

export interface ObservationPayload {
  observationDetails: string;
  assessmentLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedLatitude: number;
  observedLongitude: number;
}

export interface FieldObservation extends ObservationPayload {
  id: number;
  reporterName?: string;
  createdAt: string;
  isOfflinePending?: boolean;
}