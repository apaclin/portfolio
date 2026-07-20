import type { Locale } from '../../lib/i18n';

import filmaze01 from '../../assets/images/cases/filmaze/slice-01.png';
import filmaze02 from '../../assets/images/cases/filmaze/slice-02.png';
import filmaze03 from '../../assets/images/cases/filmaze/slice-03.png';
import filmaze04 from '../../assets/images/cases/filmaze/slice-04.png';
import filmaze05 from '../../assets/images/cases/filmaze/slice-05.png';
import filmaze06 from '../../assets/images/cases/filmaze/slice-06.png';
import filmaze07 from '../../assets/images/cases/filmaze/slice-07.png';
import filmaze08 from '../../assets/images/cases/filmaze/slice-08.png';
import filmaze09 from '../../assets/images/cases/filmaze/slice-09.png';
import filmaze10 from '../../assets/images/cases/filmaze/slice-10.png';
import filmaze11 from '../../assets/images/cases/filmaze/slice-11.png';
import filmaze12 from '../../assets/images/cases/filmaze/slice-12.png';
import filmaze13 from '../../assets/images/cases/filmaze/slice-13.png';
import bergstrom01 from '../../assets/images/cases/bergstrom/slice-01.png';
import bergstrom02 from '../../assets/images/cases/bergstrom/slice-02.png';
import bergstrom03 from '../../assets/images/cases/bergstrom/slice-03.png';
import bergstrom04 from '../../assets/images/cases/bergstrom/slice-04.png';
import bergstrom05 from '../../assets/images/cases/bergstrom/slice-05.png';
import bergstrom06 from '../../assets/images/cases/bergstrom/slice-06.png';
import bergstrom07 from '../../assets/images/cases/bergstrom/slice-07.png';
import bergstrom08 from '../../assets/images/cases/bergstrom/slice-08.png';
import bergstromCover from '../../assets/images/project-covers/bergstrom.webp';
import filmazeCover from '../../assets/images/project-covers/filmaze.webp';

const filmazeSlices = [
  filmaze01,
  filmaze02,
  filmaze03,
  filmaze04,
  filmaze05,
  filmaze06,
  filmaze07,
  filmaze08,
  filmaze09,
  filmaze10,
  filmaze11,
  filmaze12,
  filmaze13,
];

const bergstromSlices = [
  bergstrom01,
  bergstrom02,
  bergstrom03,
  bergstrom04,
  bergstrom05,
  bergstrom06,
  bergstrom07,
  bergstrom08,
];

/** Localized copy for a visual case board (title, SEO, a11y labels). */
interface VisualCaseCopy {
  title: string;
  description: string;
  ariaLabel: string;
  sliceAltPrefix: string;
}

/** Locale-invariant layout config plus per-locale copy for one visual case. */
interface VisualCaseDefinition {
  slices: ImageMetadata[];
  cover: ImageMetadata;
  background: string;
  mobileCanvasWidth: string;
  copy: Record<Locale, VisualCaseCopy>;
}

const visualCases = {
  bergstrom: {
    slices: bergstromSlices,
    cover: bergstromCover,
    background: '#1c1d1a',
    mobileCanvasWidth: '960px',
    copy: {
      en: {
        title: 'Bergström architecture studio website',
        description:
          'Bergström: a visual case study for an architecture studio website.',
        ariaLabel: 'Bergström architecture studio website visual case study',
        sliceAltPrefix: 'Bergström visual case board',
      },
      ru: {
        title: 'Сайт архитектурной студии Bergström',
        description: 'Bergström: визуальный кейс сайта архитектурной студии.',
        ariaLabel: 'Визуальный кейс сайта архитектурной студии Bergström',
        sliceAltPrefix: 'Экран визуального кейса Bergström',
      },
    },
  },
  filmaze: {
    slices: filmazeSlices,
    cover: filmazeCover,
    background: '#000',
    mobileCanvasWidth: '960px',
    copy: {
      en: {
        title: 'Filmaze online cinema',
        description:
          'Filmaze online cinema: a visual case study for a mobile streaming application.',
        ariaLabel: 'Filmaze online cinema visual case study',
        sliceAltPrefix: 'Filmaze visual case board',
      },
      ru: {
        title: 'Онлайн-кинотеатр Filmaze',
        description:
          'Онлайн-кинотеатр Filmaze: визуальный кейс мобильного приложения.',
        ariaLabel: 'Визуальный кейс онлайн-кинотеатра Filmaze',
        sliceAltPrefix: 'Экран визуального кейса Filmaze',
      },
    },
  },
} satisfies Record<string, VisualCaseDefinition>;

export type VisualCaseSlug = keyof typeof visualCases;

/** Fully-resolved props for `VisualCasePage.astro` for one slug + locale. */
export function getVisualCase(slug: VisualCaseSlug, locale: Locale) {
  const { slices, cover, background, mobileCanvasWidth, copy } = visualCases[slug];
  return { locale, slices, cover, background, mobileCanvasWidth, ...copy[locale] };
}
