import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import  UsersPage  from '../features/users/pages/UsersPage';
import  CompaniesPage  from '../features/companies/pages/CompaniesPage';
import  JobsPage  from '../features/jobs/pages/JobsPage';
import  MyProjectsPage  from '../features/projects/pages/MyProjectsPage';
import ProjectsReviewPage from '../features/projects/pages/ProjectsReviewPage';
import ContentModerationPage from '../features/moderation/pages/ContentModerationPage';
import SubscriptionsPage from '../features/subscriptions/pages/SubscriptionsPage';
import  Dashboard  from '../features/dashboard/page/Dashboard';
import ActivityPage from '../features/activity/pages/ActivityPage';
import SavedPage from '../features/saved/pages/SavedPage';
import ApplicantsPage from '../features/applicants/pages/ApplicantsPage';
import NotFoundPage from '../pages/NotFoundPage';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />, // Automatically redirect to the dashboard
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    // When your auth system is ready, change this to:
    element: (<ProtectedRoute><DashboardLayout /></ProtectedRoute>),
    children: [
      {
        index: true,
        element: (
          <Dashboard />
        ),
      },
      {
        path: 'users',
        element: (<ProtectedRoute allowedRoles={['admin']}>
          <UsersPage />
        </ProtectedRoute>),
      },
      {
        path: 'companies',
        element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <CompaniesPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'jobs',
        element: (
        <ProtectedRoute allowedRoles={['admin', 'company']}>
          <JobsPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'activity',
        element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <ActivityPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'projects',
        element: (
        <ProtectedRoute allowedRoles={['student', 'user']}>
          <MyProjectsPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'projects/review',
        element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <ProjectsReviewPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'moderation',
        element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <ContentModerationPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'subscriptions',
        element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <SubscriptionsPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'saved',
        element: (
        <ProtectedRoute allowedRoles={['student']}>
          <SavedPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'applicants',
        element: (
        <ProtectedRoute allowedRoles={['company']}>
          <ApplicantsPage />
        </ProtectedRoute>
      ),
      },
      {
        path: 'settings',
        element: (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-4 animate-fade-in">
            <h2 className="text-xl text-text">⚙️ Settings</h2>
            <p className="text-text-secondary">System configuration coming soon.</p>
          </div>
        ),
      }
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
