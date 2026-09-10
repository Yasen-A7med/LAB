import type { SheetColumn, SheetData } from '../types';

/**
 * Converts a zero-based column index to an Excel column letter (e.g. 0 -> 'A', 25 -> 'Z', 26 -> 'AA')
 */
export function indexToColumnLetter(index: number): string {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Converts an Excel column letter to a zero-based index (e.g. 'A' -> 0, 'Z' -> 25, 'AA' -> 26)
 */
export function columnLetterToIndex(letter: string): number {
  const clean = letter.toUpperCase().trim();
  let index = 0;
  for (let i = 0; i < clean.length; i++) {
    index = index * 26 + (clean.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Parses Google Spreadsheet URL to extract Spreadsheet ID and GID
 */
export function parseGoogleSheetUrl(url: string): { spreadsheetId: string; gid: string } | null {
  if (!url || typeof url !== 'string') return null;

  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (!idMatch) return null;

  const spreadsheetId = idMatch[1];
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/i);
  const gid = gidMatch ? gidMatch[1] : '0';

  return { spreadsheetId, gid };
}

/**
 * Robust RFC 4180 compliant CSV parser with support for quotes, embedded newlines, and UTF-8 Arabic text
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  // Normalize newlines
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quote ("") inside quotes
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Only push non-empty rows or rows with at least one non-empty field
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Converts raw 2D array of rows into standard SheetData structure with column letter mapping
 */
export function processRawRows(rawRows: string[][], sourceInfo?: { url?: string; fileName?: string }): SheetData {
  if (!rawRows || rawRows.length === 0) {
    return {
      url: sourceInfo?.url,
      fileName: sourceInfo?.fileName,
      columns: [],
      rows: [],
      totalRows: 0,
    };
  }

  // Determine maximum column count across all rows
  const maxCols = Math.max(...rawRows.map((r) => r.length));

  // The first row typically contains headers
  const headerRow = rawRows[0] || [];
  const dataRows = rawRows.slice(1);

  // Generate column descriptors
  const columns: SheetColumn[] = [];
  for (let colIdx = 0; colIdx < maxCols; colIdx++) {
    const letter = indexToColumnLetter(colIdx);
    const headerName = (headerRow[colIdx] || `Column ${letter}`).trim();
    
    // Extract up to 3 sample values for visual previews
    const sampleValues: string[] = [];
    for (let r = 0; r < Math.min(dataRows.length, 5); r++) {
      const val = dataRows[r]?.[colIdx];
      if (val && val.trim().length > 0) {
        sampleValues.push(val.trim());
      }
    }

    columns.push({
      letter,
      index: colIdx,
      headerName: headerName || `Column ${letter}`,
      sampleValues,
    });
  }

  // Format each data row into an object keyed by column letter (e.g. { A: "John", B: "Certificate ID" })
  const rows: Record<string, string>[] = [];
  for (let r = 0; r < dataRows.length; r++) {
    const rawRow = dataRows[r];
    const rowObj: Record<string, string> = {};
    let hasData = false;

    for (let colIdx = 0; colIdx < maxCols; colIdx++) {
      const letter = indexToColumnLetter(colIdx);
      const val = rawRow[colIdx] || '';
      rowObj[letter] = val.trim();
      if (val.trim().length > 0) hasData = true;
    }

    if (hasData) {
      rows.push(rowObj);
    }
  }

  return {
    url: sourceInfo?.url,
    fileName: sourceInfo?.fileName,
    columns,
    rows,
    totalRows: rows.length,
  };
}

/**
 * Fetches Google Sheet data using the public CSV export endpoint
 */
export async function fetchGoogleSheetData(sheetUrl: string): Promise<SheetData> {
  const parsed = parseGoogleSheetUrl(sheetUrl);
  if (!parsed) {
    throw new Error('Invalid Google Sheets URL. Please provide a valid URL like: https://docs.google.com/spreadsheets/d/...');
  }

  const { spreadsheetId, gid } = parsed;
  // Google visualization query endpoint exports clean standard CSV
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet (${response.status} ${response.statusText}). Make sure the sheet is shared as "Anyone with the link can view".`);
    }

    const csvText = await response.text();
    const rawRows = parseCSV(csvText);

    if (rawRows.length === 0) {
      throw new Error('Google Sheet appears to be empty.');
    }

    return processRawRows(rawRows, { url: sheetUrl });
  } catch (err: any) {
    // If CORS or network error, provide helpful instructions
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Cannot access Google Sheet directly due to browser security (CORS). Please ensure the sheet sharing is set to "Anyone with the link can view" or export as CSV and upload it directly.');
    }
    throw err;
  }
}

/**
 * Parses uploaded local CSV or TSV file
 */
export async function parseUploadedFile(file: File): Promise<SheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || '';
        const rawRows = parseCSV(text);
        if (rawRows.length === 0) {
          return reject(new Error('The uploaded file is empty.'));
        }
        resolve(processRawRows(rawRows, { fileName: file.name }));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file, 'utf-8');
  });
}
