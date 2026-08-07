import { baseApi, unwrapData, unwrapPaginated } from '../../services/baseApi';

// Defines the full attendance resource API in one place. Employee-facing endpoints
// (punch-in/out, today, my) are wired up to pages in this build phase; the manager/admin
// endpoints (team, all, verify) are defined here too but only get pages in the next phase.
export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    punchIn: builder.mutation({
      query: (body) => ({ url: '/attendance/punch-in', method: 'POST', body }),
      transformResponse: unwrapData,
      invalidatesTags: ['Attendance'],
    }),
    punchOut: builder.mutation({
      query: (body) => ({ url: '/attendance/punch-out', method: 'POST', body }),
      transformResponse: unwrapData,
      invalidatesTags: ['Attendance'],
    }),
    getTodayAttendance: builder.query({
      query: () => '/attendance/today',
      transformResponse: unwrapData,
      providesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
      query: (params) => ({ url: '/attendance/my', params }),
      transformResponse: unwrapPaginated,
      providesTags: ['Attendance'],
    }),
    getTeamAttendance: builder.query({
      query: (params) => ({ url: '/attendance/team', params }),
      transformResponse: unwrapPaginated,
      providesTags: ['Attendance'],
    }),
    getAllAttendance: builder.query({
      query: (params) => ({ url: '/attendance/all', params }),
      transformResponse: unwrapPaginated,
      providesTags: ['Attendance'],
    }),
    getAttendanceById: builder.query({
      query: (id) => `/attendance/${id}`,
      transformResponse: unwrapData,
    }),
    verifyAttendance: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/attendance/${id}/verify`, method: 'PATCH', body }),
      transformResponse: unwrapData,
      invalidatesTags: ['Attendance'],
    }),
    getAttendanceStats: builder.query({
      query: () => '/attendance/stats/summary',
      transformResponse: unwrapData,
      providesTags: ['Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useGetTodayAttendanceQuery,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
  useGetAttendanceByIdQuery,
  useVerifyAttendanceMutation,
  useGetAttendanceStatsQuery,
} = attendanceApi;
