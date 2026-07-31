# Mobile media fit

This document is authoritative for how case media behaves below `40rem`.

## Images: 1:1 with the reading column

Anything that sits inside the central container on desktop must match the
`.prose` content column exactly on mobile: width `100vw - 2.5rem`, offset
`1.25rem`. No image is inset further than the text next to it.

- `.prose` gutter is `1.25rem`. That is the single source of truth, and
  `Breakout` uses the same value at every width — not only on mobile.
- Exactly one element supplies that gutter. `Breakout` supplies it and strips
  the inline padding of `.case-image` / `.carousel`, because otherwise the two
  gutters stack and the frame ends up narrower than the paragraph above it.
  Below `40rem` that applies to all breakout media; at any width it applies to
  `flush` breakouts (see below).
- **Never size a frame as "container minus padding".** The hero used to be
  `maxWidth="720px"` because `720 - 2×24px` happened to equal the 672px reading
  column. That only holds while the padding is exactly 24px, so it broke the
  moment the gutter bound instead of `maxWidth` — between `40rem` and `~47rem`
  the hero came out 40px narrower per side. A frame's width prop must state the
  frame's real width; `flush` is what makes that true.
- **Never use `100vw` for anything that has to line up with the text.** `100vw`
  includes the classic scrollbar; `.prose` does not. Breakout is `full-bleed`
  (it spans the `.prose` grid, which is page-width) rather than the old
  `w-screen` + `left-1/2` + `-translate-x-1/2` trick, and `align="content"`
  derives `--content-start` from `100%`, not `100vw`. Both used to drift by
  half a scrollbar exactly when the gutter bound.
- `align="content"` needs no special case: below `40rem` `--content-start`
  always resolves to `1.25rem`, so it coincides with `align="center"`.
- `variant="inline"` normally keeps the image's natural width. Below `40rem`
  that rule is suspended (`width: 100%`), because the "natural" width there is
  just whichever srcset candidate the browser picked — an arbitrary 327px
  instead of the 335px column.
- A `flush` carousel drops its padding on desktop only; on mobile it takes the
  `1.25rem` gutter like everything else.

## The hero

`CaseHero` renders its `Breakout` with `flush`, so the frame is exactly the
width passed in — no padding is subtracted from it. Its default is `42rem`, the
reading column, which is what every case hero wants. The result is that the
hero matches the paragraph beside it at *every* viewport width, not just the
ones someone happened to check.

When changing any of this, verify across a sweep of widths rather than at one
phone size and one desktop size. The historical failures all lived in between —
around `640–712px`, where `maxWidth` stops binding and the gutter takes over.

## Schemas: one reading scale

Schemas are drawn with 10–14px labels. Scaling them down to fit a phone turned
those into 6–9px, and every schema landed on a different scale (46 / 50 / 67 /
69 / 76 / 100%).

The `.schema` primitive in `global.css` owns this. A host element carries the
class and declares `--schema-natural`; the rules apply to its direct child
`<svg>`. Three hosts use it: `PublicSvg` (which reads the width from the SVG's
`width` attribute or viewBox at build time), the inline case schemas such as
`matchpoint/problems.astro`, and the `ScenarioFlows` mobile figure.

- Up to `63.9375rem` the SVG is floored at `--schema-natural`, so every schema
  reads at 100% and the overflow becomes horizontal scrolling instead of
  shrunken type.
- From `64rem` up, schemas fit the container as before. Desktop is unchanged.
- `--schema-gutter` adds a trailing inline-end pad so the schema's right edge
  scrolls up to the container edge instead of stopping flush with the screen
  edge. It is `clamp(0px, natural + 1.25rem - 100%, 1.25rem)`, so it appears
  only when the schema is actually wider than its container — a schema that
  fits must not gain a phantom 20px scroll. Both `min-width` and the padding
  resolve their `100%` against the same box, the `.schema` host.
- The SVG is sized `border-box`, and `min-width` includes the gutter. That is
  what keeps the drawing itself at exactly `--schema-natural` while the pad
  lives outside it.
- The overflow needs a scroll ancestor. `Breakout` is one by default. Where
  there is none — `ResearchHighlights` — pass `scroll` to `PublicSvg` so the
  block scrolls itself; without it `overflow-x: clip` higher up would crop the
  schema instead.
- A grid or flex parent of a floored schema needs `min-width: 0`, otherwise the
  schema's min-content contribution stretches the track and the frame gets
  clipped rather than scrolled.
- Do not add `minWidth` to a `Breakout` around a schema. The floor already
  guarantees 100%, and a `minWidth` only widens the inner box, which costs the
  schema its left gutter.

## ScenarioFlows

`ScenarioFlows` renders one canvas — the 1440px one — at every width. There is
no separate narrow mobile layout: below `64rem` the canvas does not fit either
way, so stacking the AS-IS/TO-BE columns bought a different layout for the same
horizontal scroll, at half the reading scale.

Its `Breakout` runs with `scroll={false}`, because an overflow container above
the sticky tab bar breaks the sticky. The figure itself scrolls instead — the
tab bar is its sibling, not its descendant, so it is unaffected.

The figure widens to the `Breakout` edges via a negative inline margin, so the
schema clips at the screen edges like every other schema rather than inside the
reading column. Use `--breakout-gutter` for that margin, not `100vw`: the
viewport unit includes the classic scrollbar and drifts the schema ~4px out of
line with the text. `padding-inline-start` puts the gutter back inside the
scroll area so the canvas starts flush with the text and the tabs.
