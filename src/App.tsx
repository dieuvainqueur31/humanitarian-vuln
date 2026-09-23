import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { LoginPage } from './pages/LoginPage';
import { SubmitReportPage } from './pages/SubmitReportPage';
import { VerificationQueuePage } from './pages/verifier/VerificationQueuePage';
import { VerifierDetailPage } from './pages/verifier/VerifierDetailPage';
import { NgoOverviewPage } from './pages/ngo/NgoOverviewPage';
import { AnalyticsReportsPage } from './pages/analytics/AnalyticsReportsPage';
import { FieldAgentDashboardPage } from './pages/agent/FieldAgentDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/submit-report" element={<SubmitReportPage />} />

                {/* Fallback & Direct Access Route for Unauthorized Page */}
                <Route
            path="/unauthorized"
            element={
              <DashboardLayout>
                <UnauthorizedPage />
              </DashboardLayout>
            }
          />

          {/* unauthorized Fully Functional & Protected Verifier Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifier/queue"
            element={
              <ProtectedRoute allowedRoles={['VERIFIER']}>
                <VerificationQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifier/reports/:uuid"
            element={
              <ProtectedRoute>
                <VerifierDetailPage />
              </ProtectedRoute>
            }
          />
          {/* Role 2: FIELD_AGENT */}
          <Route
            path="/agent/*"
            element={
              <ProtectedRoute allowedRoles={['FIELD_AGENT']}>
                <FieldAgentDashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Role 3: NGO_MANAGER */}
          <Route
            path="/ngo/*"
            element={
              <ProtectedRoute allowedRoles={['NGO_MANAGER']}>
                <NgoOverviewPage />
              </ProtectedRoute>
            }
          />

          {/* Role 4: ANALYST */}
          <Route
            path="/analytics/*"
            element={
              <ProtectedRoute allowedRoles={['ANALYST']}>
                <AnalyticsReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
           path="/my-reports"
           element={
            <ProtectedRoute allowedRoles={['COMMUNITY_REPORTER']}>
              <SubmitReportPage/>
            </ProtectedRoute>
           }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
