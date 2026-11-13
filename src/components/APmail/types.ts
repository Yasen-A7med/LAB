export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  id?: string;
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
}

export type EmailCategory = 'primary' | 'promotions' | 'social' | 'updates';

export interface EmailItem {
  id: string;
  uid: number;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  date: string;
  snippet: string;
  bodyHtml?: string;
  bodyText?: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
  category?: EmailCategory;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  labels?: string[];
}

export interface UserSession {
  email: string;
  name: string;
  isDemo: boolean;
  createdAt: number;
}

export interface SendEmailPayload {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  inReplyTo?: string;
  attachments?: { name: string; size: number }[];
}
