// src/types/ngo.ts

export type InterventionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type InterventionUpdateStatus =
  | 'INITIALIZED'
  | 'TEAM_DISPATCHED'
  | 'ON_SITE'
  | 'RESOURCES_DEPLOYED'
  | 'STABILIZED'
  | 'COMPLETED'
  | 'BLOCKED';


  export interface OrganizationMember {
    id: number;
    userId: number;
    organizationId: number;
    firstName?: string;
    lastName?: string;
    name?: string; // Add the name property here if applicable
    email?: string;
    position?: string;
    status?: string;
  }
  export interface InterventionOrganization {
    id: number;
    uuid: string;
    name: string;
    organizationType: string;
    description: string;
    email: string;
    phone: string;
    status: string;
    locations?: unknown[];
    createdAt: string;
  }
// Matches CreateInterventionRequest Java Record
export interface CreateInterventionPayload {
  caseUuid: string;
  organizationId?: number;
  assignedToUserId?: number;
  interventionType: string;
  description: string;
  plannedDate?: string; // ISO LocalDateTime string e.g. "2026-09-15T10:00:00"
  beneficiariesCount?: number;
}

// Matches CreateInterventionUpdateRequest Java Record
export interface CreateInterventionUpdateRequest {
  message: string;
  status?: InterventionUpdateStatus;
}

// Matches InterventionUpdateResponse Java Record
export interface InterventionUpdateResponse {
  id: number;
  createdByName?: string;
  message: string;
  status: InterventionUpdateStatus;
  createdAt: string;
}

export interface InterventionResponse {
  id: number;
    caseUuid: string;
    caseNumber?: string;
    organization?: InterventionOrganization; // Updated from assignedOrganizationId
    assignedToName?: string | null;           // Updated from assignedToUserId
    interventionType: string;
    description: string;
    status: InterventionStatus;
    plannedDate?: string;
    completedDate?: string | null;
    beneficiariesCount?: number;
    updates?: InterventionUpdateResponse[];
    createdAt: string;
    updatedAt?: string;
}
