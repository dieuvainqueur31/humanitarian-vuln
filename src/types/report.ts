export type ReportStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'CONVERTED_TO_CASE';

export interface ReportCategory {
  id: number;
  name: string;
  description: string;
  reportType: 'PEACE_SECURITY' | 'HUMANITARIAN';
  active: boolean;
}

export interface LocationItem {
  id?: number;
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

export interface CreateReportPayload {
  categoryId: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anonymous: boolean;
  incidentDate: string;
  locationId: number;
}

export interface ReportDetailsResponse {
  uuid: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ReportStatus;
  anonymous: boolean;
  incidentDate: string;
  submittedAt: string;
  category: ReportCategory;
  location: LocationItem;
  reporterName: string;
  attachments: Attachment[];
}

export interface LocalTrackingRecord {
  uuid: string;
  title: string;
  submittedAt: string;
  status?: ReportStatus;
}