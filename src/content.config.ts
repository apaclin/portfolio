import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// z импортируем из 'astro/zod' (не из 'astro:content' — там реэкспорт z
// помечен @deprecated). Той же зод-зависимости astro, без новых пакетов.
import { z } from 'astro/zod';

// Строгая схема кейса. Общая для обеих локалей; локаль задается суффиксом
// файла в едином каталоге content/cases: <slug>-ru.mdx / <slug>-en.mdx.
const caseSchema = z.object({
  title: z.string(),
  description: z.string(),
  meta: z.string().optional(),
  subtitle: z.string().optional(),
  date: z.coerce.date(),
  order: z.number(),
  cover: z.string().optional(),
});

// Английские кейсы: ./src/content/cases/*-en.mdx
const casesEn = defineCollection({
  loader: glob({ pattern: '*-en.mdx', base: './src/content/cases' }),
  schema: caseSchema,
});

// Русские кейсы: ./src/content/cases/*-ru.mdx
const casesRu = defineCollection({
  loader: glob({ pattern: '*-ru.mdx', base: './src/content/cases' }),
  schema: caseSchema,
});

export const collections = {
  'cases-en': casesEn,
  'cases-ru': casesRu,
};
