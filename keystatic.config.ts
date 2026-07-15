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
      description: fields.text({
        label: 'Description',
        multiline: true,
        validation: { isRequired: true },
      }),
      meta: fields.text({ label: 'Meta', multiline: true }),
      subtitle: fields.text({ label: 'Subtitle', multiline: true }),
      cardTitle: fields.text({
        label: 'Card title',
        description: 'Short brand name shown on the projects-page card.',
      }),
      cardSubtitle: fields.text({
        label: 'Card subtitle',
        description: 'One-line tagline shown under the card title.',
      }),
      date: fields.date({
        label: 'Date',
        validation: { isRequired: true },
      }),
      order: fields.integer({
        label: 'Order',
        defaultValue: 1,
        validation: { isRequired: true },
      }),
      cover: fields.image({
        label: 'Cover',
        directory: 'src/assets/images/project-covers',
        publicPath: '/src/assets/images/project-covers/',
        validation: { isRequired: true },
      }),
      fallbackAllowed: fields.checkbox({
        label: 'Allow locale fallback',
        description: 'Publish this case in the other locale until its translation is ready.',
        defaultValue: false,
      }),
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
    casesEn: caseCollection('Cases — English', 'src/content/cases-en/*'),
    casesRu: caseCollection('Кейсы — Русский', 'src/content/cases-ru/*'),
  },
});
