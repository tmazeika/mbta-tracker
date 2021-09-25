import React, { Fragment, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  removeVehicle,
  selectRoutes,
  selectStops,
  selectVehicles,
  setRoutes,
  setStops,
  setVehicles,
  Stop,
  upsertVehicle,
  Vehicle,
} from './vehiclesSlice';

interface ApiVehicle {
  id: string,
  attributes: {
    latitude: number,
    longitude: number,
  },
  relationships: {
    route: {
      data: {
        id: string;
      }
    }
  }
}

interface ApiRoute {
  id: string,
  attributes: {
    color: string;
  }
}

interface ApiStop {
  id: string,
  attributes: {
    latitude: number;
    longitude: number;
    name: string;
  }
}

function coordsToXY(mapWidth: number, mapHeight: number, lng: number, lat: number): [number, number] {
  const x = (lng + 180) * (mapWidth / 360);
  const latRad = lat * Math.PI / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  const y = (mapHeight / 2) - (mapWidth * mercN / (2 * Math.PI));
  return [x, y];
}

function apiVehicleToVehicle(mapWidth: number, mapHeight: number, v: ApiVehicle): Vehicle {
  const [x, y] = coordsToXY(mapWidth, mapHeight, v.attributes.longitude, v.attributes.latitude);
  return { id: v.id, routeId: v.relationships.route.data.id, x, y };
}

function apiStopToStop(mapWidth: number, mapHeight: number, s: ApiStop): Stop {
  const [x, y] = coordsToXY(mapWidth, mapHeight, s.attributes.longitude, s.attributes.latitude);
  return { id: s.id, name: s.attributes.name, x, y };
}

export default function App() {
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectVehicles);
  const routes = useAppSelector(selectRoutes);
  const stops = useAppSelector(selectStops);

  const mapWidth = 496;
  const mapHeight = 496;

  useEffect(() => {
    const controller = new AbortController();
    fetch('http://localhost:4567/routes', {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }).then(res => res.json()).then(({ data }: { data: ApiRoute[] }) => {
      dispatch(setRoutes(data.map(r => ({ id: r.id, color: r.attributes.color }))));
    });
    return () => controller.abort();
  }, [dispatch]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('http://localhost:4567/stops', {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }).then(res => res.json()).then(({ data }: { data: ApiStop[] }) => {
      const stops = data.map(s => apiStopToStop(mapWidth, mapHeight, s));
      dispatch(setStops(stops));
    });
    return () => controller.abort();
  }, [dispatch]);

  useEffect(() => {
    const sse = new EventSource('http://localhost:4567/vehicles');

    sse.addEventListener('reset', (e) => {
      const data: ApiVehicle[] = JSON.parse((e as MessageEvent<string>).data);
      const vehicles = data.map(v => apiVehicleToVehicle(mapWidth, mapHeight, v));
      dispatch(setVehicles(vehicles));
    });

    sse.addEventListener('add', (e) => {
      const data: ApiVehicle = JSON.parse((e as MessageEvent<string>).data);
      const vehicle = apiVehicleToVehicle(mapWidth, mapHeight, data);
      dispatch(upsertVehicle(vehicle));
    });

    sse.addEventListener('update', (e) => {
      const data: ApiVehicle = JSON.parse((e as MessageEvent<string>).data);
      const vehicle = apiVehicleToVehicle(mapWidth, mapHeight, data);
      dispatch(upsertVehicle(vehicle));
    });

    sse.addEventListener('remove', (e) => {
      const data: { id: string } = JSON.parse((e as MessageEvent<string>).data);
      dispatch(removeVehicle(data.id));
    });

    return () => sse.close();
  }, [dispatch]);

  const minX = 149.85;
  const minY = 183.325;
  const scaleXY = 2300;

  const [hoveringStopId, setHoveringStopId] = useState<string>();

  return (
    <div className="App">
      <svg version="1.1" width="100vw" height="100vh" xmlns="http://www.w3.org/2000/svg">
        <defs>
        <filter x="0" y="0" width="1" height="1" id="solid">
          <feFlood floodColor="#223" result="bg" />
          <feMerge>
            <feMergeNode in="bg"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
        <rect width="100%" height="100%" fill="#223"/>
        {Object.values(stops).map(s => {
          const x = (s.x - minX) * scaleXY;
          const y = (s.y - minY) * scaleXY;
          return (
            <circle key={s.id} cx={x} cy={y} r={2} fill="#445" onMouseEnter={() => setHoveringStopId(s.id)} onMouseLeave={() => setHoveringStopId(undefined)}/>
          );
        })}
        {Object.values(vehicles).map(v => {
          const x = (v.x - minX) * scaleXY;
          const y = (v.y - minY) * scaleXY;
          const color = routes[v.routeId]?.color ? `#${routes[v.routeId].color}` : '#aaa';
          return (
            <circle key={v.id} cx={x} cy={y} r={2} fill={color} pointerEvents="none"/>
          );
        })}
        {Object.values(stops).map(s => {
          const x = (s.x - minX) * scaleXY;
          const y = (s.y - minY) * scaleXY;
          return (
            <Fragment key={s.id}>
              {hoveringStopId === s.id && (
                <text filter="url(#solid)" x={x + 4} y={y + 2} fontSize={6} textAnchor="start" fill="#667" pointerEvents="none">{s.name}</text>
              )}
            </Fragment>
          );
        })}
      </svg>
    </div>
  );
}
