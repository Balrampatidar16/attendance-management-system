import { baseApi, unwrapData } from '../../services/baseApi';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDailyReport: builder.query({
      query: (params) => ({ url: '/reports/daily', params }),
      transformResponse: unwrapData,
      providesTags: ['Report'],
    }),
    getRangeReport: builder.query({
      query: (params) => ({ url: '/reports/range', params }),
      transformResponse: unwrapData,
      providesTags: ['Report'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDailyReportQuery, useGetRangeReportQuery } = reportApi;
