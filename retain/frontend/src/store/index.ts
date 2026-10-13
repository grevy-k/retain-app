import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './filtersSlice';

// Redux only owns the expense filters. Authentication lives in React Context, as the brief requires.
export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;