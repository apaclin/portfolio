export const defaultResponsiveWidths = [480, 800, 1200, 1600] as const;

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
