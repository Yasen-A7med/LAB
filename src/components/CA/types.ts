export type ElementType = 'text' | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  columnLetter: string; // e.g. 'A', 'B', 'C'
  label?: string;
  x: number; // 0 - 100% of template width
  y: number; // 0 - 100% of template height
  width: number; // 0 - 100% of template width
  height: number; // 0 - 100% of template height
}

export interface TextElement extends BaseElement {
  type: 'text';
  fontFamily: string;
  fontSize: number; // relative to canvas native height/width (standardized base)
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right';
  direction: 'auto' | 'rtl' | 'ltr';
  lineHeight: number;
  letterSpacing: number;
  shadowColor?: string;
  shadowBlur?: number;
  sampleText?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  objectFit: 'contain' | 'cover';
  borderRadius: number; // 0 = square, 50 = circle
  borderWidth: number;
  borderColor: string;
  sampleUrl?: string;
}

export type CertificateElement = TextElement | ImageElement;

export interface CertificateTemplate {
  name: string;
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface SheetColumn {
  letter: string;
  index: number;
  headerName: string;
  sampleValues: string[];
}

export interface SheetData {
  url?: string;
  fileName?: string;
  columns: SheetColumn[];
  rows: Record<string, string>[]; // Keyed by column letter: row['A'], row['B'], etc.
  totalRows: number;
}

export interface BatchProgress {
  isGenerating: boolean;
  isPaused: boolean;
  total: number;
  current: number;
  percentage: number;
  speed: number; // certs/sec
  etaSeconds: number;
  currentPreviewUrl: string | null;
  errors: Array<{ rowIndex: number; error: string; details?: string }>;
  zipBlob: Blob | null;
  zipSize: number;
}

export type ExportFormat = 'png' | 'jpeg';
