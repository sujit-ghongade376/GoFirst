import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api' }),
  endpoints: (builder) => ({
    getTickets: builder.query<any[], void>({
      query: () => '/tickets',
    }),
    // Add other endpoints (CRUD) here
  }),
});

export const { useGetTicketsQuery } = api;
