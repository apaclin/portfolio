// Съёмка кадров для сцены «Debug for AI» из ЖИВОГО плагина.
//
//   node scripts/capture-monoscript-frames.mjs [путь до my-scripter]
//
// Зачем скрипт, а не скриншоты руками: сцена показывает продукт, и кадры должны
// быть настоящим UI, а не перерисовкой. Здесь поднимается тот же ui.html, что
// уходит в Figma, к нему подставляется стаб-песочница (в браузере настоящей
// песочницы нет) и режиссёр, который проходит сценарий: выбрать скрипт →
// запустить → получить ошибку → нажать Debug for AI.
//
// Ошибка в стабе — единственное, что здесь поставлено. В харнессе из репозитория
// плагина скрипт всегда завершается успехом, а нам нужен провал. Сообщение
// собрано по контракту `script-error` из src/shared/messages.ts, со стеком в том
// же формате `script:<id>.js:line:col`, который парсит parseErrorLocation в
// src/code.ts, — так UI строит репорт ровно теми же путями, что в проде.
// Сам текст репорта не сочиняется: его собирает buildAiDebugMarkdown внутри
// плагина, а мы просто перехватываем то, что улетело бы в буфер обмена.
//
// Ховер снимается НАСТОЯЩЕЙ мышью через CDP: `:hover` не срабатывает от
// синтетических событий, а без него кнопка под курсором в сцене выглядела бы
// мёртвой. Кадры ховера — не целые окна, а вырезки нужного места (кнопка Run,
// строка консоли), они кладутся в сцене поверх основного кадра: так на каждое
// состояние уходят килобайты вместо ещё одного мегабайтного скриншота.
//
// На выходе:
//   src/assets/images/cases/monoscript/scene-*.png   кадры @2x
//   src/assets/images/cases/monoscript/hover-*.png   вырезки ховера @2x
//   src/content/data/monoscript/scene.ts             репорт + геометрия
//
// Геометрия тоже снимается с живого DOM: курсор в сцене должен целиться в
// настоящие кнопки, а не в координаты, подогнанные на глаз.

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = resolve(
  process.argv[2] ?? '/Users/alexpaclin/Documents/Code/my-scripter',
);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4599;
const DEBUG_PORT = 9333;

/** Размер окна плагина — `figma.showUI` в src/code.ts. */
const FRAME = { width: 940, height: 640 };
/** Кадры снимаются @2x: сцена показывает окно 1:1, на retina нужен двойной. */
const SCALE = 2;

const SCRIPT_ID = 's-label';

// Сценарий: типичная ошибка Figma-скриптинга — текст создан, шрифт не загружен.
// Узнаваемая настолько, что дизайнер читает её с полувзгляда.
const SCRIPT_SOURCE = `// Labels every selected layer with its own name.
const nodes = figma.currentPage.selection;
console.log("Selection:", nodes.length);

for (const node of nodes) {
  const label = figma.createText();
  label.characters = node.name;
  label.x = node.x;
  label.y = node.y - 24;
  figma.currentPage.appendChild(label);
}

console.log(\`Labelled \${nodes.length} nodes\`);
`;

// Строка 7, колонка 9 — `label.characters` в исходнике выше.
const RUNTIME_ERROR = {
  name: 'Error',
  message:
    'in set_characters: Cannot write to node with unloaded font "Inter Regular"',
  stack: [
    'Error: in set_characters: Cannot write to node with unloaded font "Inter Regular"',
    '    at Object.set [as characters] (<anonymous>)',
    `    at script:${SCRIPT_ID}.js:7:9`,
    '    at eval (<anonymous>)',
    '    at runScript (<anonymous>)',
  ].join('\n'),
};

const now = 1700000000000;
const script = (id, name, folderId = null, extra = {}) => ({
  kind: 'script', id, name, folderId, createdAt: now, updatedAt: now, ...extra,
});

// Библиотека повторяет вариант `demo` из харнесса плагина: в кейсе выше стоит
// то же живое превью, и сайдбар в сцене должен совпадать с ним.
const LIBRARY = {
  version: 2,
  nodes: [
    { kind: 'folder', id: 'f-1', name: 'Icon manipulations', createdAt: now, updatedAt: now, collapsed: false },
    script('s-1', 'export-icons', 'f-1'),
    script(SCRIPT_ID, 'label', 'f-1'),
    script('s-3', 'rename-batch', 'f-1'),
    script('s-4', 'audit-spacing'),
    script('s-5', 'swap-instances'),
    script('d-1', 'hello-world', null, { isDefault: true }),
    script('d-2', 'selection-info', null, { isDefault: true }),
    script('d-3', 'rename-batch', null, { isDefault: true }),
  ],
};

const FILLER = `// Placeholder body for the demo library.
console.log("Hello from", figma.currentPage.name);
`;

const stubScript = `
<script>
(function () {
  // Харнесс рассчитан на верхнее окно: UI шлёт в \`parent\`, стаб слушает своё же
  // окно (см. bridge.ts). Под съёмкой страница верхняя, но шим держим — скрипт
  // должен работать и когда кадры снимают внутри чужого фрейма.
  if (window.parent !== window) { try { window.parent = window; } catch (e) {} }

  var library = ${JSON.stringify(LIBRARY)};
  var sources = ${JSON.stringify(
    Object.fromEntries(
      LIBRARY.nodes
        .filter((n) => n.kind === 'script')
        .map((n) => [n.id, n.id === SCRIPT_ID ? SCRIPT_SOURCE : FILLER]),
    ),
  )};
  var err = ${JSON.stringify(RUNTIME_ERROR)};

  function post(msg) { window.postMessage({ pluginMessage: msg, __fromStub: true }, '*'); }

  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.__fromStub || !d.pluginMessage) return;
    var m = d.pluginMessage;
    if (m.type === 'ui-ready') { post({ type: 'env', mode: 'prod' }); post({ type: 'library', library: library }); }
    else if (m.type === 'library-save') { library = m.library; }
    else if (m.type === 'source-get') { post({ type: 'source', id: m.id, source: sources[m.id] == null ? '' : sources[m.id] }); }
    else if (m.type === 'source-set') { sources[m.id] = m.source; post({ type: 'source-set-ack', id: m.id }); }
    else if (m.type === 'source-delete') { m.ids.forEach(function (i) { delete sources[i]; }); post({ type: 'source-delete-ack', ids: m.ids }); }
    else if (m.type === 'run-script') {
      post({ type: 'script-started', scriptId: m.scriptId, runId: m.runId, ts: Date.now() });
      post({ type: 'log', level: 'log', args: ['Selection:', 3], runId: m.runId, ts: Date.now() });
      // Провал вместо script-finished — ровно то, что шлёт code.ts из catch.
      post({
        type: 'script-error', scriptId: m.scriptId, runId: m.runId,
        name: err.name, message: err.message, stack: err.stack,
        location: { line: 7, column: 9 },
      });
    }
  });

  // Буфер обмена в headless недоступен, а текст репорта нужен целиком, поэтому
  // перехватываем запись. Репорт собирает сам плагин (buildAiDebugMarkdown).
  try {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: function (text) { window.__storyReport = text; return Promise.resolve(); } },
    });
  } catch (e) {}

  var deadline = function (ms) { return Date.now() + ms; };
  function until(test, ms) {
    var end = deadline(ms == null ? 15000 : ms);
    return new Promise(function (done, fail) {
      (function tick() {
        var hit;
        try { hit = test(); } catch (e) { hit = null; }
        if (hit) return done(hit);
        if (Date.now() > end) return fail(new Error('timeout: ' + test));
        setTimeout(tick, 60);
      })();
    });
  }
  function settle(frames) {
    return new Promise(function (done) {
      var left = frames || 6;
      (function tick() { left -= 1; left <= 0 ? setTimeout(done, 120) : requestAnimationFrame(tick); })();
    });
  }
  var q = function (sel) { return document.querySelector(sel); };
  var byText = function (sel, text) {
    return Array.prototype.find.call(document.querySelectorAll(sel), function (el) {
      return (el.textContent || '').trim().indexOf(text) === 0;
    });
  };

  window.__story = {
    // Открыть скрипт: строка в сайдбаре → редактор с исходником.
    idle: async function () {
      var row = await until(function () { return q('.row[data-node-id="${SCRIPT_ID}"]'); });
      row.click();
      await until(function () {
        var ed = q('.monaco-editor');
        return ed && ed.textContent.indexOf('figma.createText') >= 0;
      });
      await settle(20);
      return true;
    },
    run: async function () {
      var run = q('.toolbar__actions .btn--solid');
      if (!run) throw new Error('no Run button');
      run.click();
      // Уровень 'error' рендерится как log--err (levelToClass в Console.tsx).
      await until(function () { return q('.log--err'); });
      await settle(12);
      return true;
    },
    // Клик по Debug for AI делает НАСТОЯЩАЯ мышь (см. capture-скрипт): только
    // так вместе с нажатием остаётся ховер, ради которого всё и снимается.
    awaitCopied: async function () {
      await until(function () { return byText('.console__actions .btn-subtle', 'Log copied'); });
      await settle(8);
      return window.__storyReport || null;
    },
    // Геометрия для курсора в сцене — читается из настоящего DOM.
    geometry: function () {
      var box = function (el) {
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x), y: Math.round(r.y),
          width: Math.round(r.width), height: Math.round(r.height),
        };
      };
      return {
        run: box(q('.toolbar__actions .btn--solid')),
        consoleBar: box(q('.console__bar')),
        debug: box(byText('.console__actions .btn-subtle', 'Log copied')
          || byText('.console__actions .btn-subtle', 'Debug for AI')),
        console: box(q('.console')),
        editor: box(q('.editor-pane') || q('.monaco-editor')),
        sidebar: box(q('.sidebar')),
      };
    },
  };
})();
</script>
`;

// ---------------------------------------------------------------------------
// Минимальный CDP-клиент: Chrome запускается с отладочным портом, дальше всё
// через WebSocket (в Node 24 он встроенный, зависимостей не нужно).
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connectCdp(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let id = 0;

  await new Promise((done, fail) => {
    socket.addEventListener('open', done, { once: true });
    socket.addEventListener('error', () => fail(new Error('CDP socket error')), { once: true });
  });

  socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    const slot = pending.get(msg.id);
    if (!slot) return;
    pending.delete(msg.id);
    msg.error ? slot.fail(new Error(msg.error.message)) : slot.done(msg.result);
  });

  return {
    send(method, params = {}) {
      id += 1;
      const messageId = id;
      return new Promise((done, fail) => {
        pending.set(messageId, { done, fail });
        socket.send(JSON.stringify({ id: messageId, method, params }));
      });
    },
    close: () => socket.close(),
  };
}

async function evaluate(cdp, expression) {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  }
  return result.value;
}

// ---------------------------------------------------------------------------

const uiHtml = await readFile(resolve(pluginRoot, 'dist/ui.html'), 'utf8');
if (!uiHtml.includes('window.__FIGMA_TYPINGS__')) {
  throw new Error(
    `${pluginRoot}/dist/ui.html не похож на сборку плагина. Соберите: npm run build:prod`,
  );
}
const bodyTag = uiHtml.match(/<body[^>]*>/);
const at = bodyTag.index + bodyTag[0].length;
const storyHtml = uiHtml.slice(0, at) + stubScript + uiHtml.slice(at);

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(storyHtml);
}).listen(PORT);
await new Promise((done) => server.once('listening', done));

const userDataDir = resolve(tmpdir(), `monoscript-capture-${process.pid}`);
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${userDataDir}`,
  `--window-size=${FRAME.width},${FRAME.height}`,
  '--force-device-scale-factor=1',
  '--hide-scrollbars',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `http://localhost:${PORT}/`,
], { stdio: 'ignore' });

const framesDir = resolve(projectRoot, 'src/assets/images/cases/monoscript');
const dataDir = resolve(projectRoot, 'src/content/data/monoscript');
await mkdir(framesDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

try {
  // Ждём, пока Chrome поднимет отладочный порт и отдаст цель страницы.
  let target = null;
  for (let attempt = 0; attempt < 60 && !target; attempt += 1) {
    await sleep(250);
    try {
      const list = await fetch(`http://localhost:${DEBUG_PORT}/json/list`).then((r) => r.json());
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    } catch { /* порт ещё не открыт */ }
  }
  if (!target) throw new Error('Chrome не отдал отладочную цель');

  const cdp = await connectCdp(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // Вьюпорт задаём эмуляцией, а не --window-size: окно включает системную
  // обвязку, и UI получал 940×553 вместо 940×640 — кадр с пустой полосой внизу.
  // deviceScaleFactor даёт retina-плотность, поэтому clip идёт со scale 1.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: FRAME.width,
    height: FRAME.height,
    deviceScaleFactor: SCALE,
    mobile: false,
  });

  const shot = async (name, clip) => {
    const box = clip ?? { x: 0, y: 0, width: FRAME.width, height: FRAME.height };
    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      clip: { ...box, scale: 1 },
    });
    await writeFile(resolve(framesDir, `${name}.png`), Buffer.from(data, 'base64'));
    console.log(`  ${name}.png  ${box.width}×${box.height}`);
  };

  const mouseTo = async (x, y) => {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });
    await sleep(260);
  };
  const clickAt = async (x, y) => {
    const base = { x, y, button: 'left', clickCount: 1 };
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base });
  };

  // Инертная точка тулбара: ни кнопки, ни поля имени — курсор паркуется сюда,
  // чтобы «чистые» кадры снимались без единого наведения.
  const PARK = { x: 500, y: 20 };
  const center = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  // Вырезка идёт с запасом: ховер Run — это brightness на самой кнопке, но
  // запас прячет шов от возможного сглаживания по краю.
  const pad = (box, by = 5) => ({
    x: Math.max(0, box.x - by),
    y: Math.max(0, box.y - by),
    width: Math.min(FRAME.width, box.width + by * 2),
    height: Math.min(FRAME.height, box.height + by * 2),
  });

  await evaluate(cdp, 'window.__story.idle()');
  const geometryBefore = JSON.parse(await evaluate(cdp, 'JSON.stringify(window.__story.geometry())'));

  await mouseTo(PARK.x, PARK.y);
  await shot('scene-idle');

  const runBox = pad(geometryBefore.run);
  await mouseTo(...Object.values(center(geometryBefore.run)));
  await shot('hover-run', runBox);

  await mouseTo(PARK.x, PARK.y);
  await evaluate(cdp, 'window.__story.run()');
  await shot('scene-error');

  // Строка консоли вырезается целиком, а не одна кнопка: «Log copied» короче,
  // чем «Debug for AI», и соседняя кнопка от этого сдвигается.
  const geometry = JSON.parse(await evaluate(cdp, 'JSON.stringify(window.__story.geometry())'));
  const barBox = pad(geometry.consoleBar, 0);
  const debugCenter = center(geometry.debug);

  await mouseTo(debugCenter.x, debugCenter.y);
  await shot('hover-debug', barBox);

  // Клик настоящей мышью — курсор остаётся на кнопке, и «Log copied» снимается
  // вместе с ховером, как это и выглядит в руках.
  await clickAt(debugCenter.x, debugCenter.y);
  const report = await evaluate(cdp, 'window.__story.awaitCopied()');
  await shot('hover-copied', barBox);

  if (!report) throw new Error('репорт Debug for AI не перехвачен');

  const data = `// СГЕНЕРИРОВАНО scripts/capture-monoscript-frames.mjs — не править руками.
//
// Репорт собран самим плагином (buildAiDebugMarkdown в src/ui/lib/ai-debug.ts),
// геометрия снята с живого DOM в момент съёмки кадров.

/** Размер окна плагина, в нём же заданы координаты ниже. */
export const frame = ${JSON.stringify(FRAME)} as const;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const geometry = ${JSON.stringify(geometry, null, 2)} satisfies Record<string, Box | null>;

/**
 * Куда сцена кладёт вырезки ховера поверх основного кадра. Координаты — в той же
 * системе, что и всё окно плагина.
 */
export const overlays = ${JSON.stringify({ run: runBox, consoleBar: barBox }, null, 2)} satisfies Record<string, Box>;

/** То, что Debug for AI кладёт в буфер обмена. */
export const report = ${JSON.stringify(report)};
`;
  await writeFile(resolve(dataDir, 'scene.ts'), data);
  console.log(`  scene.ts (репорт ${report.length} символов)`);

  cdp.close();
} finally {
  chrome.kill();
  server.close();
  // Профиль чистим уже после выхода Chrome и не роняем на этом съёмку: он ещё
  // дописывает служебные файлы, и rm на живом процессе падает с ENOTEMPTY.
  await new Promise((done) => chrome.once('exit', done));
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
