import type { IncidentZone } from './incident-zones.ru';

export const incidentZonesEn: IncidentZone[] = [
  {
    id: 'header',
    title: 'Sticky header',
    body: 'The incident ID, vehicle, P-level, and primary actions stay in place while the card scrolls.',
    top: 0.79,
    height: 12.66,
    sticky: true,
  },
  {
    id: 'trip',
    title: 'Trip context',
    body: 'The incident is linked to an active trip: passenger, route, ETA, and price are visible in the card without switching systems.',
    top: 26.52,
    height: 13.16,
  },
  {
    id: 'symptoms',
    title: 'Symptoms inside the incident',
    body: 'Incident symptoms: time, type, source, and details. Monospace is used for machine-readable values.',
    top: 40.51,
    height: 17.99,
  },
  {
    id: 'log',
    title: 'Decision log and shift note',
    body: 'Every action is saved as an entry: who did what and when. The closing note becomes context for the next shift.',
    top: 64.4,
    height: 12.24,
  },
  {
    id: 'toolbar',
    title: 'Action panel with a recommendation',
    body: 'The action panel highlights the recommended action based on the leading fault code.',
    top: 87.55,
    height: 11.66,
  },
];
