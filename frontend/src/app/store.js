import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import attendanceUiReducer from '../features/attendance/attendanceSlice';
import { baseApi } from '../services/baseApi';

const loadAuthState = () => {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken || !parsed?.user) return undefined;
    return { auth: { user: parsed.user, accessToken: parsed.accessToken, isAuthenticated: true } };
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendanceUi: attendanceUiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  preloadedState: loadAuthState(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});
