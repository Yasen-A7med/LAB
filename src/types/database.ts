/**
 * Database Types Contract for Yashoo LAB
 * Defines strongly typed entities for projects, guests, settings, qr codes, and subscribers.
 */

export interface ProjectRow {
  id: string;
  name: string;
  created_at: string;
}

export interface SettingRow {
  id?: string;
  project_id: string;
  key: string;
  value: string;
}

export interface GuestRow {
  id: string;
  project_id: string;
  name?: string | null;
  email: string;
  ticket_id?: string | null;
  status: 'pending' | 'checked-in';
  created_at: string;
}

export interface MaintenanceSubscriberRow {
  id: string;
  project_id: string;
  email: string;
  created_at: string;
}

export interface QRCodeRow {
  id: string;
  title: string;
  target_url: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  scans: number;
}

export interface QRScanLogRow {
  id?: string;
  qr_id: string;
  scanned_at: string;
  device_type: string;
  browser: string;
  os: string;
  user_agent: string;
  referrer: string;
}
