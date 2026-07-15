import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { resolveCasePathPlan } from './case-routing';

export type CaseLocale = Locale;
export type CaseEntry = CollectionEntry<'casesEn'> | CollectionEntry<'casesRu'>;

export interface LocalizedCaseProps {
  entry: CaseEntry;
  requestedLocale: CaseLocale;
  contentLocale: CaseLocale;
  isFallback: boolean;
}

export async function getLocalizedCasePaths(requestedLocale: CaseLocale) {
  const [ru, en] = await Promise.all([
    getCollection('casesRu'),
    getCollection('casesEn'),
  ]);

  // With separate `cases-en` / `cases-ru` glob collections the entry id is
  // already the bare slug (e.g. "matchpoint"), so it maps 1:1 across locales.
  const entriesByLocale = {
    ru: new Map(ru.map((entry) => [entry.id, entry])),
    en: new Map(en.map((entry) => [entry.id, entry])),
  } satisfies Record<CaseLocale, Map<string, CaseEntry>>;

  const plan = resolveCasePathPlan(
    entriesByLocale.en.keys(),
    entriesByLocale.ru.keys(),
    requestedLocale,
  );

  const paths = plan.map(({ slug, contentLocale, isFallback }) => ({
    params: { slug },
    props: {
      entry: entriesByLocale[contentLocale].get(slug)!,
      requestedLocale,
      contentLocale,
      isFallback,
    } satisfies LocalizedCaseProps,
  }));

  paths.sort((a, b) => {
    const byOrder = a.props.entry.data.order - b.props.entry.data.order;
    return byOrder || a.params.slug.localeCompare(b.params.slug);
  });

  return paths;
}
