export interface ReportDetails {
  uuid: string;
  title?: string;
  description: string;
  category: string;
  //location?: string;
  location?: ReportLocation | string;
  latitude?: number;
  longitude?: number;
  urgencyLevel?: string;
  affectedCount?: number;
  createdAt: string;
}
export interface ReportCategory {
  id: number;
  name: string;
  description: string;
  reportType: 'PEACE_SECURITY' | 'HUMANITARIAN';
  active: boolean;
}

export interface ReportLocation {
  country: string;
  province: string;
  territory: string;
  city: string;
  sector: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  precisionLevel: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  createdAt: string;
}

export interface Report {
  uuid: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'DUPLICATE' | 'CASE_CREATED'|'PENDING_VERIFICATION'|'CONVERTED_TO_CASE';
  anonymous: boolean;
  incidentDate: string;
  submittedAt: string;
  category: ReportCategory;
  location: ReportLocation;
  reporterName: string;
  attachments: Attachment[];
}

export interface VerifyReportPayload {
  decision: 'VERIFIED' | 'REJECTED';
  notes: string;
  verificationMethod: 'PHONE_CONFIRMATION' | 'FIELD_VISIT' | 'COMMUNITY_SOURCE' | 'SATELLITE_IMAGE';
  updatedPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedOrganizationId?: number | null;
  assignedUserId?: number | null;
}

export interface VerificationRecordResponse {
  id: number;
  reportUuid: string;
  caseUuid?: string | null;
  caseNumber?: string | null;
  verifierName: string;
  decision: string;
  notes: string;
  verificationMethod: string;
  verifiedAt: string;
}
export interface CreateCasePayload {
  reportUuid: string;
  assignedOrganizationId: number;
  priority: string;
}

export interface NgoRecommendation {
  organizationId: number;
  organizationName: string;
  organizationType: string;
  distanceKm: number | null;
  isLocationExactMatch: boolean;
  matchScore: number;
}

export interface CreateMissionPayload {
  reportUuid: string;
  leadAgentId: number;
  teamMemberIds: number[];
  missionTitle: string;
}
export interface User {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  preferredLanguage: string;
  roles: string[];
}

export interface CaseResponse {
  id: number;
  uuid: string;
  caseNumber: string;
  reportUuid: string;
  report?: ReportDetails; // Linked incident report details
  priority: string;
  status: string;
  assignedOrganization: {
    id: number;
    uuid: string;
    name: string;
    organizationType: string;
    description: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  };
  assignedUserName: string | null;
  openedAt: string;
  updatedAt: string;
  closedAt: string | null;
  history?: CaseHistory[]; // Added history array
  interventionId?: number;
}
export interface CaseHistory {
  id: number;
  oldStatus: string | null;
  newStatus: string;
  changedByName: string;
  reason?: string;
  createdAt: string;
}

export interface PageableResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CaseResponse {
  id: number;
  uuid: string;
  caseNumber: string;
  reportUuid: string;
  priority: string;
  status: string;
  assignedOrganization: {
    id: number;
    uuid: string;
    name: string;
    organizationType: string;
    description: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  };
  assignedUserName: string | null;
  openedAt: string;
  updatedAt: string;
  closedAt: string | null;
}
export interface Mission {
  uuid: string;
  reportUuid: string;
  reportTitle: string;
  leadAgentName: string;
  teamMemberNames: string[];
  missionTitle: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  synthesizedSummary: string | null;
  pdfReportFileName: string | null;
  downloadUrl: string | null;
  startedAt: string | null;
  completedAt: string | null;
}
