import { readdir, readFile, stat } from 'node:fs/promises';
import {
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveCasePathPlan } from '../src/lib/case-routing.ts';

type Locale = 'en' | 'ru';

interface Frontmatter {
  cover?: string;
  fallbackAllowed?: boolean;
}

interface CaseFile {
  file: string;
  slug: string;
  frontmatter: Frontmatter;
}

interface ImportStatement {
  clause: string | null;
  line: number;
  source: string;
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(projectRoot, 'src');
const contentDirectories: Record<Locale, string> = {
  en: join(sourceRoot, 'content', 'cases-en'),
  ru: join(sourceRoot, 'content', 'cases-ru'),
};
const assetExtensions = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
]);
const importExtensions = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.astro',
  '.md',
  '.mdx',
  '.json',
];
const errors: string[] = [];
const warnings: string[] = [];
let checkedAssetReferences = 0;
let checkedImports = 0;

const displayPath = (file: string) => relative(projectRoot, file) || '.';

async function walk(directory: string, extension?: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return walk(path, extension);
      if (!extension || extname(entry.name).toLowerCase() === extension) return [path];
      return [];
    }),
  );

  return files.flat().sort();
}

function parseScalar(value: string): string | boolean {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(file: string, source: string): { body: string; data: Frontmatter } {
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    errors.push(`${displayPath(file)}: missing opening frontmatter delimiter`);
    return { body: source, data: {} };
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end < 0) {
    errors.push(`${displayPath(file)}: missing closing frontmatter delimiter`);
    return { body: source, data: {} };
  }

  const values = new Map<string, string | boolean>();
  lines.slice(1, end).forEach((line) => {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/);
    if (match) values.set(match[1], parseScalar(match[2]));
  });

  const cover = values.get('cover');
  const fallbackAllowed = values.get('fallbackAllowed');
  return {
    body: lines.slice(end + 1).join('\n'),
    data: {
      cover: typeof cover === 'string' ? cover : undefined,
      fallbackAllowed:
        typeof fallbackAllowed === 'boolean' ? fallbackAllowed : undefined,
    },
  };
}

function collectImportStatements(file: string, body: string): ImportStatement[] {
  const lines = body.split(/\r?\n/);
  const statements: ImportStatement[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*import\b/.test(lines[index])) continue;

    const startLine = index + 1;
    let statement = lines[index].trim();
    while (!statement.includes(';') && index + 1 < lines.length) {
      index += 1;
      statement += `\n${lines[index]}`;
    }

    const fromMatch = statement.match(
      /^import\s+([\s\S]+?)\s+from\s+(['"])([^'"]+)\2\s*;\s*$/,
    );
    const sideEffectMatch = statement.match(/^import\s+(['"])([^'"]+)\1\s*;\s*$/);

    if (fromMatch) {
      statements.push({ clause: fromMatch[1].trim(), line: startLine, source: fromMatch[3] });
    } else if (sideEffectMatch) {
      statements.push({ clause: null, line: startLine, source: sideEffectMatch[2] });
    } else {
      errors.push(
        `${displayPath(file)}:${startLine}: import could not be parsed safely; keep MDX imports static and terminated with a semicolon`,
      );
    }
  }

  return statements;
}

function collectLocalBindings(clause: string | null): string[] {
  if (!clause) return [];
  const compact = clause.replace(/\s+/g, ' ').trim();
  const bindings: string[] = [];
  const defaultImport = compact.match(/^(?:type\s+)?([A-Za-z_$][\w$]*)(?:\s*,|$)/);
  const namespaceImport = compact.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
  const namedImports = compact.match(/\{([\s\S]*?)\}/);

  if (defaultImport) bindings.push(defaultImport[1]);
  if (namespaceImport) bindings.push(namespaceImport[1]);
  if (namedImports) {
    namedImports[1]
      .split(',')
      .map((item) => item.trim().replace(/^type\s+/, ''))
      .filter(Boolean)
      .forEach((item) => {
        const parts = item.split(/\s+as\s+/);
        const local = parts.at(-1)?.trim();
        if (local && /^[A-Za-z_$][\w$]*$/.test(local)) bindings.push(local);
      });
  }

  return bindings;
}

async function isExactFile(file: string): Promise<boolean> {
  const absolute = resolve(file);
  const fromRoot = relative(projectRoot, absolute);
  if (fromRoot.startsWith(`..${sep}`) || fromRoot === '..') return false;

  let current = projectRoot;
  for (const segment of fromRoot.split(sep).filter(Boolean)) {
    const names = await readdir(current);
    if (!names.includes(segment)) return false;
    current = join(current, segment);
  }

  try {
    return (await stat(absolute)).isFile();
  } catch {
    return false;
  }
}

async function resolveImport(file: string, specifier: string): Promise<string | null> {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(file), decodeURIComponent(specifier));
  const candidates = extname(base)
    ? [base]
    : [
        ...importExtensions.map((extension) => `${base}${extension}`),
        ...importExtensions.map((extension) => join(base, `index${extension}`)),
      ];

  for (const candidate of candidates) {
    if (await isExactFile(candidate)) return candidate;
  }
  return '';
}

function isLocalAssetReference(value: string): boolean {
  const clean = value.split(/[?#]/, 1)[0];
  return (
    clean.startsWith('/assets/') ||
    clean.startsWith('/src/assets/') ||
    clean.startsWith('./') ||
    clean.startsWith('../')
  ) && assetExtensions.has(extname(clean).toLowerCase());
}

function collectAssetReferences(frontmatter: Frontmatter, body: string): string[] {
  const references = new Set<string>();
  if (frontmatter.cover) references.add(frontmatter.cover);

  const patterns = [
    /(?:src|poster|data-zoom-src)\s*=\s*['"]([^'"]+)['"]/g,
    /!\[[^\]]*\]\(([^\s)]+)(?:\s+['"][^'"]*['"])?\)/g,
    /url\(\s*['"]?([^)'"]+)['"]?\s*\)/g,
    /['"](\/(?:src\/assets|assets)\/[^'"]+)['"]/g,
  ];

  patterns.forEach((pattern) => {
    for (const match of body.matchAll(pattern)) {
      if (isLocalAssetReference(match[1])) references.add(match[1]);
    }
  });

  return [...references];
}

function assetPath(file: string, reference: string): string {
  const clean = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (clean.startsWith('/src/')) return join(projectRoot, clean.slice(1));
  if (clean.startsWith('/assets/')) return join(projectRoot, 'public', clean.slice(1));
  return resolve(dirname(file), clean);
}

async function validateMdxFile(file: string): Promise<Frontmatter> {
  const source = await readFile(file, 'utf8');
  const { body, data } = parseFrontmatter(file, source);
  const imports = collectImportStatements(file, body);
  const importsBySource = new Map<string, number>();
  const bindings = new Map<string, number>();

  for (const statement of imports) {
    checkedImports += 1;
    const previousSourceLine = importsBySource.get(statement.source);
    if (previousSourceLine !== undefined) {
      errors.push(
        `${displayPath(file)}:${statement.line}: duplicate import source "${statement.source}" (first imported on line ${previousSourceLine})`,
      );
    } else {
      importsBySource.set(statement.source, statement.line);
    }

    collectLocalBindings(statement.clause).forEach((binding) => {
      const previousBindingLine = bindings.get(binding);
      if (previousBindingLine !== undefined) {
        errors.push(
          `${displayPath(file)}:${statement.line}: duplicate local import "${binding}" (first declared on line ${previousBindingLine})`,
        );
      } else {
        bindings.set(binding, statement.line);
      }
    });

    const resolvedImport = await resolveImport(file, statement.source);
    if (resolvedImport === '') {
      errors.push(
        `${displayPath(file)}:${statement.line}: import does not exist with exact casing: ${statement.source}`,
      );
    }
  }

  for (const reference of collectAssetReferences(data, body)) {
    checkedAssetReferences += 1;
    const target = assetPath(file, reference);
    if (!(await isExactFile(target))) {
      errors.push(
        `${displayPath(file)}: asset does not exist with exact casing: ${reference}`,
      );
    }
  }

  return data;
}

async function loadCases(locale: Locale): Promise<Map<string, CaseFile>> {
  const files = await walk(contentDirectories[locale], '.mdx');
  const cases = new Map<string, CaseFile>();

  for (const file of files) {
    const slug = relative(contentDirectories[locale], file)
      .split(sep)
      .join('/')
      .replace(/\.mdx$/i, '');
    const frontmatter = parseFrontmatter(file, await readFile(file, 'utf8')).data;
    if (cases.has(slug)) {
      errors.push(`${displayPath(file)}: duplicate ${locale.toUpperCase()} case slug "${slug}"`);
    }
    cases.set(slug, { file, slug, frontmatter });
  }

  return cases;
}

async function validateLocaleParity(casesByLocale: Record<Locale, Map<string, CaseFile>>) {
  const allSlugs = new Set([
    ...casesByLocale.en.keys(),
    ...casesByLocale.ru.keys(),
  ]);

  allSlugs.forEach((slug) => {
    const en = casesByLocale.en.get(slug);
    const ru = casesByLocale.ru.get(slug);
    if (en && ru) return;

    const source = en ?? ru;
    const missingLocale = en ? 'RU' : 'EN';
    if (source?.frontmatter.fallbackAllowed) {
      warnings.push(
        `${displayPath(source.file)}: ${missingLocale} translation for "${slug}" is missing; explicit fallback is allowed`,
      );
    } else {
      errors.push(
        `${source ? displayPath(source.file) : slug}: ${missingLocale} translation for "${slug}" is missing; add it or set fallbackAllowed: true`,
      );
    }
  });

  return allSlugs;
}

function routeFor(locale: Locale, slug: string): string {
  return `/${locale === 'ru' ? 'ru/' : ''}cases/${slug}`;
}

async function validateFallbackRouting(
  casesByLocale: Record<Locale, Map<string, CaseFile>>,
) {
  const enSlugs = [...casesByLocale.en.keys()];
  const ruSlugs = [...casesByLocale.ru.keys()];
  const expectedSlugs = new Set([...enSlugs, ...ruSlugs]);

  // Exercise the real routing function shared with `getLocalizedCasePaths`
  // (instead of asserting on the helper's source text) and check the plan it
  // produces against expectations derived independently from the filesystem.
  (['en', 'ru'] as const).forEach((requestedLocale) => {
    const plan = resolveCasePathPlan(enSlugs, ruSlugs, requestedLocale);
    const planned = new Map(plan.map((item) => [item.slug, item]));

    plan.forEach((item) => {
      if (!expectedSlugs.has(item.slug)) {
        errors.push(
          `${routeFor(requestedLocale, item.slug)} is generated for a slug with no content file`,
        );
      }
    });

    expectedSlugs.forEach((slug) => {
      const item = planned.get(slug);
      if (!item) {
        errors.push(`${routeFor(requestedLocale, slug)} is not generated`);
        return;
      }
      // The locale the plan chose to render must actually own the content...
      if (!casesByLocale[item.contentLocale].has(slug)) {
        errors.push(
          `${routeFor(requestedLocale, slug)} resolves to ${item.contentLocale.toUpperCase()} content that does not exist`,
        );
      }
      // ...and isFallback must match whether the requested locale has its own
      // translation, computed here without reference to the function's output.
      const expectedFallback = !casesByLocale[requestedLocale].has(slug);
      if (item.isFallback !== expectedFallback) {
        errors.push(
          `${routeFor(requestedLocale, slug)} reports isFallback=${item.isFallback}, expected ${expectedFallback}`,
        );
      }
    });
  });

  // The route wiring itself (which locale each `[slug].astro` requests) can only
  // be checked at the source level — its getStaticPaths cannot run outside the
  // Astro build — so this stays a lightweight call-site check.
  const enRoutePath = join(sourceRoot, 'pages', 'cases', '[slug].astro');
  const ruRoutePath = join(sourceRoot, 'pages', 'ru', 'cases', '[slug].astro');
  const [enRoute, ruRoute] = await Promise.all([
    readFile(enRoutePath, 'utf8'),
    readFile(ruRoutePath, 'utf8'),
  ]);
  if (!/getLocalizedCasePaths\((?:defaultLocale|['"]en['"])\)/.test(enRoute)) {
    errors.push(`${displayPath(enRoutePath)}: unprefixed route must request English-primary paths`);
  }
  if (!/getLocalizedCasePaths\(['"]ru['"]\)/.test(ruRoute)) {
    errors.push(`${displayPath(ruRoutePath)}: prefixed route must request Russian-primary paths`);
  }
}

async function main() {
  console.log('Content validation');

  const allMdxFiles = await walk(sourceRoot, '.mdx');
  await Promise.all(allMdxFiles.map(validateMdxFile));

  const [enCases, ruCases] = await Promise.all([loadCases('en'), loadCases('ru')]);
  const casesByLocale = { en: enCases, ru: ruCases };
  const allSlugs = await validateLocaleParity(casesByLocale);
  await validateFallbackRouting(casesByLocale);

  if (warnings.length > 0) {
    console.warn(`\nWarnings (${warnings.length})`);
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length > 0) {
    console.error(`\nValidation failed (${errors.length} error${errors.length === 1 ? '' : 's'})`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`  ✓ Locale parity: ${allSlugs.size} slugs across EN and RU`);
  console.log(`  ✓ Asset resolution: ${checkedAssetReferences} direct references`);
  console.log(`  ✓ MDX import safety: ${checkedImports} imports across ${allMdxFiles.length} files`);
  console.log('  ✓ Fallback routing: EN-primary and RU-prefixed route generators');
  console.log('Content validation passed');
}

await main();
