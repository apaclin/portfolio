# Walkthrough zone import

This document is authoritative for importing walkthrough zones from Figma SVGs.
Do not copy exported `<rect>` coordinates directly into CSS percentages.

## Source convention

- Design zones at the walkthrough canvas's native logical size:
  - Matchpoint screen: `1440 × 1535`
  - T‑Taxi main screen: `1440 × 900`
  - T‑Taxi incident card: `500 × 1201`
- In Figma, keep the rectangle's outer box on integer coordinates.
- Use a `1 px` stroke aligned **Inside**.
- Measure spacing from the **inner edge of the visible stroke** to the content.
  A `4 px` clear gap therefore means `5 px` from the rectangle's outer edge to
  the content.
- Keep the intended outer corner radius on the Figma rectangle.

Figma serializes an inside 1px stroke as a centered SVG stroke:

```svg
<!-- Figma outer box: x=259, y=176, width=378, height=34, radius=9 -->
<rect x="259.5" y="176.5" width="377" height="33" rx="8.5" stroke="white"/>
```

The `.5` coordinates are expected. Do not remove them in the SVG.

## SVG stroke → CSS border conversion

SVG centers the stroke on the rect path. CSS draws a border inside the element.
Convert the SVG path rect to the stroke's outer box before converting it to
percentages:

```text
halfStroke = strokeWidth / 2

outerX      = x - halfStroke
outerY      = y - halfStroke
outerWidth  = width + strokeWidth
outerHeight = height + strokeWidth
outerRadius = rx + halfStroke
```

For a canvas `canvasWidth × canvasHeight`:

```text
left   = outerX / canvasWidth × 100
top    = outerY / canvasHeight × 100
width  = outerWidth / canvasWidth × 100
height = outerHeight / canvasHeight × 100
```

Use a `strokeRect(...)` helper in the data file and retain the source SVG
numbers as arguments. Do not pre-round percentages.

Example:

```ts
strokeRect('chips', 259.5, 176.5, 377, 33)
// CSS outer box at native size: x=259, y=176, width=378, height=34
```

## Runtime border rules

- Runtime border width must equal the source SVG stroke width.
- Use `box-sizing: border-box`.
- Draw the runtime border inside the converted outer box.
- Never animate `border-width`; animate only color/opacity and geometry.
- The viewport clipping the sharp screenshot must be inset by the same border
  width.
- Compensate that viewport inset on the sharp image by the same amount.
- Never `Math.round()` the sharp image's `left` or `top`. Rounding introduces a
  relative 0.5px shift between screenshot content and frame.

## T‑Taxi incident-card transform

The incident-zone SVG describes only the `500 × 1201` card. The walkthrough
stage is `672 × 1201`: `172 px` of map followed by the `500 px` card.

Convert incident SVG coordinates to the full stage:

```text
stageOuterX = 172 + svgX - strokeWidth / 2
stageLeft   = stageOuterX / 672 × 100
stageWidth  = (svgWidth + strokeWidth) / 672 × 100

top         = (svgY - strokeWidth / 2) / 1201 × 100
height      = (svgHeight + strokeWidth) / 1201 × 100
```

Do not keep approximate shared `left`/`width` constants in the component.
Store the computed geometry on every zone so future zones may differ
horizontally.

## Files

- Matchpoint geometry:
  `src/content/data/matchpoint/zones/base.ts`
- T‑Taxi main-screen geometry:
  `src/content/data/t-taxi/zones/base.ts`
- T‑Taxi editable source:
  `src/content/data/t-taxi/zones/t-taxi-zones.svg`
- T‑Taxi incident-card geometry:
  `src/content/data/t-taxi/incident-zones.base.ts`
- Main walkthrough renderer:
  `src/components/diagrams/Walkthrough.astro`
- Incident-card renderer:
  `src/components/diagrams/IncidentWalkthrough.astro`

Keep geometry separate from localized copy. English and Russian walkthroughs
must compose their text with the same geometry array.

## Mapping and validation checklist

1. Read the SVG canvas size, stroke width, every rect, and its order.
2. Map each rect to the existing semantic zone ID. Do not reorder walkthrough
   copy merely because the SVG rect order changed.
3. Apply the centered-stroke → outer-box conversion.
4. Ensure runtime border width and radius match the converted SVG.
5. Preserve the sharp screenshot's exact subpixel alignment.
6. At native canvas width, inspect the rendered frame in canvas coordinates.
   Its box must equal the calculated outer box.
7. When a specific clear gap matters, inspect the source PNG pixels:
   measure from the border's inner edge, not its outer edge or center.
8. Remember that the whole screenshot scales responsively. A source-space
   `4 px` gap becomes proportionally smaller when the stage is narrower than
   its native width.
9. Run:

```sh
npm run check
npm run build
git diff --check
```

Do not fix a one-pixel discrepancy by nudging individual percentages until the
stroke model, runtime border width, canvas size, and screenshot alignment have
all been verified.
