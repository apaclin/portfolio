export interface ZoneGeometry {
  id: string;
  l: number;
  t: number;
  w: number;
  h: number;
}

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 900;
const STROKE_WIDTH = 1;

// Figma экспортирует 1px Inside stroke как центрированный SVG-stroke на
// полуцелых координатах. Переводим его ось во внешний CSS-box, поскольку
// браузер рисует border внутрь элемента.
const strokeRect = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): ZoneGeometry => {
  const halfStroke = STROKE_WIDTH / 2;
  return {
    id,
    l: ((x - halfStroke) / CANVAS_WIDTH) * 100,
    t: ((y - halfStroke) / CANVAS_HEIGHT) * 100,
    w: ((width + STROKE_WIDTH) / CANVAS_WIDTH) * 100,
    h: ((height + STROKE_WIDTH) / CANVAS_HEIGHT) * 100,
  };
};

export const zoneGeometry: ZoneGeometry[] = [
  strokeRect('incidents', 4.5, 250.5, 351, 645),
  strokeRect('severity', 4.5, 178.5, 351, 63),
  strokeRect('snoozed', 218.5, 129.5, 130, 29),
  strokeRect('global-alert', 1285.5, 5.5, 107, 37),
  strokeRect('vehicle-status', 549.5, 373.5, 37, 37),
  strokeRect('uncertainty', 510.5, 606.5, 137, 137),
  strokeRect('map-preview', 745.5, 389.5, 236, 96),
  strokeRect('search', 429.5, 5.5, 309, 37),
  strokeRect('summary', 1164.5, 52.5, 271, 843),
  strokeRect('shift-context', 1171.5, 552.5, 257, 222),
];
