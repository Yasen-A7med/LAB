import { getCredentialsFromReq, getImapClient, mapFolderToGmail } from '../_helper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-apmail-auth');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const credentials = getCredentialsFromReq(req);
  if (!credentials) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  const { action, uids, folder } = req.body || {};
  if (!action || !Array.isArray(uids) || uids.length === 0) {
    return res.status(400).json({ success: false, error: 'action and uids array required.' });
  }

  const mailboxPath = mapFolderToGmail(folder || 'INBOX');
  const client = getImapClient(credentials);

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailboxPath);

    try {
      const uidStrings = uids.map(String).join(',');

      if (action === 'markRead') {
        await client.messageFlagsAdd(uidStrings, ['\\Seen'], { uid: true });
      } else if (action === 'markUnread') {
        await client.messageFlagsRemove(uidStrings, ['\\Seen'], { uid: true });
      } else if (action === 'star') {
        await client.messageFlagsAdd(uidStrings, ['\\Flagged'], { uid: true });
      } else if (action === 'unstar') {
        await client.messageFlagsRemove(uidStrings, ['\\Flagged'], { uid: true });
      } else if (action === 'delete') {
        try {
          await client.messageMove(uidStrings, '[Gmail]/Trash', { uid: true });
        } catch {
          await client.messageFlagsAdd(uidStrings, ['\\Deleted'], { uid: true });
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    return res.status(200).json({ success: true, action, count: uids.length });
  } catch (err) {
    try {
      await client.logout();
    } catch {}

    return res.status(500).json({ success: false, error: err?.message || err });
  }
}
