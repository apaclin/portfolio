export const defaultResponsiveWidths = [480, 800, 1200, 1600] as const;

/**
 * Case boards run full-bleed, so the slot is the whole viewport and the browser
 * rescales whatever candidate it picks — cheaply, which softens fine type. The
 * ladder therefore tracks real monitor widths rather than round numbers: a 1920
 * screen (slot ~1905 after the scrollbar) lands on the 1920 file and nothing
 * gets rescaled. The top end covers the same widths at 2x.
 */
export const caseSliceWidths = [
  480, 800, 1024, 1280, 1366, 1440, 1536, 1600, 1728, 1920, 2048, 2560, 2880,
  3840,
] as const;

export function cappedImageWidths(
  sourceWidth: number,
  requestedWidths?: readonly number[],
): number[] {
  const requested =
    requestedWidths && requestedWidths.length > 0
      ? requestedWidths
      : defaultResponsiveWidths;
  const validRequested = requested.filter(
    (width) => Number.isFinite(width) && width > 0,
  );

  if (validRequested.length === 0) {
    return [sourceWidth];
  }

  const cap = Math.min(sourceWidth, Math.max(...validRequested));

  return [
    ...new Set([
      ...validRequested.filter((width) => width < cap),
      cap,
    ]),
  ].sort((a, b) => a - b);
}

export function cappedZoomWidth(
  sourceWidth: number,
  logicalWidth: number,
): number {
  return Math.min(sourceWidth, logicalWidth * 2);
}
