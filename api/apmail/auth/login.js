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
    const { email, appPassword } = req.body || {};

    if (!email || !appPassword) {
      return res.status(400).json({ success: false, error: 'Email and 16-character App Password required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const formattedName = trimmedEmail.split('@')[0];

    const user = {
      email: trimmedEmail,
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
      createdAt: Date.now(),
    };

    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
