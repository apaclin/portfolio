// Единый тайминг движения в интерактивных разборах.
//
// Экранная позиция карточки и рамки — это РАЗНОСТЬ двух анимаций: CSS-перехода
// внутри сцены и программного скролла страницы (плюс горизонтального скролла
// самой сцены). Если у них разные кривые и длительности — а родной
// behavior:'smooth' задаёт свои, неизвестные нам, — то разность двух прямых
// движений идёт по дуге. При одинаковом easing и одинаковой длительности
// композиция остаётся линейной, то есть визуально прямой.
//
// Поэтому скролл здесь едет своим tween'ом на той же кривой и той же
// длительности, что переходы left/top у рамки и карточки в стилях разборов.

/** Длительность перелёта шага. Совпадает с transition рамки и карточки. */
export const STEP_MS = 420;

const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number) => {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-4) break;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
};

/** Та же кривая, что --ease в стилях разборов: cubic-bezier(0.4, 0, 0.2, 1). */
export const stepEase = cubicBezier(0.4, 0, 0.2, 1);

export interface StepScroller {
  /** Проехать dy по странице и dx по горизонтальному контейнеру сцены. */
  by(dy: number, dx?: number): void;
  cancel(): void;
}

/**
 * @param horizontal   Горизонтальный скролл-контейнер сцены, если он есть.
 * @param onAnimate    Вызывается с длительностью в начале перелёта — хост через
 *                     него продлевает подавление автовыхода из разбора.
 */
export const createStepScroller = (
  horizontal: HTMLElement | null,
  onAnimate?: (durationMs: number) => void,
): StepScroller => {
  let raf = 0;
  const cancel = () => {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  };

  const by = (rawDy: number, rawDx = 0) => {
    cancel();
    const startY = window.scrollY;
    const startX = horizontal ? horizontal.scrollLeft : 0;
    const maxX = horizontal
      ? Math.max(0, horizontal.scrollWidth - horizontal.clientWidth)
      : 0;
    const dy = Math.max(0, Math.round(startY + rawDy)) - startY;
    const dx =
      Math.min(Math.max(Math.round(startX + rawDx), 0), maxX) - startX;
    if (Math.abs(dy) < 2 && Math.abs(dx) < 2) return;

    onAnimate?.(STEP_MS);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (dy) window.scrollTo(0, startY + dy);
      if (dx && horizontal) horizontal.scrollLeft = startX + dx;
      return;
    }

    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / STEP_MS);
      const e = stepEase(p);
      if (dy) window.scrollTo(0, Math.round(startY + dy * e));
      if (dx && horizontal) horizontal.scrollLeft = Math.round(startX + dx * e);
      raf = p < 1 ? window.requestAnimationFrame(frame) : 0;
    };
    raf = window.requestAnimationFrame(frame);
  };

  return { by, cancel };
};
