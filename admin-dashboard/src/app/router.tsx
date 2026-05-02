import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import  UsersPage  from '../features/users/pages/UsersPage';
import  CompaniesPage  from '../features/companies/pages/CompaniesPage';
import  JobsPage  from '../features/jobs/pages/JobsPage';
import  MyProjectsPage  from '../features/projects/pages/MyProjectsPage';
import  Dashboard  from '../features/dashboard/page/Dashboard';

// Note: Import these when you have finished them!
// import { LoginPage } from '../features/auth/pages/LoginPage';
// import { ProtectedRoute } from '../routes/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />, // Automatically redirect to the dashboard
  },
  // {
  //   path: '/login',
  //   element: <LoginPage />,
  // },
  {
    path: '/dashboard',
    // When your auth system is ready, change this to:
    // element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Dashboard />
        ),
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'companies',
        element: <CompaniesPage />,
      },
      {
        path: 'jobs',
        element: <JobsPage />,
      },
      {
        path: 'projects',
        element: <MyProjectsPage />,
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
]);
