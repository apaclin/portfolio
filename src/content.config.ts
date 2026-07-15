import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// z импортируем из 'astro/zod' (не из 'astro:content' — там реэкспорт z
// помечен @deprecated). Той же зод-зависимости astro, без новых пакетов.
import { z } from 'astro/zod';

// One schema shared by Astro and the two locale-specific Keystatic collections.
const caseSchema = z.object({
  title: z.string(),
  description: z.string(),
  meta: z.string().optional(),
  subtitle: z.string().optional(),
  // Short label + tagline shown on the projects-page card (distinct from the
  // long hero `subtitle`). Optional so Keystatic-created drafts still validate.
  cardTitle: z.string().optional(),
  cardSubtitle: z.string().optional(),
  date: z.coerce.date(),
  order: z.number(),
  cover: z.string(),
  fallbackAllowed: z.boolean().optional(),
});

const casesEn = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cases-en' }),
  schema: caseSchema,
});

const casesRu = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cases-ru' }),
  schema: caseSchema,
});

export const collections = {
  casesEn,
  casesRu,
};
