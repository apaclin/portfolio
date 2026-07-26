// Геометрия зон интерактивного разбора экрана Exception Detail (matchpoint).
// Геометрия берётся напрямую из rect в zones m4.svg. SVG stroke центрирован
// относительно x/y, а CSS border рисуется внутрь элемента, поэтому strokeRect
// переводит ось 1px stroke в его внешний box. В результате внутренняя граница
// рамки сохраняет заданные в макете 4px со всех сторон.

export interface ZoneGeometry {
  id: string;
  l: number;
  t: number;
  w: number;
  h: number;
}

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1535;
const STROKE_WIDTH = 1;

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
  // 1. Чипы: PO mismatch · High severity · High confidence
  strokeRect('chips', 259.5, 176.5, 377, 33),
  // 2. High confidence chip + раскрытый popover (включая стрелку)
  strokeRect('confidence-popover', 401.5, 176.5, 329, 447),
  // 3. Степпер Detect → Diagnose → Route → Resolve → Trace
  strokeRect('stepper', 259.5, 262.5, 801, 87),
  // 4. Вывод: «What's different» + строка +20% / +$513.32
  strokeRect('conclusion', 259.5, 373.5, 801, 79),
  // 5. Diff-таблица (Unit price / Line total)
  strokeRect('diff-table', 259.5, 456.5, 801, 159),
  // 6. Suggested actions (три карточки, включая amber Approve as-is)
  strokeRect('suggested-actions', 259.5, 637.5, 801, 283),
  // 7. Vendor context (правая колонка)
  strokeRect('vendor-context', 1100.5, 76.5, 320, 537),
  // 8. Activity (лента событий)
  strokeRect('activity', 258.5, 944.5, 801, 434),
];
