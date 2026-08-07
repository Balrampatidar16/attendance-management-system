import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { selectAccessToken } from '../../features/auth/authSlice';
import {
  notificationApi,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../../features/notifications/notificationApi';
import { formatDate, formatTime } from '../../utils/formatters';

// Socket.IO connects to the API's origin, not the /api/v1 base path RTK Query uses.
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const { data } = useGetNotificationsQuery({ page: 1, limit: 10 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!accessToken) return undefined;

    const socket = io(SOCKET_URL, { auth: { token: accessToken }, transports: ['websocket'] });

    socket.on('notification:new', (notification) => {
      toast(notification.title, { icon: '🔔' });
      dispatch(notificationApi.util.invalidateTags(['Notification']));
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, dispatch]);

  const unreadCount = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-xs text-brand-600 dark:text-brand-400 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-slate-500 dark:text-slate-400">No notifications yet</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((n) => (
                  <li key={n._id}>
                    <button
                      type="button"
                      onClick={() => !n.isRead && markRead(n._id)}
                      className={`w-full text-left px-4 py-3 text-sm ${
                        !n.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                      }`}
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(n.createdAt)} {formatTime(n.createdAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
