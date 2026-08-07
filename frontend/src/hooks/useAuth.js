import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, selectAccessToken } from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);

  return { user, isAuthenticated, accessToken, role: user?.role ?? null };
};
