// Система данных схем-флоу. Источник истины — эти типы; данные конкретной
// схемы описываются типизированным TS-объектом в файле кейса (не редактор,
// не админка).

/** Локализованная подпись. Компонент выбирает язык на сборке по локали. */
export type Localized = { en: string; ru: string };

/** Визуальный вариант узла → маппится на токены цвета в global.css. */
export type NodeVariant = 'default' | 'active' | 'warning' | 'success';

/** Узел потока: featured-icon + подпись. */
export interface FlowNode {
  id: string;
  /** Имя inline-иконки (см. src/components/icons/Icon.astro). */
  icon: string;
  label: Localized;
  variant?: NodeVariant;
}

/** Связь между узлами. */
export interface FlowEdge {
  from: string;
  /** Один id — линейная стрелка; массив id — развилка (fork) в несколько узлов. */
  to: string | string[];
  /** Необязательная подпись над стрелкой / под группой развилки. */
  caption?: Localized;
}

/** Данные одной схемы. Одна модель и для горизонтали, и для вертикали. */
export interface FlowData {
  title?: Localized;
  /**
   * Направление потока.
   * РЕАЛИЗОВАНО: 'horizontal'.
   * БУДУЩЕЕ РАСШИРЕНИЕ: 'vertical' — тип заложен, рендер появится следующим
   * шагом Фазы 3 (см. чистый шов в FlowDiagram.astro). Не реализуем наполовину.
   */
  direction: 'horizontal' | 'vertical';
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// БУДУЩИЕ РАСШИРЕНИЯ (типы заложены расширяемо, реализация позже):
// - перенос длинного горизонтального потока на новую строку (wrap);
// - несколько связанных флоу на одной странице;
// - слияние веток после развилки (сейчас ветки fork терминальны).
