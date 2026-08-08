import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../features/auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// These endpoints must never trigger a refresh-and-retry: a 401 from login/register means bad
// credentials, and a 401 from refresh-token itself means the session is genuinely over.
const SKIP_REAUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh-token',
  '/auth/logout',
];

const isSkipReauthUrl = (args) => {
  const url = typeof args === 'string' ? args : (args?.url ?? '');
  return SKIP_REAUTH_PATHS.some((path) => url.startsWith(path));
};

// Single-flight refresh: concurrent 401s across multiple in-flight queries share one
// refresh-token call instead of each firing their own.
let refreshPromise = null;

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !isSkipReauthUrl(args)) {
    if (!refreshPromise) {
      refreshPromise = rawBaseQuery({ url: '/auth/refresh-token', method: 'POST' }, api, extraOptions).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshResult = await refreshPromise;

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data.data));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Attendance', 'Overtime', 'Report', 'Notification'],
  endpoints: () => ({}),
});

// The API envelope is always { success, message, data, meta? } — these unwrap it so feature
// endpoints and components work with the real payload instead of re-reaching into `.data` everywhere.
export const unwrapData = (response) => response.data;
export const unwrapPaginated = (response) => ({ items: response.data, meta: response.meta });
