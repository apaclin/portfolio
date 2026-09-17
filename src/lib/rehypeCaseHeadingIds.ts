import fs from 'node:fs';
import path from 'node:path';
import type { Element, Root } from 'hast';
import {
  headingSlugsFromMarkdown,
  shortHeadingLabel,
  slugifyHeading,
  uniqueSlug,
} from './caseHeadingAnchors';

/* ----------------------------------------------------------------------------
   Якоря разделов кейса.

   Правила и мотивация — в src/lib/caseHeadingAnchors.ts и
   docs/case-section-anchors.md. Здесь только их применение к дереву:

   1. id заголовка = слаг части ДО двоеточия;
   2. id берётся из английского файла кейса, поэтому у /cases/x/ и /ru/cases/x/
      якоря совпадают;
   3. в data-toc-text кладётся короткая подпись на языке страницы — её читает
      оглавление (CaseToc.astro), чтобы не резать текст ещё раз в браузере.

   Плагин пользователя выполняется ДО rehypeHeadingIds, а тот проставляет свой
   слаг, только если id ещё не строка, — поэтому наш id побеждает и попадает
   и в разметку, и в `headings` коллекции.
   ---------------------------------------------------------------------------- */

const HEADING = /^h[1-6]$/u;
const CASE_FILE = /\/src\/content\/cases-(?:en|ru)\/([^/]+\.mdx?)$/u;

/** Английский исходник кейса — источник якорей для обеих локалей. */
const englishSourceCache = new Map<string, string[] | null>();

function englishAnchorsFor(filePath: string): string[] | null {
  const normalized = filePath.split(path.sep).join('/');
  const match = CASE_FILE.exec(normalized);
  if (!match) return null;

  const englishPath = `${normalized.slice(0, match.index)}/src/content/cases-en/${match[1]}`;
  const cached = englishSourceCache.get(englishPath);
  if (cached !== undefined) return cached;

  let anchors: string[] | null = null;
  try {
    anchors = headingSlugsFromMarkdown(fs.readFileSync(englishPath, 'utf8'));
  } catch {
    // Кейс без английской версии — считаем якоря по собственному тексту.
    anchors = null;
  }

  englishSourceCache.set(englishPath, anchors);
  return anchors;
}

function textOf(node: Element): string {
  let text = '';
  const walk = (current: Element): void => {
    for (const child of current.children) {
      if (child.type === 'text') text += child.value;
      else if (child.type === 'element') walk(child);
    }
  };
  walk(node);
  return text;
}

function collectHeadings(tree: Root): Element[] {
  const headings: Element[] = [];
  const walk = (node: Root | Element): void => {
    for (const child of node.children) {
      if (child.type !== 'element') continue;
      if (HEADING.test(child.tagName)) headings.push(child);
      else walk(child);
    }
  };
  walk(tree);
  return headings;
}

export default function rehypeCaseHeadingIds() {
  return (tree: Root, file: { history?: string[] }): void => {
    const filePath = file.history?.[0];
    if (!filePath || !CASE_FILE.test(filePath.split(path.sep).join('/'))) return;

    const headings = collectHeadings(tree);
    let anchors = englishAnchorsFor(filePath);

    // Структура разошлась (в одной локали разделов больше) — сопоставлять по
    // порядку нельзя, иначе якоря молча съедут. Считаем по своему тексту.
    if (anchors && anchors.length !== headings.length) {
      console.warn(
        `[case-anchors] ${path.basename(filePath)}: заголовков ${headings.length}, ` +
          `в английской версии ${anchors.length} — якоря считаются по своему тексту`,
      );
      anchors = null;
    }

    const used = new Set<string>();

    headings.forEach((heading, index) => {
      const short = shortHeadingLabel(textOf(heading));
      const id = anchors?.[index] ?? uniqueSlug(slugifyHeading(short), used);

      heading.properties = heading.properties ?? {};
      heading.properties.id = id;
      heading.properties['data-toc-text'] = short;
    });
  };
}
