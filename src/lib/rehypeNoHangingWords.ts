import type { Element, ElementContent, Root } from 'hast';

/* ----------------------------------------------------------------------------
   Висячие предлоги в заголовках.

   `text-wrap: pretty` спасает от одинокого слова на последней строке, но не
   мешает строке закончиться предлогом или союзом («…в таблице, а / рабочий
   объект»). Правило простое: служебное слово уезжает на следующую строку
   вместе со словом, к которому относится.

   ПОЧЕМУ SPAN, А НЕ NBSP. Неразрывный пробел был бы короче, но он попадает в
   текст заголовка, а из этого текста Astro (rehypeHeadingIds) считает id для
   якорей: github-slugger не превращает U+00A0 в дефис, а ВЫРЕЗАЕТ его —
   «не ошибка» стало бы «неошибка», и все ссылки на разделы поехали бы. Плюс
   nbsp ломает поиск по странице (Ctrl+F) и копирование. Обёртка в span с
   white-space: nowrap оставляет текст символ в символ прежним: меняется только
   вёрстка строк.

   Плагин пользователя выполняется ДО rehypeHeadingIds (и в markdown-, и в
   MDX-конвейере), поэтому текст трогать нельзя — только структуру.
   ---------------------------------------------------------------------------- */

/** Служебные слова, которые не должны оставаться в конце строки. */
const SHORT_WORDS = new Set([
  // русские: все однобуквенные + короткие предлоги, союзы, частицы
  'а', 'б', 'в', 'ж', 'и', 'к', 'о', 'с', 'у', 'я',
  'бы', 'во', 'да', 'до', 'же', 'за', 'из', 'ко', 'ли', 'ль', 'на', 'не',
  'ни', 'но', 'об', 'от', 'по', 'со', 'то',
  'без', 'для', 'изо', 'или', 'как', 'над', 'обо', 'ото', 'под', 'при',
  'про', 'что', 'чем',
  // английские: артикли и короткие предлоги/союзы
  'a', 'an', 'the', 'and', 'as', 'at', 'but', 'by', 'for', 'i', 'in', 'of',
  'on', 'or', 'to', 'up', 'via',
]);

const HEADING = /^h[1-6]$/;

/** Внутрь этих элементов не лезем: там пробелы значимы или это не текст. */
const OPAQUE = new Set(['code', 'pre', 'svg', 'kbd', 'samp']);

/** Открывающая пунктуация перед словом не мешает считать его служебным. */
function isShortWord(word: string): boolean {
  return SHORT_WORDS.has(word.replace(/^[«"„'(\[]+/u, '').toLowerCase());
}

function nowrapSpan(value: string): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['no-hang'] },
    children: [{ type: 'text', value }],
  };
}

/**
 * Разбивает текст узла на обычные куски и неразрывные пары.
 * `hasNextSibling` — есть ли за этим текстом ещё контент (например `<strong>`):
 * тогда служебное слово в самом конце узла тоже нужно склеить, пробел уезжает
 * внутрь span и перенос на нём становится невозможен.
 */
function splitText(value: string, hasNextSibling: boolean): ElementContent[] {
  // split с захватом: чётные индексы — слова, нечётные — пробелы.
  const parts = value.split(/(\s+)/u);
  const out: ElementContent[] = [];
  let plain = '';

  const flush = () => {
    if (plain) {
      out.push({ type: 'text', value: plain });
      plain = '';
    }
  };

  let i = 0;
  while (i < parts.length) {
    const isWord = i % 2 === 0;
    const next = parts[i + 2];
    const canGlue = next === undefined ? false : next.length > 0 || hasNextSibling;

    if (isWord && isShortWord(parts[i]) && parts[i + 1] !== undefined && canGlue) {
      // Цепочка служебных слов подряд («и не в срок») склеивается целиком,
      // иначе перенос просто переехал бы на следующий предлог.
      let run = '';
      while (i < parts.length && isShortWord(parts[i]) && parts[i + 1] !== undefined) {
        run += parts[i] + parts[i + 1];
        i += 2;
      }
      // Слово-хозяин: если оно в этом же текстовом узле — забираем его в span,
      // если узел на нём кончился — хватает пробела внутри span.
      if (i < parts.length && parts[i].length > 0) {
        run += parts[i];
        i += 1;
      }
      flush();
      out.push(nowrapSpan(run));
      continue;
    }

    plain += parts[i];
    i += 1;
  }

  flush();
  return out;
}

function processElement(node: Element): void {
  const children: ElementContent[] = [];

  node.children.forEach((child, index) => {
    if (child.type === 'text') {
      children.push(...splitText(child.value, index < node.children.length - 1));
      return;
    }
    if (child.type === 'element' && !OPAQUE.has(child.tagName)) {
      processElement(child);
    }
    children.push(child);
  });

  node.children = children;
}

/** Rehype-плагин: не оставляет предлоги и союзы в конце строки заголовков. */
export default function rehypeNoHangingWords() {
  return (tree: Root): void => {
    const walk = (node: Root | Element): void => {
      for (const child of node.children) {
        if (child.type !== 'element') continue;
        if (HEADING.test(child.tagName)) {
          processElement(child);
        } else if (!OPAQUE.has(child.tagName)) {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
