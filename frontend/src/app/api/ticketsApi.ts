import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/';

export interface Ticket {
  id: string | number;
  ticketNumber?: string;
  title: string;
  description: string;
  status: string;
  assignee: string;
  dueDate?: string | null;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  ticketId: number;
  author: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  ticketId: number;
  type: string;
  message: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  ticketId: number;
  filename: string;
  filepath: string;
  uploadedAt: string;
}

export const ticketsApi = createApi({
  reducerPath: 'ticketsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Ticket', 'Comment'],
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => 'tickets',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Ticket' as const, id })), { type: 'Ticket', id: 'LIST' }]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),
    getTicket: builder.query<Ticket, string | number>({
      query: (id) => `tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),
    createTicket: builder.mutation<Ticket, Partial<Ticket>>({
      query: (body) => ({
        url: 'tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
    updateTicket: builder.mutation<Ticket, Partial<Ticket> & { id: string | number }>({
      query: ({ id, ...patch }) => ({
        url: `tickets/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
    deleteTicket: builder.mutation<{ success: boolean; id: string | number }, string | number>({
      query: (id) => ({
        url: `tickets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
    getComments: builder.query<Comment[], number | string>({
      query: (ticketId) => `tickets/${ticketId}/comments`,
      providesTags: (_result, _error, ticketId) => [{ type: 'Comment', id: ticketId }],
    }),
    addComment: builder.mutation<Comment, { ticketId: number | string; author: string; text: string }>({
      query: ({ ticketId, ...body }) => ({
        url: `tickets/${ticketId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [{ type: 'Comment', id: ticketId }],
    }),
    getActivities: builder.query<Activity[], number | string>({
      query: (ticketId) => `tickets/${ticketId}/activities`,
    }),
    getAttachments: builder.query<Attachment[], number | string>({
      query: (ticketId) => `tickets/${ticketId}/attachments`,
    }),
    uploadAttachment: builder.mutation<Attachment, { ticketId: number | string; file: File }>({
      query: ({ ticketId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `tickets/${ticketId}/attachments`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    deleteAttachment: builder.mutation<void, { attachmentId: number }>({
      query: ({ attachmentId }) => ({
        url: `attachments/${attachmentId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetActivitiesQuery,
  useGetAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} = ticketsApi;
