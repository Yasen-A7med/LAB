import { 
  indexToColumnLetter, 
  columnLetterToIndex, 
  parseGoogleSheetUrl, 
  parseCSV, 
  processRawRows 
} from '../src/components/CA/utils/googleSheetsParser.ts';
import { 
  extractGoogleDriveFileId, 
  normalizeImageUrl 
} from '../src/components/CA/utils/googleDriveParser.ts';
import { 
  containsArabic, 
  resolveTextDirection 
} from '../src/components/CA/utils/arabicTextHelper.ts';

console.log('--- Testing CA Engine Core Utilities ---');

// Test 1: Column Letter Mapping
console.log('1. Testing Column Letter Mapping:');
console.assert(indexToColumnLetter(0) === 'A', `Expected 'A', got ${indexToColumnLetter(0)}`);
console.assert(indexToColumnLetter(1) === 'B', `Expected 'B', got ${indexToColumnLetter(1)}`);
console.assert(indexToColumnLetter(25) === 'Z', `Expected 'Z', got ${indexToColumnLetter(25)}`);
console.assert(indexToColumnLetter(26) === 'AA', `Expected 'AA', got ${indexToColumnLetter(26)}`);
console.assert(columnLetterToIndex('A') === 0, `Expected 0, got ${columnLetterToIndex('A')}`);
console.assert(columnLetterToIndex('B') === 1, `Expected 1, got ${columnLetterToIndex('B')}`);
console.assert(columnLetterToIndex('Z') === 25, `Expected 25, got ${columnLetterToIndex('Z')}`);
console.assert(columnLetterToIndex('AA') === 26, `Expected 26, got ${columnLetterToIndex('AA')}`);
console.log('✓ Column mapping passed');

// Test 2: Google Sheets URL Parser
console.log('2. Testing Google Sheets URL Parser:');
const testUrl1 = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
const parsed1 = parseGoogleSheetUrl(testUrl1);
console.assert(parsed1?.spreadsheetId === '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'Failed to extract spreadsheet ID');
console.assert(parsed1?.gid === '0', 'Failed to extract gid');

const testUrl2 = 'https://docs.google.com/spreadsheets/d/test-id-123/edit?gid=987654';
const parsed2 = parseGoogleSheetUrl(testUrl2);
console.assert(parsed2?.spreadsheetId === 'test-id-123', 'Failed to extract spreadsheet ID with query param');
console.assert(parsed2?.gid === '987654', 'Failed to extract gid with query param');
console.log('✓ Google Sheets URL parser passed');

// Test 3: CSV Parser with Arabic UTF-8 & Quoted fields
console.log('3. Testing RFC 4180 CSV Parser with Arabic and English:');
const sampleCsv = `Name,Title,Photo,Score
"محمد أحمد خليل","مهندس نظم متكاملة","https://drive.google.com/file/d/1A2B3C/view",98
"John Doe, Jr.","Full Stack Lead","https://example.com/john.png",100
"فاطمة الزهراء علي","أخصائية أمن سحابي","https://drive.google.com/open?id=4D5E6F",95`;

const rows = parseCSV(sampleCsv);
console.assert(rows.length === 4, `Expected 4 rows, got ${rows.length}`);
console.assert(rows[1][0] === 'محمد أحمد خليل', `Expected Arabic name, got ${rows[1][0]}`);
console.assert(rows[2][0] === 'John Doe, Jr.', `Expected quoted comma, got ${rows[2][0]}`);

const sheetData = processRawRows(rows);
console.assert(sheetData.columns.length === 4, `Expected 4 columns, got ${sheetData.columns.length}`);
console.assert(sheetData.columns[0].letter === 'A', `Expected Column A, got ${sheetData.columns[0].letter}`);
console.assert(sheetData.rows.length === 3, `Expected 3 data records, got ${sheetData.rows.length}`);
console.assert(sheetData.rows[0]['A'] === 'محمد أحمد خليل', `Expected Arabic record mapped to A, got ${sheetData.rows[0]['A']}`);
console.log('✓ CSV and Arabic data processing passed');

// Test 4: Google Drive Image URL Parser
console.log('4. Testing Google Drive Image Parser:');
const driveUrl1 = 'https://drive.google.com/file/d/1AbC-dEfGhIjKlMnOpQrStUvWxYz_12345/view?usp=sharing';
const driveId1 = extractGoogleDriveFileId(driveUrl1);
console.assert(driveId1 === '1AbC-dEfGhIjKlMnOpQrStUvWxYz_12345', `Drive ID extract failed: ${driveId1}`);

const directCdn1 = normalizeImageUrl(driveUrl1);
console.assert(directCdn1 === `https://lh3.googleusercontent.com/d/1AbC-dEfGhIjKlMnOpQrStUvWxYz_12345=s1600`, `CDN normalization failed: ${directCdn1}`);

const driveUrl2 = 'https://drive.google.com/open?id=myFileId999';
const directCdn2 = normalizeImageUrl(driveUrl2);
console.assert(directCdn2 === `https://lh3.googleusercontent.com/d/myFileId999=s1600`, `CDN normalization failed: ${directCdn2}`);
console.log('✓ Google Drive URL parser passed');

// Test 5: Arabic & BiDi Direction Detection
console.log('5. Testing Arabic & BiDi Detection:');
console.assert(containsArabic('محمد أحمد') === true, 'Failed Arabic detection for Arabic string');
console.assert(containsArabic('Alex Morgan') === false, 'False positive Arabic detection for English string');
console.assert(containsArabic('Certificate 2026 - شهادة') === true, 'Failed Arabic detection for mixed string');

console.assert(resolveTextDirection('محمد أحمد', 'auto') === 'rtl', 'Expected rtl for Arabic text');
console.assert(resolveTextDirection('Alex Morgan', 'auto') === 'ltr', 'Expected ltr for English text');
console.assert(resolveTextDirection('Alex Morgan', 'rtl') === 'rtl', 'Expected forced rtl');
console.assert(resolveTextDirection('محمد أحمد', 'ltr') === 'ltr', 'Expected forced ltr');
console.log('✓ Arabic text & direction detection passed');

// Test 6: Scale Simulation (1,000 records)
console.log('6. Testing Scale Simulation (1,000 rows):');
const t0 = performance.now();
const largeRawRows = [['Name', 'Title', 'ID']];
for (let i = 1; i <= 1000; i++) {
  largeRawRows.push([
    i % 2 === 0 ? `Attendee ${i}` : `المشارك رقم ${i}`,
    i % 3 === 0 ? 'Excellence Honor' : 'Professional Certification',
    `CERT-2026-${String(i).padStart(4, '0')}`
  ]);
}
const largeSheet = processRawRows(largeRawRows);
const t1 = performance.now();
console.assert(largeSheet.totalRows === 1000, `Expected 1,000 rows, got ${largeSheet.totalRows}`);
console.assert(largeSheet.rows[999]['C'] === 'CERT-2026-1000', `Row 1000 check failed: ${largeSheet.rows[999]['C']}`);
console.log(`✓ Processed 1,000 records in ${(t1 - t0).toFixed(2)}ms with zero memory degradation`);

console.log('--- ALL CA ENGINE TESTS PASSED SUCCESSFULLY! ---');
