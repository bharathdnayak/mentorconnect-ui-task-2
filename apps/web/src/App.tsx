import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserRole } from '@mentorconnect/shared';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Public pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnauthorizedPage, NotFoundPage } from './pages/auth/UnauthorizedPage';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentMentorPage } from './pages/student/StudentMentorPage';
import { StudentRecommendationsPage } from './pages/student/StudentRecommendationsPage';
import { StudentSessionsPage } from './pages/student/StudentSessionsPage';
import { StudentAnnouncementsPage, StudentSettingsPage } from './pages/student/StudentAnnouncementsPage';

// Mentor pages
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MentorMenteesPage } from './pages/mentor/MentorMenteesPage';
import { MenteeDetailPage } from './pages/mentor/MenteeDetailPage';
import { MentorSessionsPage } from './pages/mentor/MentorSessionsPage';
import { MentorProfilePage, MentorAnnouncementsPage, MentorSettingsPage } from './pages/mentor/MentorProfilePage';

// HOD pages
import { HodDashboard } from './pages/hod/HodDashboard';
import { HodStudentsPage } from './pages/hod/HodStudentsPage';
import { HodMentorsPage } from './pages/hod/HodMentorsPage';
import { HodAssignmentsPage } from './pages/hod/HodAssignmentsPage';
import { HodChangeRequestsPage } from './pages/hod/HodChangeRequestsPage';
import { HodRecommendationsPage } from './pages/hod/HodRecommendationsPage';
import { HodSessionsPage } from './pages/hod/HodSessionsPage';
import { HodDepartmentsPage, HodAnnouncementsPage } from './pages/hod/HodDepartmentsPage';
import { HodReportsPage } from './pages/hod/HodReportsPage';
import { HodAuditLogsPage, HodSettingsPage } from './pages/hod/HodAuditLogsPage';

// Loading spinner
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" message="Verifying authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === UserRole.STUDENT) return <Navigate to="/student/dashboard" replace />;
  if (user.role === UserRole.MENTOR) return <Navigate to="/mentor/dashboard" replace />;
  if (user.role === UserRole.HOD) return <Navigate to="/hod/dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="mentor" element={<StudentMentorPage />} />
          <Route path="recommendations" element={<StudentRecommendationsPage />} />
          <Route path="sessions" element={<StudentSessionsPage />} />
          <Route path="announcements" element={<StudentAnnouncementsPage />} />
          <Route path="settings" element={<StudentSettingsPage />} />
        </Route>

        {/* Protected Mentor Routes */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MENTOR]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="mentees" element={<MentorMenteesPage />} />
          <Route path="mentees/:studentId" element={<MenteeDetailPage />} />
          <Route path="sessions" element={<MentorSessionsPage />} />
          <Route path="profile" element={<MentorProfilePage />} />
          <Route path="announcements" element={<MentorAnnouncementsPage />} />
          <Route path="settings" element={<MentorSettingsPage />} />
        </Route>

        {/* Protected HOD Routes */}
        <Route
          path="/hod"
          element={
            <ProtectedRoute allowedRoles={[UserRole.HOD]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<HodDashboard />} />
          <Route path="students" element={<HodStudentsPage />} />
          <Route path="mentors" element={<HodMentorsPage />} />
          <Route path="assignments" element={<HodAssignmentsPage />} />
          <Route path="change-requests" element={<HodChangeRequestsPage />} />
          <Route path="recommendations" element={<HodRecommendationsPage />} />
          <Route path="sessions" element={<HodSessionsPage />} />
          <Route path="departments" element={<HodDepartmentsPage />} />
          <Route path="announcements" element={<HodAnnouncementsPage />} />
          <Route path="reports" element={<HodReportsPage />} />
          <Route path="audit-logs" element={<HodAuditLogsPage />} />
          <Route path="settings" element={<HodSettingsPage />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
