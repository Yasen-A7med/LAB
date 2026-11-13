import crypto from 'crypto';
import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';

const SECRET_KEY = crypto.createHash('sha256').update('apmail_secure_jwt_token_salt_2026').digest();

export function encryptAuth(email, appPassword) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);
  const data = JSON.stringify({ email: email.trim().toLowerCase(), appPassword: appPassword.replace(/\s+/g, ''), t: Date.now() });
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptAuth(token) {
  if (!token) return null;
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function getCredentialsFromReq(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-apmail-auth'];
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const creds = decryptAuth(token);
    if (creds?.email && creds?.appPassword) return creds;
  }

  // Fallback to body or cookies
  if (req.body?.token) {
    const creds = decryptAuth(req.body.token);
    if (creds?.email && creds?.appPassword) return creds;
  }
  if (req.body?.email && req.body?.appPassword) {
    return {
      email: req.body.email.trim().toLowerCase(),
      appPassword: req.body.appPassword.replace(/\s+/g, '')
    };
  }

  return null;
}

export function getImapClient(credentials) {
  return new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: credentials.email,
      pass: credentials.appPassword
    },
    logger: false,
    emitLogs: false
  });
}

export function getSmtpTransporter(credentials) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: credentials.email,
      pass: credentials.appPassword
    }
  });
}

export function mapFolderToGmail(folder) {
  const f = (folder || 'INBOX').toUpperCase();
  if (f === 'INBOX') return 'INBOX';
  if (f === 'STARRED') return '[Gmail]/Starred';
  if (f === 'SENT') return '[Gmail]/Sent Mail';
  if (f === 'DRAFTS') return '[Gmail]/Drafts';
  if (f === 'TRASH' || f === 'BIN') return '[Gmail]/Trash';
  if (f === 'SPAM') return '[Gmail]/Spam';
  if (f === 'ALL' || f === 'ALL MAIL' || f === 'ARCHIVE') return '[Gmail]/All Mail';
  if (f === 'IMPORTANT') return '[Gmail]/Important';
  return 'INBOX';
}
