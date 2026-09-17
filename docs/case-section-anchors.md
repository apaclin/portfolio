# Case section anchors and the TOC

This document is authoritative for section ids, section links, and the labels
shown in the case table of contents.

## The two rules

1. **A section link carries only the part of the heading before the colon.**
   `## 5. Scenarios: three situations where a discrepancy gets expensive`
   becomes `#5-scenarios` — nothing after the colon reaches the anchor or the
   TOC.
2. **Both locales share the same anchor, taken from the English file.**

```
/cases/matchpoint/#5-scenarios
/ru/cases/matchpoint/#5-scenarios
```

The Russian page keeps the Latin anchor, so a link to a section survives a
language switch, and the URL stays readable instead of turning into
`#5-%D1%81%D1%86%D0%B5%D0%BD%D0%B0%D1%80%D0%B8%D0%B8-…`.

The TOC label, unlike the anchor, is in the language of the page: the panel
shows `5. Сценарии` and links to `#5-scenarios`.

## Where this lives

- [`src/lib/caseHeadingAnchors.ts`](../src/lib/caseHeadingAnchors.ts) — the
  rules themselves: short label, slug, de-duplication, and reading heading
  slugs out of a markdown source.
- [`src/lib/rehypeCaseHeadingIds.ts`](../src/lib/rehypeCaseHeadingIds.ts) — the
  rehype plugin that applies them. It sets `id` and `data-toc-text` on every
  heading of a file under `src/content/cases-*`.
- [`src/components/case/CaseToc.astro`](../src/components/case/CaseToc.astro) —
  reads `data-toc-text`; it does not re-derive labels for headings that the
  build already handled.

Astro's own `rehypeHeadingIds` only assigns a slug when `id` is not already a
string, so the id set here wins and is what ends up both in the markup and in
the collection's `headings`.

## Details that are easy to get wrong

- **Only a separator colon cuts.** The cut happens at a colon followed by
  whitespace or end of heading, so `Ratio 3:1` stays whole while
  `Why: 0% hallucinations` becomes `why`.
- **A heading without a colon keeps its full text.** `### Screen 1. Exception
  detail` → `#screen-1-exception-detail`.
- **Apostrophes are dropped, not hyphenated.** `10. How I'd measure success` →
  `10-how-id-measure-success`, not `…how-i-d-measure-success`.
- **Repeats get a numeric suffix** in document order: `icons`, `icons-2`.
- **The Russian file is matched to the English one by heading order**, not by
  text. Keep the heading structure of `cases-en/<case>.mdx` and
  `cases-ru/<case>.mdx` in step — same count, same order. If the counts differ,
  the plugin prints a `[case-anchors]` warning and falls back to slugs built
  from the page's own text, which means Cyrillic anchors on the Russian page.
  `npm run verify:content` fails on that mismatch before it can reach a build —
  fix the content, do not silence the check.
- **Inserting or removing a section changes the anchors after it only if its
  heading text changes.** Anchors come from text, not from position, so
  renumbering a section (`## 5.` → `## 6.`) *does* change its link.
