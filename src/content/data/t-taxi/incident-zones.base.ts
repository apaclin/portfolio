// Геометрия зон карточки инцидента из zones t i.svg.
// SVG описывает только карточку 500×1201. На walkthrough-скриншоте карточка
// занимает правые 500px сцены 672×1201 и начинается после 172px карты.

export interface IncidentZoneGeometry {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  whole?: boolean;
  sticky?: boolean;
}

export interface IncidentZone extends IncidentZoneGeometry {
  title: string;
  body: string;
}

export interface IncidentZoneCopy {
  title: string;
  body: string;
}

const STAGE_WIDTH = 672;
const CARD_OFFSET_X = 172;
const CARD_HEIGHT = 1201;
const STROKE_WIDTH = 1;

// Figma Inside stroke экспортируется в SVG как центрированный stroke на
// полуцелых координатах. Возвращаем его внешний box и сразу переводим
// координаты карточки в проценты полной сцены.
const strokeRect = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Pick<IncidentZoneGeometry, 'sticky' | 'whole'> = {},
): IncidentZoneGeometry => {
  const halfStroke = STROKE_WIDTH / 2;
  return {
    id,
    left: ((CARD_OFFSET_X + x - halfStroke) / STAGE_WIDTH) * 100,
    top: ((y - halfStroke) / CARD_HEIGHT) * 100,
    width: ((width + STROKE_WIDTH) / STAGE_WIDTH) * 100,
    height: ((height + STROKE_WIDTH) / CARD_HEIGHT) * 100,
    ...options,
  };
};

export const incidentZoneGeometry: IncidentZoneGeometry[] = [
  strokeRect('header', 5.5, 4.5, 490, 157, { sticky: true }),
  strokeRect('trip', 5.5, 318.5, 490, 158),
  strokeRect('symptoms', 5.5, 486.5, 490, 216),
  strokeRect('log', 5.5, 773.5, 490, 147),
  strokeRect('toolbar', 5.5, 1051.5, 490, 145),
];

export const composeIncidentZones = (
  copy: Record<string, IncidentZoneCopy>,
): IncidentZone[] =>
  incidentZoneGeometry.map((zone) => ({
    ...zone,
    ...copy[zone.id],
  }));
