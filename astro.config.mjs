// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { defaultLocale, locales } from './src/lib/i18n.ts';
import rehypeNoHangingWords from './src/lib/rehypeNoHangingWords.ts';
import rehypeCaseHeadingIds from './src/lib/rehypeCaseHeadingIds.ts';

// Keystatic-админка — это серверные роуты (React-приложение + local API).
// Чтобы прод-сборка оставалась ЧИСТЫМ SSG (без адаптера и без React в бандле
// сайта), подключаем Keystatic и React ТОЛЬКО в dev (`astro dev`). В `build`
// и `check` они исключаются → статика не меняется, Lighthouse не страдает.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://alexpaclin.com',
  prefetch: false,

  // Нативный i18n Astro (astro:i18n), без сторонних библиотек.
  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      // English (default language) is unprefixed: "/", "/about".
      // Russian keeps the explicit prefix: "/ru/", "/ru/about".
      prefixDefaultLocale: false,
      // ВНИМАНИЕ: redirectToDefaultLocale здесь НЕ ставим.
      // В Astro 6 он имеет смысл только при prefixDefaultLocale: true;
      // при false он приводит к циклу редиректов.
    },
  },

  // Типографика заголовков: предлоги и союзы не висят в конце строки.
  // Якоря разделов кейса: короткие, латиницей, одинаковые в en и ru —
  // см. docs/case-section-anchors.md.
  // MDX наследует markdown-конфиг, поэтому плагины достаточно объявить здесь.
  // Плагины идут через unified({...}): markdown.rehypePlugins устарели.
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeNoHangingWords, rehypeCaseHeadingIds],
    }),
  },

  // MDX подключается как интеграция Astro.
  // Keystatic + React — только в dev (см. isDev выше).
  integrations: [mdx(), ...(isDev ? [react(), keystatic()] : [])],

  // Обёртка над штатным sharp-сервисом: уменьшает борды кейсов в линейном
  // свете. Остальные картинки идут по стандартному пути.
  image: {
    service: { entrypoint: './src/lib/caseImageService.ts' },
  },

  // Tailwind v4 подключается как Vite-плагин (официальный путь),
  // а НЕ через устаревший @astrojs/tailwind.
  vite: {
    plugins: [tailwindcss()],
  },
});
