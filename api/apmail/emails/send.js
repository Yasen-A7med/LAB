export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { to, subject, bodyHtml, bodyText } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ success: false, error: 'Recipient (To) and Subject required' });
    }

    return res.status(200).json({
      success: true,
      messageId: `apmail-${Date.now()}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
