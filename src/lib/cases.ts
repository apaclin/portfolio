import { getCollection, type CollectionEntry } from 'astro:content';

export type CaseLocale = 'en' | 'ru';
export type CaseEntry = CollectionEntry<'cases-en'> | CollectionEntry<'cases-ru'>;

export interface LocalizedCaseProps {
  entry: CaseEntry;
  requestedLocale: CaseLocale;
  contentLocale: CaseLocale;
  isFallback: boolean;
}

const otherLocale = (locale: CaseLocale): CaseLocale =>
  locale === 'ru' ? 'en' : 'ru';

const slugFromLocalizedId = (id: string) => id.replace(/-(en|ru)$/, '');

export async function getLocalizedCasePaths(requestedLocale: CaseLocale) {
  const [ru, en] = await Promise.all([
    getCollection('cases-ru'),
    getCollection('cases-en'),
  ]);

  const entriesByLocale = {
    ru: new Map(ru.map((entry) => [slugFromLocalizedId(entry.id), entry])),
    en: new Map(en.map((entry) => [slugFromLocalizedId(entry.id), entry])),
  } satisfies Record<CaseLocale, Map<string, CaseEntry>>;

  const fallbackLocale = otherLocale(requestedLocale);
  const allIds = new Set([
    ...entriesByLocale.ru.keys(),
    ...entriesByLocale.en.keys(),
  ]);

  const paths = [...allIds].map((id) => {
    const preferredEntry = entriesByLocale[requestedLocale].get(id);
    const entry = preferredEntry ?? entriesByLocale[fallbackLocale].get(id)!;
    const contentLocale = preferredEntry ? requestedLocale : fallbackLocale;

    return {
      params: { slug: id },
      props: {
        entry,
        requestedLocale,
        contentLocale,
        isFallback: contentLocale !== requestedLocale,
      } satisfies LocalizedCaseProps,
    };
  });

  paths.sort((a, b) => {
    const byOrder = a.props.entry.data.order - b.props.entry.data.order;
    return byOrder || a.params.slug.localeCompare(b.params.slug);
  });

  return paths;
}
