export interface ZoneGeometry {
  id: string;
  l: number;
  t: number;
  w: number;
  h: number;
}

export const zoneGeometry: ZoneGeometry[] = [
  { id: 'incidents', l: 0.31, t: 27.83, w: 24.38, h: 71.67 },
  { id: 'severity', l: 0.3125, t: 19.8333, w: 24.375, h: 7.0 },
  { id: 'snoozed', l: 15.1736, t: 14.3889, w: 9.0278, h: 3.2222 },
  { id: 'global-alert', l: 89.27, t: 0.61, w: 7.43, h: 4.11 },
  { id: 'vehicle-status', l: 38.23, t: 41.61, w: 2.43, h: 3.89 },
  { id: 'uncertainty', l: 35.45, t: 67.39, w: 9.51, h: 15.22 },
  { id: 'map-preview', l: 51.77, t: 43.28, w: 16.39, h: 10.67 },
  { id: 'search', l: 29.83, t: 0.61, w: 21.46, h: 4.11 },
  { id: 'summary', l: 80.87, t: 5.83, w: 18.82, h: 93.67 },
  { id: 'shift-context', l: 81.35, t: 61.39, w: 17.85, h: 24.67 },
];
