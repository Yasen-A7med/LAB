import { getCredentialsFromReq, getImapClient, mapFolderToGmail } from '../_helper.js';

function inferCategory(msg) {
  const from = (msg.envelope?.from?.[0]?.address || '').toLowerCase();
  const subject = (msg.envelope?.subject || '').toLowerCase();

  if (
    from.includes('promo') ||
    from.includes('deal') ||
    from.includes('newsletter') ||
    from.includes('waffarha') ||
    from.includes('noon') ||
    from.includes('uber') ||
    from.includes('amazon') ||
    subject.includes('sale') ||
    subject.includes('discount') ||
    subject.includes('off')
  ) {
    return 'promotions';
  }

  if (
    from.includes('facebook') ||
    from.includes('twitter') ||
    from.includes('instagram') ||
    from.includes('linkedin') ||
    from.includes('circlehub') ||
    from.includes('social')
  ) {
    return 'social';
  }

  if (
    from.includes('notification') ||
    from.includes('noreply') ||
    from.includes('no-reply') ||
    from.includes('github') ||
    from.includes('vercel') ||
    from.includes('google.com') ||
    from.includes('supabase') ||
    subject.includes('security') ||
    subject.includes('code') ||
    subject.includes('verification') ||
    subject.includes('update')
  ) {
    return 'updates';
  }

  return 'primary';
}

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
      error: 'Not authenticated. Please log in with your Gmail address and App Password.'
    });
  }

  const folderParam = req.query.folder || req.body?.folder || 'INBOX';
  const mailboxPath = mapFolderToGmail(folderParam);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || req.body?.limit || '30', 10)));

  const client = getImapClient(credentials);

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailboxPath);
    const emails = [];
    const total = client.mailbox.exists || 0;

    try {
      if (total > 0) {
        const startSeq = Math.max(1, total - limit + 1);
        const range = `${startSeq}:${total}`;

        for await (const msg of client.fetch(
          range,
          {
            envelope: true,
            flags: true,
            bodyStructure: true,
            internalDate: true
          },
          { uid: true }
        )) {
          const hasAttachments = Boolean(
            msg.bodyStructure?.childNodes?.some(
              (p) => p.disposition === 'attachment' || Boolean(p.dispositionParameters?.filename)
            )
          );

          const fromObj = {
            name: msg.envelope?.from?.[0]?.name || '',
            address: msg.envelope?.from?.[0]?.address || ''
          };

          const toList = (msg.envelope?.to || []).map((t) => ({
            name: t.name || '',
            address: t.address || ''
          }));

          const ccList = (msg.envelope?.cc || []).map((t) => ({
            name: t.name || '',
            address: t.address || ''
          }));

          const subject = msg.envelope?.subject || '(No Subject)';
          const dateStr = msg.envelope?.date
            ? new Date(msg.envelope.date).toISOString()
            : msg.internalDate
            ? new Date(msg.internalDate).toISOString()
            : new Date().toISOString();

          emails.push({
            id: `msg-${msg.uid}`,
            uid: msg.uid,
            from: fromObj,
            to: toList,
            cc: ccList,
            subject,
            date: dateStr,
            snippet: subject,
            isRead: msg.flags ? msg.flags.has('\\Seen') : true,
            isStarred: msg.flags ? msg.flags.has('\\Flagged') : false,
            folder: folderParam.toUpperCase(),
            category: inferCategory(msg),
            hasAttachments
          });
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    // Reverse to show newest messages first
    emails.reverse();

    return res.status(200).json({
      success: true,
      emails,
      total,
      folder: folderParam
    });
  } catch (err) {
    try {
      await client.logout();
    } catch {}

    const errorMsg = err?.message || 'Failed to fetch mailbox';
    return res.status(500).json({
      success: false,
      error: `Gmail IMAP error: ${errorMsg}`
    });
  }
}
