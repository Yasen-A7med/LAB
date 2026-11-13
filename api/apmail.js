import { simpleParser } from 'mailparser';
import {
  encryptAuth,
  decryptAuth,
  getCredentialsFromReq,
  getImapClient,
  getSmtpTransporter,
  mapFolderToGmail
} from './_apmail_helper.js';

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

  const url = req.url || '';
  const pathParam = String(req.query.path || '');
  const cleanUrl = url.split('?')[0];
  const target = (pathParam || cleanUrl).toLowerCase();

  // ==========================================
  // 1. AUTH / LOGIN
  // ==========================================
  if (target.includes('login')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { email, appPassword } = req.body || {};
    if (!email || !appPassword) {
      return res.status(400).json({
        success: false,
        error: 'Gmail address and 16-character Google App Password are required.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanPassword = appPassword.replace(/\s+/g, '');

    if (!trimmedEmail.includes('@gmail.com') && !trimmedEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Gmail address.'
      });
    }

    if (cleanPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'App Password must be 16 characters.'
      });
    }

    const client = getImapClient({ email: trimmedEmail, appPassword: cleanPassword });

    try {
      await client.connect();
      await client.logout();

      const token = encryptAuth(trimmedEmail, cleanPassword);
      const formattedName = trimmedEmail.split('@')[0];

      return res.status(200).json({
        success: true,
        user: {
          email: trimmedEmail,
          name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
          token,
          createdAt: Date.now()
        }
      });
    } catch (err) {
      const errorMsg = err?.message || 'Authentication failed';
      return res.status(401).json({
        success: false,
        error: `Could not connect to Gmail: ${errorMsg}`
      });
    }
  }

  // ==========================================
  // 2. AUTH / ME
  // ==========================================
  if (target.includes('me')) {
    const credentials = getCredentialsFromReq(req);
    if (!credentials) {
      return res.status(200).json({ authenticated: false, user: null });
    }
    const name = credentials.email.split('@')[0];
    return res.status(200).json({
      authenticated: true,
      user: {
        email: credentials.email,
        name: name.charAt(0).toUpperCase() + name.slice(1)
      }
    });
  }

  // ==========================================
  // 3. EMAILS / LIST
  // ==========================================
  if (target.includes('list')) {
    const credentials = getCredentialsFromReq(req);
    if (!credentials) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated. Please log in with your Gmail address and App Password.'
      });
    }

    const folderParam = req.query.folder || req.body?.folder || 'INBOX';
    const mailboxPath = mapFolderToGmail(folderParam);
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit || req.body?.limit || '40', 10)));
    const page = Math.max(1, parseInt(req.query.page || req.body?.page || '1', 10));

    const client = getImapClient(credentials);

    try {
      await client.connect();
      const lock = await client.getMailboxLock(mailboxPath);
      const emails = [];
      let total = 0;

      try {
        const searchQuery = (req.query.q || req.body?.q || '').trim();
        let uids = [];

        if (searchQuery) {
          try {
            uids = await client.search(
              { or: [{ subject: searchQuery }, { from: searchQuery }, { body: searchQuery }] },
              { uid: true }
            );
          } catch {
            uids = await client.search({ all: true }, { uid: true });
          }
        } else {
          uids = await client.search({ all: true }, { uid: true });
        }

        total = Array.isArray(uids) ? uids.length : 0;

        if (total > 0) {
          const endIndex = total - (page - 1) * limit;
          const startIndex = Math.max(0, endIndex - limit);
          const targetUids = endIndex > 0 ? uids.slice(startIndex, endIndex) : [];

          if (targetUids.length > 0) {
            const range = targetUids.join(',');

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

              const cleanSubject = subject.replace(/^(re|fwd|fw):\s*/i, '').trim();

              emails.push({
                id: `msg-${msg.uid}`,
                uid: msg.uid,
                messageId: msg.envelope?.messageId || null,
                inReplyTo: msg.envelope?.inReplyTo || null,
                threadKey: cleanSubject.toLowerCase(),
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
        }
      } finally {
        lock.release();
      }

      await client.logout();

      // Sort newest to oldest
      emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return res.status(200).json({
        success: true,
        emails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        folder: folderParam
      });
    } catch (err) {
      try {
        await client.logout();
      } catch {}

      return res.status(500).json({
        success: false,
        error: `Gmail IMAP error: ${err?.message || err}`
      });
    }
  }

  // ==========================================
  // 4. EMAILS / READ
  // ==========================================
  if (target.includes('read')) {
    const credentials = getCredentialsFromReq(req);
    if (!credentials) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
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

        const fromObj = parsed.from?.value?.[0]
          ? { name: parsed.from.value[0].name || '', address: parsed.from.value[0].address || '' }
          : undefined;

        const toList = parsed.to?.value?.map((t) => ({ name: t.name || '', address: t.address || '' }));
        const ccList = parsed.cc?.value?.map((t) => ({ name: t.name || '', address: t.address || '' }));

        result = {
          uid: Number(uid),
          messageId: parsed.messageId || null,
          inReplyTo: parsed.inReplyTo || null,
          from: fromObj,
          to: toList,
          cc: ccList,
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

      return res.status(200).json({ success: true, email: result });
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

  // ==========================================
  // 5. EMAILS / SEND
  // ==========================================
  if (target.includes('send')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const credentials = getCredentialsFromReq(req);
    if (!credentials) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }

    const { to, cc, bcc, subject, bodyHtml, bodyText, inReplyTo } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ success: false, error: 'Recipient and Subject are required.' });
    }

    const transporter = getSmtpTransporter(credentials);

    try {
      const mailOptions = {
        from: `"${credentials.email.split('@')[0]}" <${credentials.email}>`,
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        html: bodyHtml || `<p>${(bodyText || '').replace(/\n/g, '<br>')}</p>`,
        text: bodyText || bodyHtml.replace(/<[^>]*>/g, '')
      };

      if (inReplyTo) {
        mailOptions.inReplyTo = inReplyTo;
        mailOptions.references = inReplyTo;
      }

      const info = await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
        envelope: info.envelope
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: `SMTP dispatch error: ${err?.message || err}`
      });
    }
  }

  // ==========================================
  // 6. EMAILS / ACTION (Mark Read, Star, Trash)
  // ==========================================
  if (target.includes('action')) {
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

  // ==========================================
  // 7. EMAILS / ATTACHMENT
  // ==========================================
  if (target.includes('attachment')) {
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

  return res.status(404).json({ success: false, error: `Endpoint not found: ${target}` });
}
