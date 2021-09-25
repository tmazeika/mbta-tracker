import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './app/store';

export interface Vehicle {
  id: string;
  routeId: string;
  x: number;
  y: number;
}

export interface Route {
  id: string;
  color: string;
}

export interface Stop {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface VehicleCanvasState {
  vehicles: Record<string, Vehicle>;
  routes: Record<string, Route>;
  stops: Record<string, Stop>;
}

const initialState: VehicleCanvasState = {
  vehicles: {},
  routes: {},
  stops: {},
};

export const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setVehicles(state, action: PayloadAction<Vehicle[]>) {
      state.vehicles = Object.fromEntries(action.payload.map(v => [v.id, v]));
    },
    upsertVehicle(state, action: PayloadAction<Vehicle>) {
      const v = action.payload;
      state.vehicles[v.id] = v;
    },
    removeVehicle(state, action: PayloadAction<string>) {
      const vId = action.payload;
      delete state.vehicles[vId];
    },
    setRoutes(state, action: PayloadAction<Route[]>) {
      state.routes = Object.fromEntries(action.payload.map(r => [r.id, r]));
    },
    setStops(state, action: PayloadAction<Stop[]>) {
      state.stops = Object.fromEntries(action.payload.map(r => [r.id, r]));
    }
  },
});

export const { setVehicles, upsertVehicle, removeVehicle, setRoutes, setStops } = vehiclesSlice.actions;

export const selectVehicles = (state: RootState) => state.vehicles.vehicles;
export const selectRoutes = (state: RootState) => state.vehicles.routes;
export const selectStops = (state: RootState) => state.vehicles.stops;

export default vehiclesSlice.reducer;
