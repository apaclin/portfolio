export interface ZoneCopy {
  title: string;
  body: string;
}

export const enZoneCopy: Record<string, ZoneCopy> = {
  incidents: {
    title: 'Incidents ≠ signals',
    body: 'One incident, several symptoms. The counter shows how many signals are gathered into this object.',
  },
  severity: {
    title: 'Severity level',
    body: 'The bar on the left is the P1–P4 priority. Red is P1, then descending.',
  },
  snoozed: {
    title: 'Snoozed incidents',
    body: 'Snoozed incidents. The counter shows the time left until auto-return to the queue.',
  },
  'global-alert': {
    title: 'A new P1 over the filters',
    body: 'The global alert appears only for a new P1: the system clears filters and moves the engineer to the urgent incident.',
  },
  'vehicle-status': {
    title: 'Vehicle status',
    body: 'The dot is what the vehicle is doing. The ring is an active P1/P2 on it.',
  },
  uncertainty: {
    title: 'Uncertainty zone',
    body: 'On connection loss the exact position is unknown. A dashed circle shows the likely area, which grows with every minute without signal.',
  },
  'map-preview': {
    title: 'Map preview',
    body: 'Clicking a vehicle opens a quick context: status, charge, ETA, speed, and the linked incident — without leaving the map.',
  },
  search: {
    title: 'Search',
    body: 'One field searches vehicles and incidents by ID, plate, or district. ⌘K is the quick way into the command palette.',
  },
  summary: {
    title: 'Shift summary',
    body: 'Shift KPIs, fleet charge, and the per-zone breakdown update in real time but don’t compete with the task queue.',
  },
  'shift-context': {
    title: 'Shift context',
    body: 'The note from the previous shift is linked to the incidents it mentions and appears in the right column automatically.',
  },
};