# Lightbox image sizing pattern

This document is authoritative for zoomable case-study images.

## Default behavior

- `Image.astro` and `Carousel.astro` must pass the source aspect ratio through
  `data-zoom-width` and `data-zoom-height`.
- Their default `data-lightbox-fit` is `auto`.
- `data-max-width` is the image's logical CSS width, not the exported bitmap
  width. A `2880 px` Retina export with `data-max-width="1440"` displays at up
  to `1440 CSS px`.
- In `auto`, calculate the image height at its available logical width. If that
  height exceeds `85vh`, use the `width` layout:
  - preserve the available logical width;
  - do not cap image height;
  - scroll vertically inside `.lightbox__media`.
- This is the standard pattern for tall UI screenshots. Never shrink a tall
  screen with `max-height` merely to show it all at once; UI text must remain
  readable and the user scrolls through the screen.

## Explicit overrides

- Use `lightboxFit="contain"` only when seeing the entire asset at once is more
  important than preserving UI scale, for example a compact diagram or photo.
- Use `lightboxFit="width"` only to force scrolling regardless of the current
  viewport calculation.
- Do not add per-image `width` overrides for ordinary tall screenshots. Their
  source dimensions should make `auto` select the scrolling layout.

## Entry rendering

- Replace and clear previous media before showing a new image.
- Keep raster media hidden until `HTMLImageElement.decode()` completes.
- On close, remove the media node and the `is-content-ready` state.
- These rules prevent stale, blank, or partially decoded frames from flashing
  when entering the lightbox.
