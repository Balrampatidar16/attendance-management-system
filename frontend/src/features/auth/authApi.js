import { baseApi, unwrapData } from '../../services/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: unwrapData,
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: unwrapData,
    }),
    googleAuth: builder.mutation({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
      transformResponse: unwrapData,
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: unwrapData,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/auth/update-profile', method: 'PATCH', body }),
      transformResponse: unwrapData,
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'PATCH', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleAuthMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
