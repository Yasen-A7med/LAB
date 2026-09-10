import type { CertificateElement, TextElement, ImageElement } from '../types';
import { resolveTextDirection } from './arabicTextHelper';
import { loadImage } from './googleDriveParser';

export interface RenderCertificateOptions {
  scale?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * Draws a single certificate onto an HTMLCanvasElement
 */
export async function drawCertificateToCanvas(
  canvas: HTMLCanvasElement,
  templateImage: HTMLImageElement,
  elements: CertificateElement[],
  rowData: Record<string, string>,
  options: RenderCertificateOptions = {}
): Promise<void> {
  const scale = options.scale ?? 1;
  const canvasWidth = Math.round(templateImage.naturalWidth * scale);
  const canvasHeight = Math.round(templateImage.naturalHeight * scale);

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) {
    throw new Error('Unable to acquire 2D canvas rendering context.');
  }

  // Clear previous drawings
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw background certificate template
  ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

  // 2. Render each placeholder element in order
  for (const element of elements) {
    const elX = (element.x / 100) * canvasWidth;
    const elY = (element.y / 100) * canvasHeight;
    const elW = (element.width / 100) * canvasWidth;
    const elH = (element.height / 100) * canvasHeight;

    if (element.type === 'text') {
      renderTextElement(ctx, element as TextElement, rowData, elX, elY, elW, elH, canvasHeight);
    } else if (element.type === 'image') {
      await renderImageElement(ctx, element as ImageElement, rowData, elX, elY, elW, elH, canvasHeight);
    }
  }
}

/**
 * Renders a text element with Arabic RTL shaping, custom font scaling, and alignment
 */
function renderTextElement(
  ctx: CanvasRenderingContext2D,
  element: TextElement,
  rowData: Record<string, string>,
  elX: number,
  elY: number,
  elW: number,
  elH: number,
  canvasHeight: number
): void {
  // Extract text for this row or fallback to sampleText
  const rawText = rowData[element.columnLetter] ?? element.sampleText ?? '';
  const text = String(rawText).trim();
  if (!text) return;

  ctx.save();

  // Standardize font size relative to template height (base standard 1000px height)
  const fontSizePx = Math.max(8, Math.round((element.fontSize / 1000) * canvasHeight));
  const fontStyle = element.fontStyle === 'italic' ? 'italic ' : '';
  const fontWeight = element.fontWeight || '700';
  const fontFamily = element.fontFamily || 'Cairo';

  ctx.font = `${fontStyle}${fontWeight} ${fontSizePx}px "${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = element.color || '#000000';

  // Determine direction
  const direction = resolveTextDirection(text, element.direction);
  ctx.direction = direction;

  // Horizontal alignment & anchor
  let textX = elX;
  if (element.align === 'center') {
    textX = elX + elW / 2;
    ctx.textAlign = 'center';
  } else if (element.align === 'right') {
    textX = elX + elW;
    ctx.textAlign = 'right';
  } else {
    textX = elX;
    ctx.textAlign = 'left';
  }

  // Vertical alignment
  ctx.textBaseline = 'middle';
  const textY = elY + elH / 2;

  // Drop shadow if configured
  if (element.shadowColor && element.shadowBlur) {
    ctx.shadowColor = element.shadowColor;
    ctx.shadowBlur = (element.shadowBlur / 1000) * canvasHeight;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  }

  // Draw text
  ctx.fillText(text, textX, textY);

  ctx.restore();
}

/**
 * Renders an image element (e.g. attendee photo, badge, QR code, signature) with clipping and borders
 */
async function renderImageElement(
  ctx: CanvasRenderingContext2D,
  element: ImageElement,
  rowData: Record<string, string>,
  elX: number,
  elY: number,
  elW: number,
  elH: number,
  canvasHeight: number
): Promise<void> {
  const rawUrl = rowData[element.columnLetter] ?? element.sampleUrl ?? '';
  const imageUrl = String(rawUrl).trim();
  if (!imageUrl) return;

  try {
    const img = await loadImage(imageUrl);
    if (!img.naturalWidth || !img.naturalHeight) return;

    ctx.save();

    // Clip path for border radius (percentage from 0 to 50 for circle)
    const maxRadius = Math.min(elW, elH) / 2;
    const radiusPx = (element.borderRadius / 50) * maxRadius;

    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(elX, elY, elW, elH, radiusPx);
    } else {
      // Fallback rounded rect path
      const r = radiusPx;
      ctx.moveTo(elX + r, elY);
      ctx.lineTo(elX + elW - r, elY);
      ctx.quadraticCurveTo(elX + elW, elY, elX + elW, elY + r);
      ctx.lineTo(elX + elW, elY + elH - r);
      ctx.quadraticCurveTo(elX + elW, elY + elH, elX + elW - r, elY + elH);
      ctx.lineTo(elX + r, elY + elH);
      ctx.quadraticCurveTo(elX, elY + elH, elX, elY + elH - r);
      ctx.lineTo(elX, elY + r);
      ctx.quadraticCurveTo(elX, elY, elX + r, elY);
      ctx.closePath();
    }
    ctx.clip();

    // Calculate fit dimensions (cover vs contain)
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const targetAspect = elW / elH;

    let drawX = elX;
    let drawY = elY;
    let drawW = elW;
    let drawH = elH;

    if (element.objectFit === 'contain') {
      if (imgAspect > targetAspect) {
        drawW = elW;
        drawH = elW / imgAspect;
        drawY = elY + (elH - drawH) / 2;
      } else {
        drawH = elH;
        drawW = elH * imgAspect;
        drawX = elX + (elW - drawW) / 2;
      }
    } else {
      // 'cover'
      if (imgAspect > targetAspect) {
        drawH = elH;
        drawW = elH * imgAspect;
        drawX = elX + (elW - drawW) / 2;
      } else {
        drawW = elW;
        drawH = elW / imgAspect;
        drawY = elY + (elH - drawH) / 2;
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Draw border if configured
    if (element.borderWidth > 0 && element.borderColor) {
      ctx.restore(); // Restore to remove clip so border draws on edge
      ctx.save();
      const strokeW = Math.max(1, (element.borderWidth / 1000) * canvasHeight);
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = element.borderColor;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(elX, elY, elW, elH, radiusPx);
      } else {
        ctx.rect(elX, elY, elW, elH);
      }
      ctx.stroke();
    }

    ctx.restore();
  } catch (err) {
    console.warn(`Could not render image for column ${element.columnLetter}:`, err);
  }
}

/**
 * Generates a high-resolution Blob for a single certificate
 */
export async function renderCertificateToBlob(
  templateImage: HTMLImageElement,
  elements: CertificateElement[],
  rowData: Record<string, string>,
  options: RenderCertificateOptions = {}
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await drawCertificateToCanvas(canvas, templateImage, elements, rowData, options);

  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = options.quality ?? 0.95;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Clean up canvas
        canvas.width = 0;
        canvas.height = 0;
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob from canvas'));
        }
      },
      mimeType,
      quality
    );
  });
}
