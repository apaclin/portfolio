/* ----------------------------------------------------------------------------
   Якоря и подписи разделов кейса.

   Заголовок раздела устроен как «5. Scenarios: три ситуации, в которых…»:
   до двоеточия — короткое имя раздела, после — расшифровка. В оглавление и в
   ссылку идёт ТОЛЬКО часть до двоеточия, иначе панель TOC превращается в
   простыню, а ссылка — в строку на двести символов (в русской версии ещё и
   в процентах: %D1%81%D1%86…).

   Якорь у обеих локалей ОДИН и тот же и берётся из английского файла кейса:
   /cases/matchpoint/#5-scenarios и /ru/cases/matchpoint/#5-scenarios. Так
   ссылка на раздел переживает переключение языка и остаётся латиницей.

   Хелперы лежат отдельно от rehype-плагина, потому что теми же правилами
   пользуется клиентский скрипт оглавления (CaseToc.astro).
   ---------------------------------------------------------------------------- */

/**
 * Короткая подпись заголовка: всё до первого двоеточия.
 *
 * Режем только по двоеточию-разделителю — за ним пробел или конец строки.
 * «Ratio 3:1» остаётся целым, «Why: 0% hallucinations» превращается в «Why».
 */
export function shortHeadingLabel(text: string): string {
  const raw = text.replace(/\s+/gu, ' ').trim();
  const match = /^([^:]+):(?=\s|$)/u.exec(raw);
  const short = match?.[1]?.trim();
  return short || raw;
}

/**
 * Слаг якоря: только буквы и цифры, остальное — дефис.
 *
 * Апострофы выбрасываем, а не превращаем в дефис: «how I'd measure» должно
 * давать `how-id-measure`, а не `how-i-d-measure`.
 */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['\u2019\u02bc]/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
}

/** Уникализация одинаковых слагов в пределах страницы: icons, icons-2, icons-3. */
export function uniqueSlug(base: string, used: Set<string>): string {
  const root = base || 'section';
  let slug = root;
  let index = 2;

  while (used.has(slug)) {
    slug = `${root}-${index}`;
    index += 1;
  }

  used.add(slug);
  return slug;
}

/** Инлайновая разметка в тексте заголовка: `**жирный**`, `` `код` ``, ссылки. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/[*_`~]/gu, '')
    .replace(/\s+#+\s*$/u, '') // закрывающие решётки ATX-заголовка
    .trim();
}

/**
 * Слаги всех заголовков markdown-файла в порядке документа.
 *
 * Читаем исходник, а не готовое дерево: русская страница собирается отдельно
 * от английской, и порядок сборки не гарантирован — кэшировать результат
 * английского прохода нельзя.
 */
export function headingSlugsFromMarkdown(source: string): string[] {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---[^\n]*\r?\n/u, '');
  const used = new Set<string>();
  const slugs: string[] = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s{0,3}(```|~~~)/u.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+)$/u.exec(line);
    if (!match) continue;

    const text = shortHeadingLabel(stripInlineMarkdown(match[2]));
    slugs.push(uniqueSlug(slugifyHeading(text), used));
  }

  return slugs;
}
