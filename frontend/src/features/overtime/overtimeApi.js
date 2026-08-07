import { baseApi, unwrapData, unwrapPaginated } from '../../services/baseApi';

// Employee endpoints (create, my) are wired up this phase; manager/admin endpoints (pending,
// all, review) are defined here too but only get pages in the next phase.
export const overtimeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOvertime: builder.mutation({
      query: (body) => ({ url: '/overtime', method: 'POST', body }),
      transformResponse: unwrapData,
      invalidatesTags: ['Overtime', 'Attendance'],
    }),
    getMyOvertime: builder.query({
      query: (params) => ({ url: '/overtime/my', params }),
      transformResponse: unwrapPaginated,
      providesTags: ['Overtime'],
    }),
    getPendingOvertime: builder.query({
      query: (params) => ({ url: '/overtime/pending', params }),
      transformResponse: unwrapPaginated,
      providesTags: ['Overtime'],
    }),
    getAllOvertime: builder.query({
      query: (params) => ({ url: '/overtime/all', params }),
      transformResponse: unwrapPaginated,
      providesTags: ['Overtime'],
    }),
    reviewOvertime: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/overtime/${id}/review`, method: 'PATCH', body }),
      transformResponse: unwrapData,
      invalidatesTags: ['Overtime', 'Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRequestOvertimeMutation,
  useGetMyOvertimeQuery,
  useGetPendingOvertimeQuery,
  useGetAllOvertimeQuery,
  useReviewOvertimeMutation,
} = overtimeApi;
