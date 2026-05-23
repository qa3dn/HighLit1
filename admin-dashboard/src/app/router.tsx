import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import Users from '../features/users/page/Users';
import Companies from '../features/companies/page/Companies';
import Dashboard from '../features/dashboard/page/Dashboard';
import NotFoundPage from '../pages/NotFoundPage';

import Login from '../features/auth/page/Login';
import { ProtectedRoute } from '../routes/ProtectedRoute';

import Projects from '../features/projects/page/Projects';
import Saved from '../features/saved/page/Saved';
import Jobs from '../features/jobs/page/Jobs';
import Applicants from '../features/applicants/page/Applicants';
import Settings from '../features/settings/page/Settings';
import Profile from '../features/profile/page/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />, // Automatically redirect to the dashboard
  },
  {
    path: '/login',
    element: <Login />,
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
          <Users />
        </ProtectedRoute>),
      },
      {
        path: 'companies',
        element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <Companies />
        </ProtectedRoute>
      ),
      },
      {
        path: 'jobs',
        element: (
        <ProtectedRoute allowedRoles={['company']}>
          <Jobs />
        </ProtectedRoute>
      ),
      },
      {
        path: 'projects',
        element: (
        <ProtectedRoute allowedRoles={['student']}>
          <Projects />
        </ProtectedRoute>
      ),
      },
      {
        path: 'saved',
        element: (
        <ProtectedRoute allowedRoles={['student']}>
          <Saved />
        </ProtectedRoute>
      ),
      },
      {
        path: 'applicants',
        element: (
        <ProtectedRoute allowedRoles={['company']}>
          <Applicants />
        </ProtectedRoute>
      ),
      },
      {
        path: 'settings',
        element: (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      ),
      },
      {
        path: 'profile',
        element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
      }
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
