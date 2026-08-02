import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eezlxzursqueluahuulv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlemx4enVyc3F1ZWx1YWh1dWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTA0MzIsImV4cCI6MjA5MjM4NjQzMn0.q9Rx5Ul2nkwyijiLgUZ-6oZcMeCmtCj8MpXRwua1T1c';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function parseUserAgent(uaString = '') {
  let device_type = 'Desktop';
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(uaString)) {
    device_type = 'Tablet';
  } else if (/Mobile|iPhone|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(uaString)) {
    device_type = 'Mobile';
  }

  let browser = 'Other';
  if (/Edg|Edge/i.test(uaString)) browser = 'Edge';
  else if (/Firefox/i.test(uaString)) browser = 'Firefox';
  else if (/SamsungBrowser/i.test(uaString)) browser = 'Samsung';
  else if (/OPR|Opera/i.test(uaString)) browser = 'Opera';
  else if (/Chrome|CriOS/i.test(uaString)) browser = 'Chrome';
  else if (/Safari/i.test(uaString)) browser = 'Safari';

  let os = 'Other';
  if (/Win/i.test(uaString)) os = 'Windows';
  else if (/Mac/i.test(uaString)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(uaString)) os = 'iOS';
  else if (/Android/i.test(uaString)) os = 'Android';
  else if (/Linux/i.test(uaString)) os = 'Linux';

  return { device_type, browser, os };
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect(302, '/');
  }

  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('target_url, scans')
      .eq('id', id)
      .single();

    if (error || !data || !data.target_url) {
      return res.redirect(302, '/qr?error=not_found');
    }

    const ua = req.headers['user-agent'] || '';
    const { device_type, browser, os } = parseUserAgent(ua);
    const scanned_at = new Date().toISOString();
    const newScansCount = (data.scans || 0) + 1;

    // Await database updates before redirecting
    try {
      await Promise.all([
        supabase
          .from('qr_codes')
          .update({ scans: newScansCount })
          .eq('id', id),
        supabase
          .from('qr_scan_logs')
          .insert([{
            qr_id: id,
            scanned_at,
            device_type,
            browser,
            os,
            user_agent: ua,
            referrer: req.headers['referer'] || req.headers['referrer'] || 'Direct'
          }])
      ]);
    } catch (e) {
      console.error('Error recording scan log on server:', e);
    }

    // Perform HTTP 302 Redirect
    return res.redirect(302, data.target_url);
  } catch (err) {
    return res.redirect(302, '/qr');
  }
}
