import { encryptAuth, getImapClient } from '../_helper.js';

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
    // Attempt real IMAP authentication
    await client.connect();
    await client.logout();

    const token = encryptAuth(trimmedEmail, cleanPassword);
    const formattedName = trimmedEmail.split('@')[0];

    const user = {
      email: trimmedEmail,
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
      token,
      createdAt: Date.now()
    };

    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    const errorMsg = err?.message || 'Authentication failed';
    if (errorMsg.includes('Invalid credentials') || errorMsg.includes('AUTHENTICATIONFAILED')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Gmail credentials or App Password. Make sure 2-Step Verification is ON, then generate a 16-letter App Password at myaccount.google.com/apppasswords'
      });
    }

    return res.status(401).json({
      success: false,
      error: `Could not connect to Gmail: ${errorMsg}`
    });
  }
}
