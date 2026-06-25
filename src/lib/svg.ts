/**
 * Неймспейсит id внутри строки SVG, чтобы две разные Figma-схемы на одной
 * странице не конфликтовали по id (clipPath/gradient/mask и т.п.).
 *
 * Берём ТОЛЬКО реально объявленные в этом SVG id (`id="..."`) и заменяем их
 * вместе со ссылками в известных формах: `url(#id)`, `url("#id")`, `href="#id"`,
 * `xlink:href="#id"`. Чужого не трогаем. id экранируется, замена идёт от длинных
 * к коротким — чтобы короткий id не зацепил часть длинного.
 */
export function namespaceSvgIds(svg: string, prefix: string): string {
  const ids = new Set<string>();
  for (const match of svg.matchAll(/\sid=["']([^"']+)["']/g)) {
    ids.add(match[1]);
  }
  if (ids.size === 0) return svg;

  let out = svg;
  for (const id of [...ids].sort((a, b) => b.length - a.length)) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nid = `${prefix}${id}`;
    out = out
      // определение: <tag ... id="ID">
      .replace(new RegExp(`(\\sid=["'])${esc}(["'])`, 'g'), `$1${nid}$2`)
      // ссылки: url(#ID) и url("#ID")/url('#ID')
      .replace(new RegExp(`url\\(\\s*["']?#${esc}["']?\\s*\\)`, 'g'), `url(#${nid})`)
      // ссылки: href="#ID" (покрывает и xlink:href="#ID")
      .replace(new RegExp(`(href=["'])#${esc}(["'])`, 'g'), `$1#${nid}$2`);
  }
  return out;
}

/** Префикс для id из имени схемы: безопасные символы + разделитель. */
export function svgIdPrefix(name: string): string {
  return `${name.replace(/[^a-zA-Z0-9_-]/g, '-')}--`;
}
