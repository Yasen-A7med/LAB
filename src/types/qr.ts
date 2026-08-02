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
