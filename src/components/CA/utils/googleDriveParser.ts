/**
 * Extracts Google Drive file ID from arbitrary Google Drive sharing links
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Format 1: /file/d/{ID}/view
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch) return fileDMatch[1];

  // Format 2: ?id={ID} or &id={ID}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch) return idParamMatch[1];

  // Format 3: /d/{ID}
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch) return dMatch[1];

  return null;
}

/**
 * Normalizes an image URL. If it's a Google Drive link, converts it to Google's high-speed CDN image URL.
 */
export function normalizeImageUrl(url: string, size = 1600): string {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim();

  const driveId = extractGoogleDriveFileId(clean);
  if (driveId) {
    // Google User Content CDN delivers high-res thumbnails with CORS headers
    return `https://lh3.googleusercontent.com/d/${driveId}=s${size}`;
  }

  return clean;
}

// In-memory cache for loaded images to avoid re-fetching the same image multiple times
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Loads an HTMLImageElement safely with crossOrigin enabled and retry mechanism
 */
export async function loadImage(url: string, maxRetries = 2): Promise<HTMLImageElement> {
  const normalized = normalizeImageUrl(url);
  if (!normalized) {
    throw new Error('Empty or invalid image URL');
  }

  if (imageCache.has(normalized)) {
    const cached = imageCache.get(normalized)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return cached;
    }
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';

        image.onload = () => resolve(image);
        image.onerror = () => {
          // If first attempt failed with CORS or format on lh3 CDN, try fallback Google thumbnail URL
          const driveId = extractGoogleDriveFileId(url);
          if (driveId && attempt === 0) {
            image.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
          } else {
            reject(new Error(`Failed to load image from URL: ${url}`));
          }
        };

        image.src = normalized;
      });

      imageCache.set(normalized, img);
      return img;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        throw err;
      }
      // Exponential backoff delay
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }

  throw new Error(`Failed to load image after ${maxRetries} retries: ${url}`);
}

/**
 * Clears the image cache to free up memory after batch processing
 */
export function clearImageCache(): void {
  imageCache.clear();
}
