// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Нативный i18n Astro (astro:i18n), без сторонних библиотек.
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: {
      // Русский (язык по умолчанию) — без префикса в URL: «/», «/about».
      // Английский — с префиксом: «/en/», «/en/about».
      prefixDefaultLocale: false,
      // ВНИМАНИЕ: redirectToDefaultLocale здесь НЕ ставим.
      // В Astro 6 он имеет смысл только при prefixDefaultLocale: true;
      // при false он приводит к циклу редиректов.
    },
  },

  // MDX подключается как интеграция Astro.
  integrations: [mdx()],

  // Tailwind v4 подключается как Vite-плагин (официальный путь),
  // а НЕ через устаревший @astrojs/tailwind.
  vite: {
    plugins: [tailwindcss()],
  },
});
