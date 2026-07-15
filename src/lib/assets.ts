type ImageAssetModule = { default: ImageMetadata };

const imageAssets = import.meta.glob<ImageAssetModule>(
  '/src/assets/images/**/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

const assetCandidates = (src: string) => {
  const normalized = src.replaceAll('\\', '/');

  return [
    normalized,
    normalized.startsWith('src/') ? `/${normalized}` : undefined,
    normalized.startsWith('/assets/') ? `/src${normalized}` : undefined,
    normalized.startsWith('assets/') ? `/src/${normalized}` : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));
};

export function resolveImageAsset(
  src: ImageMetadata | string,
  consumer = 'image asset resolver',
): ImageMetadata {
  if (typeof src !== 'string') return src;

  for (const candidate of assetCandidates(src)) {
    const asset = imageAssets[candidate]?.default;
    if (asset) return asset;
  }

  throw new Error(`[${consumer}] Could not resolve image path: ${src}`);
}
