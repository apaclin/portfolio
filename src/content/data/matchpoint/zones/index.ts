import { zoneGeometry, type ZoneGeometry } from './base';
import { enZoneCopy, type ZoneCopy } from './en';
import { ruZoneCopy } from './ru';

export interface Zone extends ZoneGeometry, ZoneCopy {}

const composeZones = (copy: Record<string, ZoneCopy>): Zone[] =>
  zoneGeometry.map((zone) => ({
    ...zone,
    ...copy[zone.id],
  }));

export const zonesEn = composeZones(enZoneCopy);
export const zonesRu = composeZones(ruZoneCopy);
