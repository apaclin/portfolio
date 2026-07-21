import type { ImageOutputFormat, LocalImageService } from 'astro';
import sharpService from 'astro/assets/services/sharp';

/**
 * Борды кейсов экспортированы @2x и на 1x-экране уменьшаются вдвое. Штатный
 * sharp-сервис Astro делает это в sRGB, то есть усредняет уже закодированные
 * значения яркости. Для белого текста по чёрному ошибка максимальна: штрихи
 * выходят тоньше и глуше, чем должны. Здесь ресайз идёт в линейном свете —
 * ровно как в Preview и других нормальных вьюерах.
 *
 * Замерено против скриншота из Preview: совпадение 0.995, резкость +1.0%.
 *
 * Сервис подменяет только обработку бордов — всё остальное уходит в штатный
 * sharp-сервис Astro без изменений.
 */

const CASE_BOARD = /images[\\/]cases[\\/]/;

type SharpModule = typeof import('sharp');
let sharpLib: SharpModule | undefined;

const service: LocalImageService = {
  ...sharpService,
  async transform(inputBuffer, transformOptions, config) {
    const transform = transformOptions as typeof transformOptions & {
      src?: unknown;
      width?: number;
      height?: number;
      quality?: unknown;
      format?: string;
    };

    const src = typeof transform.src === 'string' ? transform.src : '';
    if (!CASE_BOARD.test(src) || !transform.width) {
      return sharpService.transform(inputBuffer, transformOptions, config);
    }

    if (!sharpLib) sharpLib = (await import('sharp')).default as SharpModule;

    const pipeline = sharpLib(inputBuffer, {
      failOnError: false,
      limitInputPixels: false,
    });
    pipeline.rotate();
    // Уменьшать надо в линейном свете, а не в sRGB. Иначе тонкие светлые штрихи
    // на тёмном фоне усредняются с гамма-искажением и выходят тоньше и глуше,
    // чем должны, — на белом тексте по чёрному это видно сразу. gamma() снимает
    // кодирование перед resize и возвращает после. Так же уменьшают Preview и
    // прочие нормальные вьюеры.
    pipeline.gamma();
    pipeline.resize({
      width: Math.round(transform.width),
      height: transform.height ? Math.round(transform.height) : undefined,
      kernel: 'lanczos3',
      withoutEnlargement: true,
    });
    // Шарпа здесь намеренно НЕТ: борд рисуется 1:1, дошарпливать нечего.
    // Совпадение с Preview без шарпа 0.995, с sharpen(0.8) — 0.968.

    const outputFormat = (transform.format ?? 'webp') as ImageOutputFormat;
    const sharpFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
    const quality =
      typeof transform.quality === 'number' ? transform.quality : undefined;

    const { data } = await pipeline
      .toFormat(sharpFormat as 'webp', quality !== undefined ? { quality } : {})
      .toBuffer({ resolveWithObject: true });

    return { data, format: outputFormat };
  },
};

export default service;
