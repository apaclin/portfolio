import { zoneGeometry, type ZoneGeometry } from './base';
import { enZoneCopy, type ZoneCopy } from './en';

export interface Zone extends ZoneGeometry, ZoneCopy {}

export const zonesEn: Zone[] = zoneGeometry.map((zone) => ({
  ...zone,
  ...enZoneCopy[zone.id],
}));
