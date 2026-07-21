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
import bergstrom09 from '../../assets/images/cases/bergstrom/slice-09.png';
import bergstrom10 from '../../assets/images/cases/bergstrom/slice-10.png';
import bergstrom11 from '../../assets/images/cases/bergstrom/slice-11.png';
import bergstrom12 from '../../assets/images/cases/bergstrom/slice-12.png';
import bergstromCover from '../../assets/images/project-covers/bergstrom.webp';
import filmazeCover from '../../assets/images/project-covers/filmaze.webp';

/** One board of a visual case: either an exported still or a looping clip. */
export type VisualCaseBoard =
  | { kind: 'image'; src: ImageMetadata }
  | {
      kind: 'video';
      /** Path under `public/`, served as-is (Astro does not process video). */
      src: string;
      /** CSS `aspect-ratio`, reserved up front so the board never shifts. */
      aspectRatio: string;
    };

const image = (src: ImageMetadata): VisualCaseBoard => ({ kind: 'image', src });
const video = (src: string, aspectRatio: string): VisualCaseBoard => ({
  kind: 'video',
  src,
  aspectRatio,
});

const filmazeBoards: VisualCaseBoard[] = [
  image(filmaze01),
  image(filmaze02),
  image(filmaze03),
  image(filmaze04),
  image(filmaze05),
  image(filmaze06),
  image(filmaze07),
  image(filmaze08),
  video('/videos/filmaze/logo.mp4', '1920 / 1272'),
  image(filmaze09),
  image(filmaze10),
  image(filmaze11),
  image(filmaze12),
  image(filmaze13),
];

// Исходные борды 03 и 06 были слишком высокими — Figma экспортировала их с
// потерей качества, поэтому каждый разрезан в макете на три части. Порядок
// показа от этого не меняется: части идут встык.
const bergstromBoards: VisualCaseBoard[] = [
  image(bergstrom01),
  image(bergstrom02),
  video('/videos/bergstrom/main-page.mp4', '1920 / 1124'),
  image(bergstrom03), // бывший 03, часть 1
  image(bergstrom04), // бывший 03, часть 2
  image(bergstrom05), // бывший 03, часть 3
  image(bergstrom06), // бывший 04
  image(bergstrom07), // бывший 05
  image(bergstrom08), // бывший 06, часть 1
  image(bergstrom09), // бывший 06, часть 2
  image(bergstrom10), // бывший 06, часть 3
  video('/videos/bergstrom/about-us.mp4', '1920 / 1400'),
  image(bergstrom11), // бывший 07
  video('/videos/bergstrom/contacts.mp4', '1920 / 1644'),
  image(bergstrom12), // бывший 08
  video('/videos/bergstrom/thank-you.mp4', '1920 / 514'),
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
  boards: VisualCaseBoard[];
  cover: ImageMetadata;
  background: string;
  /** Тон спиннера загрузки видео: подбирается под содержимое роликов. */
  videoSpinner: 'light' | 'dark';
  copy: Record<Locale, VisualCaseCopy>;
}

const visualCases = {
  bergstrom: {
    boards: bergstromBoards,
    cover: bergstromCover,
    background: '#1c1d1a',
    videoSpinner: 'dark',
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
    boards: filmazeBoards,
    cover: filmazeCover,
    background: '#000',
    videoSpinner: 'light',
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
  const { boards, cover, background, videoSpinner, copy } = visualCases[slug];
  return { locale, boards, cover, background, videoSpinner, ...copy[locale] };
}
