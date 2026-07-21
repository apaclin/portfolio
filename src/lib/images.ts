export const defaultResponsiveWidths = [480, 800, 1200, 1600] as const;

/**
 * Case boards are very tall 3840px exports. Generating every common monitor
 * width in both AVIF and WebP made a cold production build create 700 files and
 * exceed Vercel's 45-minute limit. This compact ladder covers mobile, common
 * desktop widths and the useful 2x steps without near-duplicate candidates.
 */
export const caseSliceWidths = [
  480, 960, 1440, 1920, 2560, 3840,
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
