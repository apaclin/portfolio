// Импорт живого превью плагина MonoScript в public/embeds/monoscript/index.html.
//
//   node scripts/import-monoscript-preview.mjs [путь до dev-harness.html]
//
// Исходник собирается в репозитории плагина:
//
//   npm run build:prod && node scripts/make-harness.mjs fresh
//
// Именно `fresh`, а не `demo`: в превью должно стоять то, что человек увидит,
// поставив плагин, — набор поставляемых скриптов и больше ничего. Вариант `demo`
// набит выдуманной библиотекой (`export-icons`, `audit-spacing`, …), она нужна
// харнессу плагина, чтобы гонять разделитель, папки и корзину, но на сайте
// выдаёт за продукт то, чего в нём нет.
//
// Копировать файл руками нельзя: харнесс рассчитан на то, что его открывают
// верхним окном, где `parent === window`. UI шлёт команды в песочницу через
// `parent.postMessage` (см. src/ui/lib/bridge.ts), а стаб-песочница слушает
// своё же окно. Внутри нашего iframe `parent` — это страница кейса, команды
// уходят туда, и UI навсегда остаётся в состоянии «No scripts yet».
//
// Поэтому при импорте в документ добавляется шим, который возвращает `parent`
// на себя. `parent` в Window помечен [Replaceable], то есть перезаписываем —
// но на всякий случай пробуем и defineProperty.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(
  process.argv[2] ?? '/Users/alexpaclin/Documents/Code/my-scripter/dist/dev-harness.html',
);
const target = resolve(projectRoot, 'public/embeds/monoscript/index.html');

const SHIM = `
<script>
  /* Вставлено scripts/import-monoscript-preview.mjs — см. комментарий там. */
  (function () {
    if (window.parent === window) return;
    try { window.parent = window; } catch (e) { /* пробуем ниже */ }
    if (window.parent !== window) {
      try {
        Object.defineProperty(window, 'parent', { get: function () { return window; } });
      } catch (e) { /* не вышло — стаб не ответит, превью останется пустым */ }
    }
  })();
</script>
`;

const html = await readFile(source, 'utf8');

if (!html.includes('__fromStub')) {
  throw new Error(
    `${source} — это не dev-harness (нет стаб-песочницы). Соберите его: npm run build:prod && node scripts/make-harness.mjs fresh`,
  );
}

const anchor = html.match(/<body[^>]*>/);
if (!anchor) throw new Error(`${source}: не найден <body>`);

const at = anchor.index + anchor[0].length;
const patched = html.slice(0, at) + SHIM + html.slice(at);

await mkdir(dirname(target), { recursive: true });
await writeFile(target, patched);

const mb = (patched.length / 1024 / 1024).toFixed(1);
console.log(`public/embeds/monoscript/index.html записан (${mb} MB)`);
