/**
 * Dynamic QR Code Domain Service
 * Encapsulates Supabase cloud synchronization, LocalStorage offline cache,
 * password verification, and analytics scan logging.
 */

import { supabase } from '../lib/supabase';
import type { QRCodeItem, CreateQRInput, ScanLog } from '../types/qr';
import { hashPassword, generateSlug } from '../utils/crypto';
import { detectDevice } from '../utils/device';

const LOCAL_STORAGE_KEY = 'lab_dynamic_qr_codes';

// LocalStorage helpers for QR items
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

// LocalStorage helpers for scan logs
function getLocalScanLogs(qrId: string): ScanLog[] {
  try {
    const raw = localStorage.getItem(`lab_qr_scan_logs_${qrId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalScanLog(qrId: string, log: ScanLog): void {
  try {
    const existing = getLocalScanLogs(qrId);
    localStorage.setItem(`lab_qr_scan_logs_${qrId}`, JSON.stringify([log, ...existing]));
  } catch (err) {
    console.error('Failed to save scan log locally', err);
  }
}

/**
 * Fetches all QR codes with automatic bidirectional cloud-local synchronization.
 */
export async function fetchQRCodes(): Promise<QRCodeItem[]> {
  try {
    const { data: remoteData, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    const localItems = getLocalQRs();

    if (!error && remoteData) {
      const remoteMap = new Map((remoteData as unknown as QRCodeItem[]).map((item) => [item.id, item]));

      // Auto-sync any local-only QR codes up to Supabase
      const missingInRemote = localItems.filter((local) => !remoteMap.has(local.id));

      if (missingInRemote.length > 0) {
        for (const item of missingInRemote) {
          try {
            await supabase.from('qr_codes').insert([item]);
            remoteMap.set(item.id, item);
          } catch (e) {
            console.warn('Failed syncing item to Supabase:', item.id, e);
          }
        }
      }

      const mergedList = Array.from(remoteMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      saveLocalQRs(mergedList);
      return mergedList;
    }

    if (error) {
      console.warn('Supabase fetch error, returning local cache:', error);
    }
    return localItems;
  } catch (err) {
    console.warn('Network error during fetchQRCodes:', err);
    return getLocalQRs();
  }
}

/**
 * Retrieves a single QR code by ID from cloud or local fallback.
 */
export async function getQRCodeById(id: string): Promise<QRCodeItem | null> {
  const cleanId = id.trim();
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', cleanId)
      .single();

    if (!error && data) {
      return data as unknown as QRCodeItem;
    }
  } catch (e) {
    console.warn('Failed fetching QR code from Supabase:', e);
  }

  const localItems = getLocalQRs();
  return localItems.find((item) => item.id === cleanId) || null;
}

/**
 * Creates a new dynamic QR code in Supabase cloud and caches it locally.
 */
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

  try {
    const { error } = await supabase
      .from('qr_codes')
      .insert([newItem]);

    if (error) {
      console.error('Supabase cloud insert error:', error);
    }
  } catch (err) {
    console.error('Supabase cloud insert exception:', err);
  }

  const current = getLocalQRs();
  saveLocalQRs([newItem, ...current]);

  return newItem;
}

/**
 * Updates a dynamic QR code's destination URL after password validation.
 */
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

  try {
    await supabase
      .from('qr_codes')
      .update({ target_url: formattedTarget, updated_at })
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase update error:', err);
  }

  const current = getLocalQRs();
  const index = current.findIndex((i) => i.id === id);
  if (index !== -1) {
    current[index] = updatedItem;
  } else {
    current.unshift(updatedItem);
  }
  saveLocalQRs(current);

  return { success: true, updatedItem };
}

/**
 * Deletes a dynamic QR code after password verification.
 */
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

  try {
    await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase delete error:', err);
  }

  const current = getLocalQRs();
  saveLocalQRs(current.filter((i) => i.id !== id));

  return { success: true };
}

/**
 * Increments the total scan count and persists detailed analytics telemetry.
 */
export async function incrementScanCount(id: string): Promise<void> {
  const item = await getQRCodeById(id);
  if (!item) return;

  const newCount = (item.scans || 0) + 1;
  const device = detectDevice();
  const scanned_at = new Date().toISOString();

  const newLog: ScanLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    qr_id: id,
    scanned_at,
    device_type: device.device_type,
    browser: device.browser,
    os: device.os,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  };

  try {
    await supabase
      .from('qr_codes')
      .update({ scans: newCount })
      .eq('id', id);

    await supabase
      .from('qr_scan_logs')
      .insert([{
        qr_id: id,
        scanned_at,
        device_type: device.device_type,
        browser: device.browser,
        os: device.os,
        user_agent: newLog.user_agent,
        referrer: newLog.referrer,
      }]);
  } catch (e) {
    console.warn('Failed updating scan log in Supabase', e);
  }

  const current = getLocalQRs();
  const index = current.findIndex((i) => i.id === id);
  if (index !== -1) {
    current[index].scans = newCount;
    saveLocalQRs(current);
  }

  saveLocalScanLog(id, newLog);
}

/**
 * Retrieves analytics scan logs for a given QR code.
 */
export async function fetchScanLogs(qrId: string): Promise<ScanLog[]> {
  try {
    const { data, error } = await supabase
      .from('qr_scan_logs')
      .select('*')
      .eq('qr_id', qrId)
      .order('scanned_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as unknown as ScanLog[];
    }
  } catch (err) {
    console.warn('Failed to fetch scan logs from Supabase:', err);
  }

  return getLocalScanLogs(qrId);
}
