import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATH } from '../utils/constants';

export default function RoleRoute({ allowedRoles }) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME_PATH[role] ?? '/login'} replace />;
  }

  return <Outlet />;
}
