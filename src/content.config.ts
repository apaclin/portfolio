import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Строгая схема кейса. Общая для обеих локалей — различаются только
// каталоги-источники. cover — единственное опциональное поле.
const caseSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  order: z.number(),
  cover: z.string().optional(),
});

// Английские кейсы: ./src/content/cases-en/**/*.mdx
const casesEn = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cases-en' }),
  schema: caseSchema,
});

// Русские кейсы: ./src/content/cases-ru/**/*.mdx
const casesRu = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cases-ru' }),
  schema: caseSchema,
});

export const collections = {
  'cases-en': casesEn,
  'cases-ru': casesRu,
};
