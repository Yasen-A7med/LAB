import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eezlxzursqueluahuulv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlemx4enVyc3F1ZWx1YWh1dWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTA0MzIsImV4cCI6MjA5MjM4NjQzMn0.q9Rx5Ul2nkwyijiLgUZ-6oZcMeCmtCj8MpXRwua1T1c';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Async increment scan count
    supabase
      .from('qr_codes')
      .update({ scans: (data.scans || 0) + 1 })
      .eq('id', id)
      .then(() => {})
      .catch(() => {});

    // Perform HTTP 302 Redirect
    return res.redirect(302, data.target_url);
  } catch (err) {
    return res.redirect(302, '/qr');
  }
}
