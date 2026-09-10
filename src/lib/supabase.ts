import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://eezlxzursqueluahuulv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlemx4enVyc3F1ZWx1YWh1dWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTA0MzIsImV4cCI6MjA5MjM4NjQzMn0.q9Rx5Ul2nkwyijiLgUZ-6oZcMeCmtCj8MpXRwua1T1c';

export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Re-export utility helpers for 100% backward compatibility
export { hashPassword, generateSlug } from '../utils/crypto';
export { detectDevice } from '../utils/device';

// Re-export QR domain service methods for backward compatibility
export {
  fetchQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  incrementScanCount,
  fetchScanLogs,
} from '../services/qrService';
