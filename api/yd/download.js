import ytdl from '@distube/ytdl-core';

const agent = ytdl.createAgent();

// Helper to extract 11-character video ID
function extractVideoId(url) {
  if (!url) return null;
  const cleanUrl = url.trim();
  try {
    return ytdl.getVideoID(cleanUrl);
  } catch (e) {
    const match = cleanUrl.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/|\/v\/|\/e\/)([\w-]{11})/);
    return match ? match[1] : null;
  }
}

export default async function handler(req, res) {
  const urlParams = req.query || Object.fromEntries(new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).searchParams);
  const targetUrl = urlParams.url;
  const targetFormat = urlParams.format || 'mp4'; // 'mp4' or 'mp3'
  const audioMode = urlParams.audio || 'true'; // 'true', 'false', 'audio_only'

  const videoId = extractVideoId(targetUrl);

  if (!videoId) {
    const errPayload = { error: 'YouTube URL parameter is required.' };
    if (res && res.status) return res.status(400).json(errPayload);
    return new Response(JSON.stringify(errPayload), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const isAudioOnly = targetFormat === 'mp3' || audioMode === 'audio_only';

  try {
    const info = await ytdl.getInfo(videoId, { agent });
    const rawFormats = info.formats || [];

    let targetStream = null;

    if (isAudioOnly) {
      targetStream = rawFormats.find(f => f.hasAudio && f.url);
    } else if (audioMode === 'false') {
      targetStream = rawFormats.find(f => f.hasVideo && !f.hasAudio && f.url);
    } else {
      targetStream = rawFormats.find(f => f.hasVideo && f.hasAudio && f.url) || rawFormats.find(f => f.hasVideo && f.url);
    }

    if (targetStream && targetStream.url) {
      // 302 Redirect directly to Google CDN stream URL to avoid Vercel 10s serverless timeout
      if (res && res.redirect) {
        return res.redirect(302, targetStream.url);
      }
      if (res && res.writeHead) {
        res.writeHead(302, { Location: targetStream.url });
        return res.end();
      }
      return new Response(null, {
        status: 302,
        headers: { Location: targetStream.url }
      });
    }

  } catch (err) {
    console.warn('ytdl-core stream resolution error in download endpoint:', err.message);
  }

  // Fallback direct URL redirect to YouTube stream
  const fallbackUrl = `https://www.youtube.com/watch?v=${videoId}`;
  if (res && res.redirect) {
    return res.redirect(302, fallbackUrl);
  }
  if (res && res.writeHead) {
    res.writeHead(302, { Location: fallbackUrl });
    return res.end();
  }
  return new Response(null, {
    status: 302,
    headers: { Location: fallbackUrl }
  });
}
