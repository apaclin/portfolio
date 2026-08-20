// Сборка живого превью плагина Radix Colors to Variables в
// public/embeds/radix-colors-to-variables/index.html.
//
//   node scripts/build-radix-preview.mjs [путь до репозитория плагина]
//
// У плагина нет своей сборки: репозиторий — это `ui.html` (весь интерфейс со
// стилями и скриптом внутри) и `code.js` (песочница). В Figma эти два файла
// разговаривают через мост: UI шлёт `parent.postMessage`, песочница отвечает
// `figma.ui.postMessage`. На сайте песочницы нет, поэтому мы подставляем свою:
//
//   1. Шим возвращает `parent` на само окно iframe. Без него команды UI уходят
//      в страницу кейса, и интерфейс навсегда остаётся пустым — сценарий тот
//      же, что в scripts/import-monoscript-preview.mjs.
//   2. Стаб `figma` — ровно те методы, которые трогает code.js: clientStorage,
//      variables, createFrame/createRectangle, viewport, currentPage, ui.
//      Переменные создаются в памяти вкладки, а не в файле Figma, поэтому
//      логика и тексты статусов — настоящие, а последствий нет.
//   3. Сам code.js, обёрнутый в IIFE: у него и у скрипта UI есть одноимённые
//      объявления верхнего уровня, а два `const` с одним именем в глобальной
//      лексической области — SyntaxError.
//
// Всё это вставляется сразу после <body>, до скрипта UI: последней строкой тот
// шлёт `ready`, и к этому моменту стаб уже должен слушать окно.
//
// Высота: плагин в Figma подгоняет окно под контент (`figma.ui.resize`). Здесь
// стаб пересылает ту же высоту настоящему родителю, а Preview.astro применяет
// её к iframe — так превью держит реальную высоту интерфейса, без внутреннего
// скролла и без вранья про размер окна.
//
// Шрифт: в Figma плагин тянет Space Grotesk с Google Fonts (это разрешено его
// манifest.json). На сайте такой запрос — единственный сторонний на всей
// странице кейса, поэтому ссылки на fonts.googleapis/gstatic вырезаются, а на их
// место встаёт @font-face с latin-подмножеством, вшитым base64
// (scripts/assets/space-grotesk-latin-var.woff2, вариативный 300–700 — тех же
// начертаний 400/500/700, что использует интерфейс). После склейки файл
// проверяется на остатки внешних ссылок: превью обязано открываться без сети.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(
  process.argv[2] ?? '/Users/alexpaclin/Code/radix-variables-to-colors',
);
const target = resolve(
  projectRoot,
  'public/embeds/radix-colors-to-variables/index.html',
);

const ui = await readFile(join(sourceRoot, 'ui.html'), 'utf8');
const code = await readFile(join(sourceRoot, 'code.js'), 'utf8');
const font = await readFile(
  resolve(projectRoot, 'scripts/assets/space-grotesk-latin-var.woff2'),
);

if (!ui.includes('pluginMessage')) {
  throw new Error(`${sourceRoot}/ui.html не похож на UI плагина Figma`);
}
if (!code.includes('figma.showUI')) {
  throw new Error(`${sourceRoot}/code.js не похож на песочницу плагина Figma`);
}

const SHIM = `<script>
  /* Вставлено scripts/build-radix-preview.mjs — см. комментарий там. */
  (function () {
    window.__radixRealParent = window.parent;
    if (window.parent === window) return;
    try { window.parent = window; } catch (e) { /* пробуем ниже */ }
    if (window.parent !== window) {
      try {
        Object.defineProperty(window, 'parent', { get: function () { return window; } });
      } catch (e) { /* не вышло — стаб не ответит, превью останется пустым */ }
    }
  })();
</script>
<script>
  /* Стаб песочницы Figma: только то, что вызывает code.js. */
  (function () {
    var seq = 0;
    function nextId(prefix) { seq += 1; return prefix + ':' + seq; }

    var storage = {};
    var collections = [];
    var variables = [];

    function makeNode(type) {
      return {
        type: type,
        id: nextId(type),
        name: '',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fills: [],
        children: [],
        clipsContent: false,
        cornerRadius: 0,
        cornerSmoothing: 0,
        resize: function (width, height) { this.width = width; this.height = height; },
        appendChild: function (child) { this.children.push(child); },
        setExplicitVariableModeForCollection: function () {},
        remove: function () {}
      };
    }

    function makeCollection(name) {
      var collection = {
        id: nextId('collection'),
        name: name,
        modes: [{ modeId: nextId('mode'), name: 'Mode 1' }],
        renameMode: function (modeId, modeName) {
          for (var i = 0; i < this.modes.length; i += 1) {
            if (this.modes[i].modeId === modeId) { this.modes[i].name = modeName; }
          }
        },
        addMode: function (modeName) {
          var modeId = nextId('mode');
          this.modes.push({ modeId: modeId, name: modeName });
          return modeId;
        }
      };
      collections.push(collection);
      return collection;
    }

    var uiHandler = null;

    var figma = {
      showUI: function () {},
      ui: {
        get onmessage() { return uiHandler; },
        set onmessage(handler) { uiHandler = handler; },
        postMessage: function (message) {
          window.postMessage({ pluginMessage: message, __radixToUi: true }, '*');
        },
        resize: function (width, height) {
          var realParent = window.__radixRealParent;
          if (realParent && realParent !== window) {
            realParent.postMessage({ type: 'radix-preview-resize', height: height }, '*');
          }
        }
      },
      clientStorage: {
        getAsync: function (key) { return Promise.resolve(storage[key]); },
        setAsync: function (key, value) { storage[key] = value; return Promise.resolve(); }
      },
      variables: {
        createVariableCollection: function (name) { return makeCollection(name); },
        getLocalVariableCollectionsAsync: function () { return Promise.resolve(collections.slice()); },
        getLocalVariablesAsync: function (type) {
          return Promise.resolve(variables.filter(function (variable) {
            return !type || variable.resolvedType === type;
          }));
        },
        createVariable: function (name, collection, type) {
          var variable = {
            id: nextId('variable'),
            name: name,
            resolvedType: type,
            variableCollectionId: collection.id,
            valuesByMode: {},
            setValueForMode: function (modeId, value) { this.valuesByMode[modeId] = value; }
          };
          variables.push(variable);
          return variable;
        },
        setBoundVariableForPaint: function (paint, field, variable) {
          var bound = { color: paint.color, type: paint.type, opacity: paint.opacity };
          bound.boundVariables = {};
          bound.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id };
          return bound;
        }
      },
      createFrame: function () { return makeNode('FRAME'); },
      createRectangle: function () { return makeNode('RECTANGLE'); },
      currentPage: { selection: [], appendChild: function () {} },
      viewport: { center: { x: 0, y: 0 }, scrollAndZoomIntoView: function () {} }
    };

    window.figma = figma;
    window.__html__ = '';

    window.addEventListener('message', function (event) {
      var data = event.data;
      /* Свои же ответы UI прилетают обратно в это окно — их песочница не ест. */
      if (!data || data.__radixToUi || !data.pluginMessage) return;
      if (typeof uiHandler === 'function') { uiHandler(data.pluginMessage); }
    });
  })();
</script>
<script>
  /* code.js плагина без изменений, в IIFE — см. комментарий в build-radix-preview.mjs. */
  (function () {
${code}
  })();
</script>
`;

// unicode-range тот же, что отдаёт Google для latin-подмножества: всё, что вне
// него (например, кириллица в чужом CSS), честно уходит в системный гротеск,
// а не рисуется отсутствующими глифами.
const FONT_CSS = `<style>
  /* Вставлено scripts/build-radix-preview.mjs: Space Grotesk, latin, base64. */
  @font-face {
    font-family: 'Space Grotesk';
    font-style: normal;
    font-weight: 300 700;
    font-display: swap;
    src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
</style>
`;

const anchor = ui.match(/<body[^>]*>/);
if (!anchor) throw new Error(`${sourceRoot}/ui.html: не найден <body>`);

const headEnd = ui.indexOf('</head>');
if (headEnd === -1) throw new Error(`${sourceRoot}/ui.html: не найден </head>`);

const at = anchor.index + anchor[0].length;
const html = (
  ui.slice(0, headEnd) +
  FONT_CSS +
  ui.slice(headEnd, at) +
  '\n' +
  SHIM +
  ui.slice(at)
).replace(/[ \t]*<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?/g, '');

// Ищем именно загрузки (src/href/url()), а не любое упоминание адреса: в
// code.js есть комментарий со ссылкой на исходники Radix, и он ничего не грузит.
const leftovers = html.match(
  /(?:\b(?:src|href)\s*=\s*["']|url\(\s*["']?)https?:\/\/[^\s"')<>]+/g,
);
if (leftovers) {
  throw new Error(
    `в превью остались внешние загрузки, оно должно открываться без сети: ${[...new Set(leftovers)].join(', ')}`,
  );
}

await mkdir(dirname(target), { recursive: true });
await writeFile(target, html);

const kb = (html.length / 1024).toFixed(0);
console.log(
  `public/embeds/radix-colors-to-variables/index.html записан (${kb} KB)`,
);
