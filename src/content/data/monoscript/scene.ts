// СГЕНЕРИРОВАНО scripts/capture-monoscript-frames.mjs — не править руками.
//
// Репорт собран самим плагином (buildAiDebugMarkdown в src/ui/lib/ai-debug.ts),
// геометрия снята с живого DOM в момент съёмки кадров.

/** Размер окна плагина, в нём же заданы координаты ниже. */
export const frame = {"width":940,"height":640} as const;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const geometry = {
  "run": {
    "x": 859,
    "y": 6,
    "width": 65,
    "height": 28
  },
  "consoleBar": {
    "x": 260,
    "y": 457,
    "width": 680,
    "height": 40
  },
  "debug": {
    "x": 709,
    "y": 465,
    "width": 100,
    "height": 24
  },
  "console": {
    "x": 260,
    "y": 456,
    "width": 680,
    "height": 184
  },
  "editor": {
    "x": 260,
    "y": 40,
    "width": 680,
    "height": 416
  },
  "sidebar": {
    "x": 0,
    "y": 0,
    "width": 260,
    "height": 640
  }
} satisfies Record<string, Box | null>;

/**
 * Куда сцена кладёт вырезки ховера поверх основного кадра. Координаты — в той же
 * системе, что и всё окно плагина.
 */
export const overlays = {
  "run": {
    "x": 854,
    "y": 1,
    "width": 75,
    "height": 38
  },
  "consoleBar": {
    "x": 260,
    "y": 457,
    "width": 680,
    "height": 40
  }
} satisfies Record<string, Box>;

/** То, что Debug for AI кладёт в буфер обмена. */
export const report = "# label\n\n**SCRIPT:**\n```typescript\n// Labels every selected layer with its own name.\nconst nodes = figma.currentPage.selection;\nconsole.log(\"Selection:\", nodes.length);\n\nfor (const node of nodes) {\n  const label = figma.createText();\n  label.characters = node.name;\n  label.x = node.x;\n  label.y = node.y - 24;\n  figma.currentPage.appendChild(label);\n}\n\nconsole.log(`Labelled ${nodes.length} nodes`);\n```\n\n**ERRORS FOUND:**\n\n- Runtime (line 7:9): **Error** — in set_characters: Cannot write to node with unloaded font \"Inter Regular\"\n  ```\n  Error: in set_characters: Cannot write to node with unloaded font \"Inter Regular\"\n      at Object.set [as characters] (<anonymous>)\n      at script:s-label.js:7:9\n      at eval (<anonymous>)\n      at runScript (<anonymous>)\n  ```\n\n**CONSOLE OUTPUT (last 30 entries):**\n```\n[log] Selection: 3\n[error] Error: in set_characters: Cannot write to node with unloaded font \"Inter Regular\"\n```";
