export type AgencyStatus = 'not_contacted' | 'emailed' | 'whatsapp_sent' | 'interested' | 'confirmed';

export interface Agency {
  id: number;
  name: string;
  category: string;
  contacts: string[];
  emails: string[];
  phones: string[];
  instagram: string;
  website: string;
  highlight?: string;
  verifiedEmailSent?: boolean;
}
