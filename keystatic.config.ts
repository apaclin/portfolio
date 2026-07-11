import { config, collection, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

// Кастомные компоненты, которые можно вставлять в тело кейса прямо из админки
// (component blocks внутри fields.mdx). Схема пропсов = пропсы реального
// Astro-компонента.
const contentComponents = {
  // Блок для нашего <Image> (картинка кейса; пропсы src / alt / maxWidth).
  Image: block({
    label: 'Image',
    schema: {
      src: fields.text({
        label: 'Source',
        description: 'Путь/импорт изображения (см. примечание в keystatic.config).',
        validation: { isRequired: true },
      }),
      alt: fields.text({
        label: 'Alt text',
        validation: { isRequired: true },
      }),
      maxWidth: fields.integer({
        label: 'Logical max width (px)',
        description: 'Логическая ширина макета для лайтбокса: 1440 или 1920.',
        defaultValue: 1440,
      }),
    },
  }),

  // Архитектурный задел под будущие мультиязычные интерактивные SVG-схемы.
  // Пока минимальный (только имя/идентификатор схемы); позже сюда добавим
  // выбор зарегистрированной SVG-схемы, локаль и параметры рендера.
  UserFlowSchema: block({
    label: 'User Flow Schema',
    schema: {
      name: fields.text({
        label: 'Schema name',
        description: 'Идентификатор будущей зарегистрированной SVG-схемы.',
      }),
    },
  }),
};

// Фабрика коллекции кейса для единого каталога src/content/cases.
function caseCollection(label: string, path: `${string}/*`) {
  return collection({
    label,
    path,
    slugField: 'title', // slug = имя файла; title хранится во frontmatter
    format: { contentField: 'content' },
    entryLayout: 'content',
    schema: {
      // fields.slug кладёт читаемый title во frontmatter, а slug — в имя файла.
      title: fields.slug({ name: { label: 'Title' } }),
      description: fields.text({ label: 'Description', multiline: true }),
      date: fields.date({ label: 'Date' }),
      order: fields.integer({ label: 'Order', defaultValue: 1 }),
      // cover — опциональное поле из zod-схемы (z.string().optional()).
      cover: fields.text({ label: 'Cover (optional)' }),
      // Основной контент кейса (MDX) + кастомные component blocks.
      content: fields.mdx({
        label: 'Content',
        components: contentComponents,
      }),
    },
  });
}

export default config({
  // Local-режим: Git-based CMS поверх файлов репозитория, без облака.
  // Админка работает в dev (`astro dev` → /keystatic), правит реальные MDX.
  storage: { kind: 'local' },
  collections: {
    // Один каталог; локаль хранится в имени файла: <slug>-ru.mdx / <slug>-en.mdx.
    cases: caseCollection('Cases', 'src/content/cases/*'),
  },
});
