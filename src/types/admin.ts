export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  roles: string[];
  status?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  reportType: 'HUMANITARIAN' | 'PEACE_BUILDING' | string;
  active: boolean;
}

export interface LocationItem {
  id: number;
  country: string;
  province: string;
  territory: string;
  city: string;
  sector: string;
  locationName: string;
  latitude: number;
  longitude: number;
  precisionLevel: string;
  createdAt: string;
}

export interface Organization {
  id: number;
  uuid: string;
  name: string;
  organizationType: string;
  description: string;
  email: string;
  phone: string;
  status: string;
  locations: LocationItem[];
  createdAt: string;
}

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  preferredLanguage: string;
  roles: string[];
}

export interface CreateOrganizationPayload {
  name: string;
  organizationType: string;
  description: string;
  email: string;
  phone: string;
  locationIds: number[];
}

export interface AssignUserOrgPayload {
  userId: number;
  organizationId: number;
  position: string;
}

export interface OrganizationUserResponse {
  id: number;
  organizationId: number;
  organizationName: string;
  userId: number;
  userName: string;
  position: string;
  status: string;
}

export interface AuditLog {
  id: number;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  oldValue: string;
  newValue: string;
  createdAt: string;
}
