# Portfolio Design System

Рабочая спецификация для сайта и схем. Основа: чистый белый Notion-like стиль, Inter, теплые нейтрали, тихие semantic colors. Значения ниже соответствуют текущим токенам в `src/styles/global.css` и текущему языку схем Matchpoint.

## Цвета

### Нейтрали

| Роль | CSS variable | Hex | Образец | Где использовать |
| --- | --- | --- | --- | --- |
| Основной фон | `--color-bg` | `#ffffff` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#ffffff;border-radius:3px;"></span> | фон страницы, фон карточек-схем |
| Тихая поверхность | `--color-bg-subtle` | `#f7f6f3` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#f7f6f3;border-radius:3px;"></span> | нейтральные узлы, code bg, вторичные панели |
| Основной текст | `--color-text` | `#37352f` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#37352f;border-radius:3px;"></span> | body, заголовки, основные линии схем |
| Вторичный текст | `--color-text-muted` | `#6b6a64` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#6b6a64;border-radius:3px;"></span> | описания, подписи внутри схем, вторичные иконки |
| Слабый текст | `--color-text-faint` | `#9a988f` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#9a988f;border-radius:3px;"></span> | мета, счетчики, неактивные элементы |
| Мягкая граница | `--color-border` | `#eae9e5` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#eae9e5;border-radius:3px;"></span> | карточки, таблицы, рамки тихих блоков |
| Сильная граница | `--color-border-strong` | `#d8d6cf` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#d8d6cf;border-radius:3px;"></span> | разделители, второстепенные линии схем |

### Семантика

Статусы оформлены как компактные растяжки `1 → 5`: `1` — самый тихий tint, `2` — рабочий фон, `3` — border, `4` — насыщенный акцент, `5` — текст/icon. Старые переменные `*-bg`, `*-border`, `*-fg` остались алиасами к шагам `2`, `3`, `5`.

| Статус | 1 / tint | 2 / bg | 3 / border | 4 / accent | 5 / fg |
| --- | --- | --- | --- | --- | --- |
| Danger | `--color-danger-1` `#fffaf9` <span style="display:inline-block;width:14px;height:14px;border:1px solid #f2c8bd;background:#fffaf9;border-radius:3px;"></span> | `--color-danger-2` `#fdf0ed` <span style="display:inline-block;width:14px;height:14px;border:1px solid #f2c8bd;background:#fdf0ed;border-radius:3px;"></span> | `--color-danger-3` `#f2c8bd` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#f2c8bd;border-radius:3px;"></span> | `--color-danger-4` `#c95d45` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#c95d45;border-radius:3px;"></span> | `--color-danger-5` `#9f341f` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#9f341f;border-radius:3px;"></span> |
| Warning | `--color-warning-1` `#fffaf0` <span style="display:inline-block;width:14px;height:14px;border:1px solid #edd6a2;background:#fffaf0;border-radius:3px;"></span> | `--color-warning-2` `#fff6dd` <span style="display:inline-block;width:14px;height:14px;border:1px solid #edd6a2;background:#fff6dd;border-radius:3px;"></span> | `--color-warning-3` `#edd6a2` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#edd6a2;border-radius:3px;"></span> | `--color-warning-4` `#b97800` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#b97800;border-radius:3px;"></span> | `--color-warning-5` `#8a5a00` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#8a5a00;border-radius:3px;"></span> |
| Success | `--color-success-1` `#f7fbf8` <span style="display:inline-block;width:14px;height:14px;border:1px solid #c6dfca;background:#f7fbf8;border-radius:3px;"></span> | `--color-success-2` `#edf7ef` <span style="display:inline-block;width:14px;height:14px;border:1px solid #c6dfca;background:#edf7ef;border-radius:3px;"></span> | `--color-success-3` `#c6dfca` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#c6dfca;border-radius:3px;"></span> | `--color-success-4` `#4f8a5f` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#4f8a5f;border-radius:3px;"></span> | `--color-success-5` `#2f6b3f` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#2f6b3f;border-radius:3px;"></span> |
| Info | `--color-info-1` `#f7fafd` <span style="display:inline-block;width:14px;height:14px;border:1px solid #c9d8ea;background:#f7fafd;border-radius:3px;"></span> | `--color-info-2` `#eef4fb` <span style="display:inline-block;width:14px;height:14px;border:1px solid #c9d8ea;background:#eef4fb;border-radius:3px;"></span> | `--color-info-3` `#c9d8ea` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#c9d8ea;border-radius:3px;"></span> | `--color-info-4` `#4f7da8` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#4f7da8;border-radius:3px;"></span> | `--color-info-5` `#315f8c` <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#315f8c;border-radius:3px;"></span> |

| Алиас | Значение |
| --- | --- |
| `--color-danger-bg` / `--color-warning-bg` / `--color-success-bg` / `--color-info-bg` | шаг `2` |
| `--color-danger-border` / `--color-warning-border` / `--color-success-border` / `--color-info-border` | шаг `3` |
| `--color-danger-fg` / `--color-warning-fg` / `--color-success-fg` / `--color-info-fg` | шаг `5` |

### Кнопки и интерактив

| Роль | CSS variable | Hex | Образец | Где использовать |
| --- | --- | --- | --- | --- |
| Primary bg | `--color-primary-bg` | `#37352f` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#37352f;border-radius:3px;"></span> | основные кнопки, CTA, темные action-pills |
| Primary hover | `--color-primary-bg-hover` | `#4a4841` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#4a4841;border-radius:3px;"></span> | hover primary |
| Primary active | `--color-primary-bg-active` | `#2f2d28` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#2f2d28;border-radius:3px;"></span> | active/pressed primary |
| Primary text | `--color-primary-fg` | `#ffffff` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#ffffff;border-radius:3px;"></span> | текст на темной кнопке |
| Accent | `--color-accent` | `var(--color-text)` / `#37352f` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #d8d6cf;background:#37352f;border-radius:3px;"></span> | ссылки, focus outline |

## Типографика

Шрифт: `Inter`, fallback: `Inter Fallback`, затем системные sans-serif.

| Элемент | Размер | Line-height | Weight | Letter spacing | Цвет |
| --- | ---: | ---: | ---: | ---: | --- |
| Case H1 | `30px` | `1.2` | `700` | `-0.02em` в prose | `--color-text` |
| H2 в статье | `22px` | `1.3` | `600` | `-0.01em` | `--color-text` |
| H3 в статье | `18px` | `1.4` | `600` | `0` | `--color-text` |
| Body | `16px` | `1.7` | `400` | `0` | `--color-text` |
| Hero subtitle | `18px` | около `1.5` | `600` | `0` | `--color-text` |
| Meta | `16px` | около `1.5` | `400-500` | `0` | `--color-text-muted` / `--color-text-faint` |
| Table text | `14px` | `1.5` | `400` | `0` | `--color-text` |
| Table header | `14px` | `1.5` | `600` | `0` | `--color-text` |
| Diagram box label | `14px` | `~21px` | `500` | `0` | по статусу |
| Diagram pill label | `10px` | `~14px` | `600` | `0.05em` | white on primary |
| Diagram captions | `12-13px` | `1.4-1.5` | `400-500` | `0` или `0.05em` для секционных labels | muted/faint |

## Layout

| Объект | Значение | Примечание |
| --- | --- | --- |
| Основная prose-колонка | `42rem` | центральная колонка статьи |
| Горизонтальный отступ страницы | `1.25rem` mobile, `2.5rem` суммарно в prose | через CSS grid |
| Inline image max-width | `60rem` | `Image`, `Diagram`, `Carousel`, `Hotspots` |
| Breakout wrapper | `w-screen`, `overflow-x-auto`, `px-4` | для широких схем |
| Annotated screen max-width | `1440px` | T-Taxi экран |
| Обычный Breakout max-width | `1100px` | дефолт `Breakout.astro` |
| Media margin сверху | `--space-media-before: 0.875rem` / `14px` | изображение ближе к предыдущему тексту |
| Media margin снизу | `--space-media-after: 2.75rem` / `44px` | следующий смысловой блок отделен сильнее |

## Таблицы

| Параметр | Значение |
| --- | --- |
| Font size | `14px` |
| Line-height | `1.5` |
| Border | `1px solid var(--color-border)` |
| Cell padding | `8px 12px` |
| Header bg | `--color-bg-subtle` |
| Header bottom border | `--color-border-strong` |

## Схемы

### Цветовые правила

| Тип элемента | Fill | Stroke | Text/Icon |
| --- | --- | --- | --- |
| Нейтральный узел | `--color-bg-subtle` / `#f7f6f3` | `--color-text` или `--color-border` | `--color-text` |
| Тихая карточка | `--color-bg` | `--color-border` | `--color-text` |
| Primary/action узел | `--color-primary-bg` | `--color-primary-bg` | `--color-primary-fg` |
| Danger узел | `--color-danger-bg` | `--color-danger-border` | `--color-danger-fg` |
| Warning узел | `--color-warning-bg` | `--color-warning-border` | `--color-warning-fg` |
| Success узел | `--color-success-bg` | `--color-success-border` | `--color-success-fg` |
| Info узел | `--color-info-bg` | `--color-info-border` | `--color-info-fg` |
| Основные коннекторы | none | `--color-text` | n/a |
| Вторичные коннекторы | none | `--color-border-strong` | n/a |

Не использовать новые локальные серые, синие, красные и желтые оттенки. Если нужен новый смысл, сначала выбрать ближайшую semantic-пару выше.

### Линии

| Элемент | Толщина | Цвет | Linecap/Linejoin | Примечание |
| --- | ---: | --- | --- | --- |
| Рамки боксов в схемах | `1.5px` | статусный border или `--color-text` | `round` | текущий основной стиль Matchpoint |
| Коннекторы/стрелки в Figma-схемах | `1.5px` | `--color-text` | `round` | лучше вписывается в сайт, чем 2px |
| Вторичные линии/разделители | `1px` | `--color-border` / `--color-border-strong` | `round` | рамки больших светлых карточек |
| Иконки outline | `2px` | `currentColor` | `round` | стиль локального `Icon.astro`, близко к Lucide |
| Точки-коннекторы | `3px stroke` | `--color-text` | n/a | маленькие круги на стыках стрелок |
| Пунктир | `1.5px`, dash `4 4` | `--color-text` | `round` | альтернативные/ветвящиеся пути |
| Подчеркивание ссылок | `1px` | `--color-accent` | n/a | в prose |

Практически: для новых схем в Figma ставь линии `1.5px`. Иконки оставляй `2px`, если они outline 24x24.

### Боксы

| Тип | Размер | Padding | Radius | Stroke | Текст |
| --- | --- | --- | ---: | --- | --- |
| Стандартный process box | `180x64px` | примерно `16px 12px` | `8px` | `1.5px` | `14px / 500`, центр |
| Короткий label/pill | высота `32px` | `12-16px` по X | `16px` | `1.5px` | `14px / 500` |
| Action pill | `260x28px` | `16px` по X | `14px` | none или `1.5px` | `10px / 600`, uppercase, `0.05em` |
| Иконка в action pill | `20x20px` | n/a | `10px` | none | white glyph |
| Flow icon tile | `48x48px` | n/a | `12px` | none | icon `22px` |
| SVG diagram card | свободно | `32-40px` внутри макета | `8px` | `1px` | зависит от схемы |
| Tooltip annotated screen | max `22rem` | `16px 24px` | `8px` | `1.5px` | `14px` |

### Spacing внутри схем

| Связка | Значение |
| --- | ---: |
| Box label до края | минимум `12px`, лучше `16px` |
| Между вертикальными process boxes | `40px` между краями при стрелке |
| Длина короткой стрелки между box | `31-32px` |
| Между action pills | `40px` по Y в текущей схеме |
| Между иконкой и текстом в action pill | `12-16px` |
| Внутренний отступ большой SVG-карточки | `40px` сверху/сбоку как базовый ритм |

## Иконки

Сейчас используются два варианта:

| Где | Набор/стиль | Параметры |
| --- | --- | --- |
| `src/components/icons/Icon.astro` | локальный набор inline SVG, геометрия 24x24, близко к Lucide | `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `round caps/joins` |
| `Lightbox`, `Carousel` | inline SVG arrows/close в стиле Lucide | `18-20px`, `stroke-width="2"`, `round caps/joins` |
| Экспортированные Figma-схемы | path-иконки, часто заливкой | держать визуально как простые 24x24 glyphs, без лишней детализации |

Для новых схем лучше брать Lucide-подобные outline-иконки 24x24 со stroke `2px`. Цвет через semantic fg или `--color-text-muted`.

## Компоненты и состояния

### Primary button

| State | Background | Text | Border |
| --- | --- | --- | --- |
| Default | `--color-primary-bg` / `#37352f` | `--color-primary-fg` / `#ffffff` | none |
| Hover | `--color-primary-bg-hover` / `#4a4841` | `#ffffff` | none |
| Active | `--color-primary-bg-active` / `#2f2d28` | `#ffffff` | none |
| Focus | same as state | same | `2px solid var(--color-accent)` outline |

### Carousel / Lightbox icons

| Элемент | Размер | Stroke | Цвет |
| --- | ---: | ---: | --- |
| Carousel arrow icon | `18px` | `2px` | `currentColor` |
| Lightbox arrow/close icon | `20px` | `2px` | `currentColor` |
| Disabled carousel arrow | opacity `0`, pointer-events none | keeps layout | no layout shift |

## Практические правила для Figma

1. Основной текст и главные линии: `#37352f`.
2. Вторичный текст и тихие иконки: `#6b6a64`.
3. Легкие рамки карточек: `#eae9e5`.
4. Более заметные, но не черные разделители: `#d8d6cf`.
5. Нейтральные узлы: `#f7f6f3`, не `black` с opacity.
6. Status-узлы всегда строить парой: bg + border + fg из одной semantic-группы.
7. Линии в схемах: `1.5px`. Иконки: `2px`.
8. Боксы: radius `8px`; action pills: radius `14px`; маленькие icon circles: radius `10px`.
9. Letter spacing обычно `0`. Исключение: короткие uppercase labels в action pills, там `0.05em`.
10. Не добавлять новые оттенки “почти серого” ради нюанса. Если нужно тише, использовать `--color-text-faint` или `--color-border`.
