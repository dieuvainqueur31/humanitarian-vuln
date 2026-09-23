import { apiFetch, apiUpload } from './api';
import type {
    ReportCategory,
    LocationItem,
    CreateReportPayload,
    ReportDetailsResponse,
} from '../types/report';

export const reportService = {
  getCategories: async (type?: string): Promise<ReportCategory[]> => {
    const query = type ? `?type=${type}` : '';
    return apiFetch<ReportCategory[]>(`/reports/categories${query}`);
  },

  getLocations: async (): Promise<LocationItem[]> => {
    return apiFetch<LocationItem[]>('/locations');
  },

  createReport: async (payload: CreateReportPayload): Promise<ReportDetailsResponse> => {
    return apiFetch<ReportDetailsResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  uploadAttachments: async (reportUuid: string, files: File[]): Promise<unknown> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiUpload(`/reports/${reportUuid}/attachments`, formData);
  },

  /**
   * Fetch a single report by UUID to verify approval/review status
   * GET /api/v1/reports/{uuid}
   */
  getReportByUuid: async (uuid: string): Promise<ReportDetailsResponse> => {
    return apiFetch<ReportDetailsResponse>(`/reports/${uuid}`);
  },
};