import { configureStore } from '@reduxjs/toolkit';
import vehiclesReducer from '../vehiclesSlice';

export const store = configureStore({
  reducer: {
    vehicles: vehiclesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
