import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/apiSlice';
import { ticketsApi } from './api/ticketsApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [ticketsApi.reducerPath]: ticketsApi.reducer,
    // add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, ticketsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
