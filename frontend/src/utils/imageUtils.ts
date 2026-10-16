export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: string | number;
}

/**
 * Transforms Cloudinary URLs to deliver responsive, auto-formatted, lightweight assets.
 * Returns the original URL unchanged if not hosted on res.cloudinary.com.
 *
 * Supports both signatures:
 * - getOptimizedImageUrl(url, width, quality)
 * - getOptimizedImageUrl(url, { width, height, quality })
 */
export function getOptimizedImageUrl(
  url?: string | null,
  widthOrOptions: number | ImageOptimizationOptions = 600,
  quality: string | number = 'auto'
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;

  // Avoid duplicate transformations
  if (url.includes('/f_auto') || url.includes('c_limit')) {
    return url;
  }

  let width = 600;
  let height: number | undefined;
  let q: string | number = quality;

  if (typeof widthOrOptions === 'object' && widthOrOptions !== null) {
    if (widthOrOptions.width !== undefined) width = widthOrOptions.width;
    if (widthOrOptions.height !== undefined) height = widthOrOptions.height;
    if (widthOrOptions.quality !== undefined) q = widthOrOptions.quality;
  } else if (typeof widthOrOptions === 'number') {
    width = widthOrOptions;
  }

  // ponytail: fast string replacement inserting Cloudinary transformations after /upload/
  const transformParts = [`f_auto`, `q_${q}`, `w_${width}`, `c_limit`];
  if (height) {
    transformParts.push(`h_${height}`);
  }
  const transform = transformParts.join(',');

  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  return url;
}
