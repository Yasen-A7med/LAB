import { simpleParser } from 'mailparser';
import { getCredentialsFromReq, getImapClient, mapFolderToGmail } from '../_helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-apmail-auth');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const credentials = getCredentialsFromReq(req);
  if (!credentials) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated.'
    });
  }

  const uid = req.query.uid || req.body?.uid;
  if (!uid) {
    return res.status(400).json({ success: false, error: 'Email UID is required.' });
  }

  const folderParam = req.query.folder || req.body?.folder || 'INBOX';
  const mailboxPath = mapFolderToGmail(folderParam);

  const client = getImapClient(credentials);

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailboxPath);
    let result = null;

    try {
      const download = await client.download(String(uid), null, { uid: true });
      if (!download?.content) {
        return res.status(404).json({ success: false, error: 'Email not found.' });
      }

      const parsed = await simpleParser(download.content);

      // Auto-mark as seen on Gmail
      try {
        await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
      } catch {}

      const attachments = (parsed.attachments || []).map((att, idx) => ({
        id: `att-${idx}-${uid}`,
        filename: att.filename || `attachment-${idx}`,
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || (att.content ? att.content.length : 0),
        contentId: att.cid
      }));

      result = {
        uid: Number(uid),
        subject: parsed.subject || '(No Subject)',
        bodyHtml: parsed.html || parsed.textAsHtml || (parsed.text ? `<pre>${parsed.text}</pre>` : ''),
        bodyText: parsed.text || '',
        snippet: (parsed.text || '').replace(/\s+/g, ' ').trim().slice(0, 150),
        date: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
        attachments
      };
    } finally {
      lock.release();
    }

    await client.logout();

    return res.status(200).json({
      success: true,
      email: result
    });
  } catch (err) {
    try {
      await client.logout();
    } catch {}

    return res.status(500).json({
      success: false,
      error: `Failed to read email: ${err?.message || err}`
    });
  }
}
