export interface AnalyticsStats {
  totalReports: number;
  verifiedReports: number;
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalBeneficiariesReached: number;
}

export interface MapMarker {
  caseNumber: string;
  reportTitle: string;
  categoryName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  latitude: number;
  longitude: number;
  province: string;
  city: string;
}

export interface TrendPoint {
  date: string;
  reportCount: number;
  caseCount: number;
}

export interface OrganizationPerformance {
  organizationId: number;
  organizationName: string;
  totalAssignedCases: number;
  completedCases: number;
  totalBeneficiaries: number;
}

export interface AnalyticsDashboardResponse {
  stats: AnalyticsStats;
  reportsByCategory: Record<string, number>;
  casesByStatus: Record<string, number>;
  trends: TrendPoint[];
  mapMarkers: MapMarker[];
  organizationPerformance: OrganizationPerformance[];
}