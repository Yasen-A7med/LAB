/**
 * Checks if a string contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  if (!text) return false;
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

/**
 * Resolves the effective direction ('rtl' | 'ltr') for a given text string based on settings
 */
export function resolveTextDirection(text: string, setting: 'auto' | 'rtl' | 'ltr' = 'auto'): 'rtl' | 'ltr' {
  if (setting === 'rtl') return 'rtl';
  if (setting === 'ltr') return 'ltr';
  return containsArabic(text) ? 'rtl' : 'ltr';
}

export interface FontDefinition {
  family: string;
  name: string;
  category: 'Arabic & Latin' | 'Latin Display' | 'Serif & Formal' | 'Modern Sans';
  defaultWeight: string;
}

export const AVAILABLE_FONTS: FontDefinition[] = [
  // Arabic & Multi-language Fonts
  { family: 'Cairo', name: 'Cairo (Modern Arabic & Latin)', category: 'Arabic & Latin', defaultWeight: '700' },
  { family: 'Amiri', name: 'Amiri (Classic Arabic Calligraphy)', category: 'Arabic & Latin', defaultWeight: '700' },
  { family: 'Tajawal', name: 'Tajawal (Clean Arabic Sans)', category: 'Arabic & Latin', defaultWeight: '700' },
  { family: 'Almarai', name: 'Almarai (Formal Contemporary Arabic)', category: 'Arabic & Latin', defaultWeight: '700' },

  // Formal Certificate Latin Fonts
  { family: 'Cinzel', name: 'Cinzel (Classical Roman Elegance)', category: 'Latin Display', defaultWeight: '700' },
  { family: 'Playfair Display', name: 'Playfair Display (Luxury Serif)', category: 'Serif & Formal', defaultWeight: '700' },
  { family: 'Alex Brush', name: 'Alex Brush (Calligraphic Script)', category: 'Latin Display', defaultWeight: '400' },
  { family: 'Inter', name: 'Inter (Precision Clean)', category: 'Modern Sans', defaultWeight: '600' },
];

/**
 * Pre-loads all required fonts to ensure canvas rendering never produces glyph fallback or font-swap glitches
 */
export async function ensureFontsLoaded(fontFamilies: string[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;

  const promises: Promise<FontFace[]>[] = [];
  const uniqueFonts = Array.from(new Set(fontFamilies));

  for (const font of uniqueFonts) {
    // Attempt to load standard weights: regular and bold
    promises.push(document.fonts.load(`400 24px "${font}"`));
    promises.push(document.fonts.load(`700 24px "${font}"`));
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    console.warn('Font loading warning:', err);
  }
}
