import JSZip from 'jszip';
import type { MediaAttachment, ChatSession } from './types';
import { parseWhatsAppChat, getMediaTypeFromFilename, cleanUnicode } from './parser';

/**
 * Return accurate MIME type for a given filename
 */
export function getMimeType(fileName: string): string {
  const ext = cleanUnicode(fileName).split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'opus':
      return 'audio/ogg; codecs=opus';
    case 'ogg':
      return 'audio/ogg';
    case 'mp3':
      return 'audio/mpeg';
    case 'm4a':
      return 'audio/mp4';
    case 'aac':
      return 'audio/aac';
    case 'wav':
      return 'audio/wav';
    case 'amr':
      return 'audio/amr';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Revoke Blob URLs created for media attachments to prevent memory leaks
 */
export function revokeMediaUrls(mediaMap: Record<string, MediaAttachment>): void {
  const seenUrls = new Set<string>();
  Object.values(mediaMap).forEach((media) => {
    if (media.blobUrl && media.blobUrl.startsWith('blob:') && !seenUrls.has(media.blobUrl)) {
      seenUrls.add(media.blobUrl);
      try {
        URL.revokeObjectURL(media.blobUrl);
      } catch (err) {
        console.warn('Failed to revoke blob URL:', err);
      }
    }
  });
}

export interface ProgressCallback {
  (progress: { percent: number; statusText: string }): void;
}

/**
 * Process a WhatsApp Export ZIP or TXT File / Blob / ArrayBuffer
 */
export async function processWhatsAppFile(
  fileOrBlob: File | Blob,
  fileName: string = 'WhatsApp Chat',
  onProgress?: ProgressCallback
): Promise<ChatSession> {
  const isZip = fileName.toLowerCase().endsWith('.zip') || fileOrBlob.type.includes('zip');

  if (!isZip) {
    // Direct TXT file upload
    if (onProgress) onProgress({ percent: 50, statusText: 'Reading text file...' });
    const rawText = await fileOrBlob.text();
    if (onProgress) onProgress({ percent: 100, statusText: 'Parsing chat transcript...' });
    return parseWhatsAppChat(rawText, fileName, {});
  }

  // ZIP processing
  if (onProgress) onProgress({ percent: 10, statusText: 'Decompressing ZIP archive...' });
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(fileOrBlob);

  const mediaMap: Record<string, MediaAttachment> = {};
  let chatTxtContent = '';
  let chatTxtName = '';

  const entries = Object.values(loadedZip.files).filter(f => !f.dir && !f.name.startsWith('__MACOSX'));
  const totalEntries = entries.length;

  if (onProgress) onProgress({ percent: 25, statusText: `Extracting ${totalEntries} files...` });

  // 1. Locate primary chat text file
  // Priority: _chat.txt, WhatsApp Chat with *.txt, دردشة *.txt, or any .txt
  const txtFiles = entries.filter(f => cleanUnicode(f.name).toLowerCase().endsWith('.txt'));
  const primaryTxt = txtFiles.find(f => cleanUnicode(f.name).toLowerCase() === '_chat.txt') ||
                     txtFiles.find(f => cleanUnicode(f.name).toLowerCase().includes('whatsapp chat')) ||
                     txtFiles.find(f => cleanUnicode(f.name).includes('دردشة')) ||
                     txtFiles[0];

  if (!primaryTxt) {
    throw new Error('No WhatsApp chat transcript (.txt file) found inside the uploaded ZIP archive.');
  }

  chatTxtContent = await primaryTxt.async('text');
  chatTxtName = primaryTxt.name;

  // 2. Extract media files into memory Blob URLs
  let processedCount = 0;
  for (const entry of entries) {
    processedCount++;
    const entryName = entry.name.split('/').pop() || entry.name;
    if (entry === primaryTxt) continue;

    const cleanName = cleanUnicode(entryName);
    let decodedName = entryName;
    try {
      decodedName = decodeURIComponent(entryName);
    } catch {}

    const mediaType = getMediaTypeFromFilename(entryName);
    const mimeType = getMimeType(entryName);

    try {
      const blob = await entry.async('blob');
      const typedBlob = new Blob([blob], { type: mimeType });
      const blobUrl = URL.createObjectURL(typedBlob);

      const attachment: MediaAttachment = {
        fileName: cleanName,
        blobUrl,
        mediaType,
        size: blob.size,
        mimeType,
      };

      mediaMap[entryName] = attachment;
      mediaMap[cleanName] = attachment;
      mediaMap[decodedName] = attachment;
    } catch (err) {
      console.warn(`Failed to extract media entry: ${entryName}`, err);
    }

    if (onProgress && processedCount % 5 === 0) {
      const percent = Math.min(90, 25 + Math.floor((processedCount / totalEntries) * 65));
      onProgress({ percent, statusText: `Extracted ${processedCount}/${totalEntries} items...` });
    }
  }

  if (onProgress) onProgress({ percent: 95, statusText: 'Structuring conversation...' });

  const session = parseWhatsAppChat(chatTxtContent, chatTxtName || fileName, mediaMap);
  if (onProgress) onProgress({ percent: 100, statusText: 'Ready!' });

  return session;
}
