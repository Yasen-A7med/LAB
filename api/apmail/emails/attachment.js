import { simpleParser } from 'mailparser';
import { getCredentialsFromReq, getImapClient, mapFolderToGmail } from '../_helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-apmail-auth');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const credentials = getCredentialsFromReq(req);
  if (!credentials) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  const uid = req.query.uid;
  const index = parseInt(req.query.index || '0', 10);
  const folderParam = req.query.folder || 'INBOX';
  const mailboxPath = mapFolderToGmail(folderParam);

  if (!uid) {
    return res.status(400).json({ success: false, error: 'UID required.' });
  }

  const client = getImapClient(credentials);

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailboxPath);
    let attachment = null;

    try {
      const download = await client.download(String(uid), null, { uid: true });
      if (download?.content) {
        const parsed = await simpleParser(download.content);
        if (parsed.attachments && parsed.attachments[index]) {
          attachment = parsed.attachments[index];
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    if (!attachment) {
      return res.status(404).json({ success: false, error: 'Attachment not found.' });
    }

    const filename = attachment.filename || `attachment-${index}`;
    const contentType = attachment.contentType || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    return res.status(200).send(attachment.content);
  } catch (err) {
    try {
      await client.logout();
    } catch {}

    return res.status(500).json({ success: false, error: err?.message || err });
  }
}
