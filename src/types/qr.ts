export interface QRCodeItem {
  id: string;
  title: string;
  target_url: string;
  password_hash: string;
  scans: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQRInput {
  title: string;
  targetUrl: string;
  password: string;
}

export interface ScanLog {
  id: string;
  qr_id: string;
  scanned_at: string;
  device_type: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  os: string;
  user_agent?: string;
  referrer?: string;
}
