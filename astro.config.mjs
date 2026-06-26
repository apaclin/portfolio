// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// Keystatic-админка — это серверные роуты (React-приложение + local API).
// Чтобы прод-сборка оставалась ЧИСТЫМ SSG (без адаптера и без React в бандле
// сайта), подключаем Keystatic и React ТОЛЬКО в dev (`astro dev`). В `build`
// и `check` они исключаются → статика не меняется, Lighthouse не страдает.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  // Нативный i18n Astro (astro:i18n), без сторонних библиотек.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      // Английский (язык по умолчанию) — без префикса: «/», «/about».
      // Русский — с префиксом: «/ru/», «/ru/about».
      prefixDefaultLocale: false,
      // ВНИМАНИЕ: redirectToDefaultLocale здесь НЕ ставим.
      // В Astro 6 он имеет смысл только при prefixDefaultLocale: true;
      // при false он приводит к циклу редиректов.
    },
  },

  // MDX подключается как интеграция Astro.
  // Keystatic + React — только в dev (см. isDev выше).
  integrations: [mdx(), ...(isDev ? [react(), keystatic()] : [])],

  // Tailwind v4 подключается как Vite-плагин (официальный путь),
  // а НЕ через устаревший @astrojs/tailwind.
  vite: {
    plugins: [tailwindcss()],
  },
});
