import { createClient } from '@supabase/supabase-js';
import type { QRCodeItem, CreateQRInput } from '../types/qr';

const SUPABASE_URL = 'https://eezlxzursqueluahuulv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlemx4enVyc3F1ZWx1YWh1dWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTA0MzIsImV4cCI6MjA5MjM4NjQzMn0.q9Rx5Ul2nkwyijiLgUZ-6oZcMeCmtCj8MpXRwua1T1c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOCAL_STORAGE_KEY = 'lab_dynamic_qr_codes';

// Helper to hash passwords using native Web Crypto API (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_lab_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random clean nano slug (e.g. qr-9a8f2k)
export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'qr-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// LocalStorage helpers
function getLocalQRs(): QRCodeItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQRs(items: QRCodeItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// Fetch all QR codes
export async function fetchQRCodes(): Promise<QRCodeItem[]> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch failed, fallback to localStorage', error);
      return getLocalQRs();
    }

    // Cache to localStorage
    saveLocalQRs(data as QRCodeItem[]);
    return data as QRCodeItem[];
  } catch (err) {
    console.warn('Network error, fallback to localStorage', err);
    return getLocalQRs();
  }
}

// Get single QR code by ID
export async function getQRCodeById(id: string): Promise<QRCodeItem | null> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data as QRCodeItem;
    }
  } catch (e) {
    console.warn('Failed fetching QR code from Supabase:', e);
  }

  // Fallback to local
  const localItems = getLocalQRs();
  return localItems.find(item => item.id === id) || null;
}

// Create new dynamic QR code
export async function createQRCode(input: CreateQRInput): Promise<QRCodeItem> {
  const id = generateSlug();
  const password_hash = await hashPassword(input.password);
  const now = new Date().toISOString();

  let formattedTarget = input.targetUrl.trim();
  if (!/^https?:\/\//i.test(formattedTarget)) {
    formattedTarget = 'https://' + formattedTarget;
  }

  const newItem: QRCodeItem = {
    id,
    title: input.title.trim(),
    target_url: formattedTarget,
    password_hash,
    scans: 0,
    created_at: now,
    updated_at: now,
  };

  // Try saving to Supabase
  try {
    const { error } = await supabase
      .from('qr_codes')
      .insert([newItem]);

    if (error) {
      console.warn('Supabase insert error, saving locally', error);
    }
  } catch (err) {
    console.warn('Supabase insert exception', err);
  }

  // Always save locally
  const current = getLocalQRs();
  saveLocalQRs([newItem, ...current]);

  return newItem;
}

// Update target URL (Password protected)
export async function updateQRCode(
  id: string,
  passwordInput: string,
  newTargetUrl: string
): Promise<{ success: boolean; error?: string; updatedItem?: QRCodeItem }> {
  const item = await getQRCodeById(id);
  if (!item) {
    return { success: false, error: 'QR Code not found' };
  }

  const inputHash = await hashPassword(passwordInput);
  if (inputHash !== item.password_hash) {
    return { success: false, error: 'Incorrect password' };
  }

  let formattedTarget = newTargetUrl.trim();
  if (!/^https?:\/\//i.test(formattedTarget)) {
    formattedTarget = 'https://' + formattedTarget;
  }

  const updated_at = new Date().toISOString();
  const updatedItem: QRCodeItem = {
    ...item,
    target_url: formattedTarget,
    updated_at,
  };

  // Update Supabase
  try {
    await supabase
      .from('qr_codes')
      .update({ target_url: formattedTarget, updated_at })
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase update error:', err);
  }

  // Update LocalStorage
  const current = getLocalQRs();
  const index = current.findIndex(i => i.id === id);
  if (index !== -1) {
    current[index] = updatedItem;
  } else {
    current.unshift(updatedItem);
  }
  saveLocalQRs(current);

  return { success: true, updatedItem };
}

// Delete QR code (Password protected)
export async function deleteQRCode(
  id: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const item = await getQRCodeById(id);
  if (!item) {
    return { success: false, error: 'QR Code not found' };
  }

  const inputHash = await hashPassword(passwordInput);
  if (inputHash !== item.password_hash) {
    return { success: false, error: 'Incorrect password' };
  }

  // Delete from Supabase
  try {
    await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase delete error:', err);
  }

  // Delete from LocalStorage
  const current = getLocalQRs();
  saveLocalQRs(current.filter(i => i.id !== id));

  return { success: true };
}

// Increment scan count
export async function incrementScanCount(id: string): Promise<void> {
  const item = await getQRCodeById(id);
  if (!item) return;

  const newCount = (item.scans || 0) + 1;

  try {
    await supabase
      .from('qr_codes')
      .update({ scans: newCount })
      .eq('id', id);
  } catch (e) {
    console.warn('Failed updating scan count in Supabase', e);
  }

  const current = getLocalQRs();
  const index = current.findIndex(i => i.id === id);
  if (index !== -1) {
    current[index].scans = newCount;
    saveLocalQRs(current);
  }
}
