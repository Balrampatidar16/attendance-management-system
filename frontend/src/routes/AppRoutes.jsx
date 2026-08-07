import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import NotFound from '../pages/NotFound';
import EmployeeDashboard from '../pages/employee/Dashboard';
import PunchPage from '../pages/employee/PunchPage';
import MyAttendance from '../pages/employee/MyAttendance';
import MyOvertime from '../pages/employee/MyOvertime';
import ManagerDashboard from '../pages/manager/Dashboard';
import TeamAttendance from '../pages/manager/TeamAttendance';
import VerifyAttendance from '../pages/manager/VerifyAttendance';
import OvertimeApprovals from '../pages/manager/OvertimeApprovals';
import AdminDashboard from '../pages/admin/Dashboard';
import AllUsers from '../pages/admin/AllUsers';
import AllAttendance from '../pages/admin/AllAttendance';
import SystemReports from '../pages/admin/SystemReports';
import Reports from '../pages/shared/Reports';
import Profile from '../pages/shared/Profile';
import { useAuth } from '../hooks/useAuth';
import { ROLES, ROLE_HOME_PATH } from '../utils/constants';

function RootRedirect() {
  const { role } = useAuth();
  return <Navigate to={ROLE_HOME_PATH[role] ?? '/login'} replace />;
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <RootRedirect /> },
          { path: '/reports', element: <Reports /> },
          { path: '/profile', element: <Profile /> },
          {
            element: <RoleRoute allowedRoles={[ROLES.EMPLOYEE]} />,
            children: [
              { path: '/employee/dashboard', element: <EmployeeDashboard /> },
              { path: '/employee/punch', element: <PunchPage /> },
              { path: '/employee/attendance', element: <MyAttendance /> },
              { path: '/employee/overtime', element: <MyOvertime /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={[ROLES.MANAGER]} />,
            children: [
              { path: '/manager/dashboard', element: <ManagerDashboard /> },
              { path: '/manager/attendance', element: <TeamAttendance /> },
              { path: '/manager/verify', element: <VerifyAttendance /> },
              { path: '/manager/overtime', element: <OvertimeApprovals /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboard /> },
              { path: '/admin/users', element: <AllUsers /> },
              { path: '/admin/attendance', element: <AllAttendance /> },
              { path: '/admin/reports', element: <SystemReports /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
