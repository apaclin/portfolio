import type { Locale } from './i18n';

export interface CasePathPlanItem {
  slug: string;
  contentLocale: Locale;
  isFallback: boolean;
}

/**
 * Pure fallback-routing resolution, deliberately free of any `astro:content`
 * runtime import so it can be exercised directly by `scripts/verify-content.ts`
 * outside the Astro build.
 *
 * Given the case slugs available in each locale and the requested locale, it
 * decides which locale actually renders for each slug — falling back to the
 * alternate locale when the requested one has no translation. Both
 * `getLocalizedCasePaths` (build) and the content verifier (CI) call this, so
 * the routing behavior is tested for real instead of by grepping source text.
 */
export function resolveCasePathPlan(
  enSlugs: Iterable<string>,
  ruSlugs: Iterable<string>,
  requestedLocale: Locale,
): CasePathPlanItem[] {
  const slugsByLocale: Record<Locale, Set<string>> = {
    en: new Set(enSlugs),
    ru: new Set(ruSlugs),
  };
  const fallbackLocale: Locale = requestedLocale === 'en' ? 'ru' : 'en';
  const allSlugs = new Set([...slugsByLocale.ru, ...slugsByLocale.en]);

  return [...allSlugs].map((slug) => {
    const contentLocale: Locale = slugsByLocale[requestedLocale].has(slug)
      ? requestedLocale
      : fallbackLocale;
    return {
      slug,
      contentLocale,
      isFallback: contentLocale !== requestedLocale,
    };
  });
}
