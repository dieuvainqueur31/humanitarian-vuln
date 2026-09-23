export interface PublicLocation {
  country: string;
  province: string;
  territory: string;
  city: string;
  sector: string;
}

export interface PublicReport {
  uuid: string;
  categoryName: string;
  reportType: 'HUMANITARIAN' | 'PEACE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  incidentDate: string;
  submittedAt: string;
  location: PublicLocation;
}

export interface ReportCategory {
  id: number;
  name: string;
  description: string;
  reportType: 'HUMANITARIAN' | 'PEACE';
  active: boolean;
}

export interface PublicLandingData {
  statistics: {
    totalPublicReports: number;
    totalVerifiedIncidents: number;
    resolvedCases: number;
    reportsByCategory: Record<string, number>;
    reportsByProvince: Record<string, number>;
  };
  recentPublicReports: PublicReport[];
  activeCategories: ReportCategory[];
}