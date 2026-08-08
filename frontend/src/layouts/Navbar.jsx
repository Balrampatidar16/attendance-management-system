import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { logout as logoutAction } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApi';
import NotificationBell from '../components/common/NotificationBell';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [triggerLogout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await triggerLogout().unwrap();
    } catch {
      // Clear the local session regardless of whether the server call succeeded.
    } finally {
      dispatch(logoutAction());
      toast.success('Logged out');
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 -ml-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        aria-label="Toggle menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <NotificationBell />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="inline-flex items-center h-11 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
