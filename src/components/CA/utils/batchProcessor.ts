import JSZip from 'jszip';
import type { CertificateElement, BatchProgress, ExportFormat } from '../types';
import { renderCertificateToBlob } from './certificateRenderer';
import { clearImageCache } from './googleDriveParser';

export interface BatchProcessingOptions {
  templateImage: HTMLImageElement;
  elements: CertificateElement[];
  rows: Record<string, string>[];
  nameColumnLetter?: string; // Column used for naming file, e.g. 'A' or 'B'
  format?: ExportFormat;
  quality?: number;
  scale?: number;
  chunkSize?: number; // Concurrency batch size (default: 5)
  onProgress: (progress: BatchProgress) => void;
}

export interface BatchController {
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

/**
 * Sanitizes a filename string for safe cross-platform saving
 */
function sanitizeFileName(name: string): string {
  if (!name) return '';
  return name.replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim();
}

/**
 * Executes high-performance, memory-safe batch certificate generation
 */
export function startBatchGeneration(
  options: BatchProcessingOptions
): { controller: BatchController; promise: Promise<Blob> } {
  let isCancelled = false;
  let isPaused = false;
  let pauseResolver: (() => void) | null = null;

  const controller: BatchController = {
    cancel: () => {
      isCancelled = true;
      if (pauseResolver) {
        pauseResolver();
        pauseResolver = null;
      }
    },
    pause: () => {
      isPaused = true;
    },
    resume: () => {
      if (isPaused) {
        isPaused = false;
        if (pauseResolver) {
          pauseResolver();
          pauseResolver = null;
        }
      }
    },
  };

  const promise = (async (): Promise<Blob> => {
    const {
      templateImage,
      elements,
      rows,
      nameColumnLetter,
      format = 'png',
      quality = 0.95,
      scale = 1,
      chunkSize = 5,
      onProgress,
    } = options;

    const zip = new JSZip();
    const total = rows.length;
    const errors: Array<{ rowIndex: number; error: string; details?: string }> = [];

    let current = 0;
    let lastPreviewUrl: string | null = null;
    const startTime = performance.now();

    const progressState: BatchProgress = {
      isGenerating: true,
      isPaused: false,
      total,
      current: 0,
      percentage: 0,
      speed: 0,
      etaSeconds: 0,
      currentPreviewUrl: null,
      errors: [],
      zipBlob: null,
      zipSize: 0,
    };

    // Process rows in chunks to prevent UI thread freezing and memory spikes
    for (let i = 0; i < total; i += chunkSize) {
      if (isCancelled) {
        throw new Error('Batch certificate generation cancelled by user.');
      }

      // Handle pause state
      if (isPaused) {
        progressState.isPaused = true;
        onProgress({ ...progressState });
        await new Promise<void>((resolve) => {
          pauseResolver = resolve;
        });
        progressState.isPaused = false;
      }

      const chunk = rows.slice(i, i + chunkSize);

      // Process items in this chunk concurrently
      await Promise.all(
        chunk.map(async (row, chunkIndex) => {
          const rowIndex = i + chunkIndex;
          try {
            const blob = await renderCertificateToBlob(templateImage, elements, row, {
              scale,
              format,
              quality,
            });

            // Construct file name: e.g. "0001_John_Doe.png"
            const rowNumber = String(rowIndex + 1).padStart(String(total).length, '0');
            let nameTag = '';
            if (nameColumnLetter && row[nameColumnLetter]) {
              nameTag = `_${sanitizeFileName(row[nameColumnLetter])}`;
            }
            const fileName = `Certificate_${rowNumber}${nameTag}.${format}`;

            // Add directly to JSZip
            zip.file(fileName, blob);

            // Update live preview with the most recent certificate
            if (chunkIndex === 0 || rowIndex === total - 1) {
              if (lastPreviewUrl) {
                URL.revokeObjectURL(lastPreviewUrl);
              }
              lastPreviewUrl = URL.createObjectURL(blob);
              progressState.currentPreviewUrl = lastPreviewUrl;
            }

            current++;
          } catch (err: any) {
            current++;
            errors.push({
              rowIndex: rowIndex + 1,
              error: err?.message || 'Rendering error',
            });
          }
        })
      );

      // Calculate performance metrics
      const elapsedSeconds = Math.max(0.1, (performance.now() - startTime) / 1000);
      const speed = Number((current / elapsedSeconds).toFixed(1));
      const remainingItems = total - current;
      const etaSeconds = speed > 0 ? Math.round(remainingItems / speed) : 0;
      const percentage = Math.round((current / total) * 100);

      progressState.current = current;
      progressState.percentage = percentage;
      progressState.speed = speed;
      progressState.etaSeconds = etaSeconds;
      progressState.errors = [...errors];

      onProgress({ ...progressState });

      // Non-blocking yield to allow browser GC and DOM render tick
      await new Promise((r) => setTimeout(r, 4));
    }

    // Free up cached image memory
    clearImageCache();

    // Package final ZIP file
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (_metadata) => {
        // Zip generation progress (99% - 100%)
        progressState.percentage = 99;
        onProgress({ ...progressState });
      }
    );

    progressState.isGenerating = false;
    progressState.percentage = 100;
    progressState.zipBlob = zipBlob;
    progressState.zipSize = zipBlob.size;

    onProgress({ ...progressState });
    return zipBlob;
  })();

  return { controller, promise };
}
