import {
  composeIncidentZones,
  type IncidentZoneCopy,
} from './incident-zones.base';

const enCopy: Record<string, IncidentZoneCopy> = {
  header: {
    title: 'Sticky header',
    body: 'The incident ID, vehicle, P-level, and primary actions stay in place while the card scrolls.',
  },
  trip: {
    title: 'Trip context',
    body: 'The incident is linked to an active trip: passenger, route, ETA, and price are visible in the card without switching systems.',
  },
  symptoms: {
    title: 'Symptoms inside the incident',
    body: 'Incident symptoms: time, type, source, and details. Monospace is used for machine-readable values.',
  },
  log: {
    title: 'Decision log and shift note',
    body: 'Every action is saved as an entry: who did what and when. The closing note becomes context for the next shift.',
  },
  toolbar: {
    title: 'Action panel with a recommendation',
    body: 'The action panel highlights the recommended action based on the leading fault code.',
  },
};

export const incidentZonesEn = composeIncidentZones(enCopy);
