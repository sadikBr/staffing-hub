import { createBrowserRouter } from 'react-router';
import { PageLoader } from './components/PageLoader';
import { AppLayout } from './layout/AppLayout';
import { RouteError } from './pages/RouteError';

/** Each page is loaded on demand, so the first screen appears quickly. */
export function createRouter() {
  return createBrowserRouter([
    {
      element: <AppLayout />,
      hydrateFallbackElement: <PageLoader />,
      errorElement: <RouteError />,
      children: [
        { index: true, lazy: () => import('./features/dashboard/DashboardPage').then(toRoute) },
        { path: 'employees', lazy: () => import('./features/employees/EmployeesPage').then(toRoute) },
        { path: 'employees/:id', lazy: () => import('./features/employees/EmployeeDetailPage').then(toRoute) },
        { path: 'employees/:id/profile', lazy: () => import('./features/profile/ProfilePage').then(toRoute) },
        { path: 'availability', lazy: () => import('./features/availability/AvailabilityPage').then(toRoute) },
        { path: 'missions', lazy: () => import('./features/missions/MissionsPage').then(toRoute) },
        { path: 'missions/:id', lazy: () => import('./features/missions/MissionDetailPage').then(toRoute) },
        { path: 'customers', lazy: () => import('./features/reference/CustomersPage').then(toRoute) },
        { path: 'technologies', lazy: () => import('./features/reference/TechnologiesPage').then(toRoute) },
        { path: 'roles', lazy: () => import('./features/reference/RolesPage').then(toRoute) },
        { path: '*', lazy: () => import('./pages/NotFoundPage').then(toRoute) },
      ],
    },
  ]);
}

function toRoute(module: { default: React.ComponentType }) {
  return { Component: module.default };
}
