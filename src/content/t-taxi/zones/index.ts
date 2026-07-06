import { zoneGeometry, type ZoneGeometry } from './base';
import { enZoneCopy } from './en';
import { ruZoneCopy, type ZoneCopy } from './ru';

export interface Zone extends ZoneGeometry, ZoneCopy {}

const composeZones = (copy: Record<string, ZoneCopy>): Zone[] =>
  zoneGeometry.map((zone) => ({
    ...zone,
    ...copy[zone.id],
  }));

export const zones = composeZones(ruZoneCopy);
export const zonesRu = zones;
export const zonesEn = composeZones(enZoneCopy);
