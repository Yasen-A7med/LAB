import { getCredentialsFromReq, getSmtpTransporter } from '../_helper.js';

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
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please log in with your Gmail address and App Password.'
    });
  }

  const { to, cc, bcc, subject, bodyHtml, bodyText, inReplyTo, attachments } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({
      success: false,
      error: 'Recipient (To) and Subject are required.'
    });
  }

  try {
    const transporter = getSmtpTransporter(credentials);

    const mailOptions = {
      from: `"${credentials.email.split('@')[0]}" <${credentials.email}>`,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      html: bodyHtml || `<p>${bodyText || ''}</p>`,
      text: bodyText || undefined,
      inReplyTo: inReplyTo || undefined
    };

    if (Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att) => ({
        filename: att.name || att.filename || 'attachment',
        content: att.content ? Buffer.from(att.content, 'base64') : att.text || '',
        contentType: att.type || att.contentType
      }));
    }

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      response: info.response
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Failed to send email: ${err?.message || err}`
    });
  }
}
