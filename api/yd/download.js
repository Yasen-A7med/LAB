import ytdl from '@distube/ytdl-core';

const agent = ytdl.createAgent();

// Clean filename string for safe header Content-Disposition
function sanitizeFilename(name) {
  return (name || 'youtube_video')
    .replace(/[^\w\s\-\.\(\)]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

// Helper to extract video ID
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
  const title = urlParams.title || 'YouTube_Video';

  const videoId = extractVideoId(targetUrl);

  if (!videoId) {
    const errPayload = { error: 'YouTube URL parameter is required.' };
    if (res && res.status) return res.status(400).json(errPayload);
    return new Response(JSON.stringify(errPayload), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const filename = `${sanitizeFilename(title)}.${targetFormat === 'mp3' ? 'mp3' : 'mp4'}`;
  const isAudioOnly = targetFormat === 'mp3' || audioMode === 'audio_only';

  try {
    const streamOptions = {
      agent,
      quality: isAudioOnly ? 'highestaudio' : 'highest',
      filter: isAudioOnly ? 'audioonly' : (audioMode === 'false' ? 'videoonly' : 'videoandaudio')
    };

    const mediaStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, streamOptions);

    if (res && res.setHeader) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', isAudioOnly ? 'audio/mpeg' : 'video/mp4');
      res.setHeader('Access-Control-Allow-Origin', '*');

      mediaStream.pipe(res);

      mediaStream.on('error', (err) => {
        console.error('Download stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream downloading failed', details: err.message });
        }
      });

      req.on('close', () => {
        mediaStream.destroy();
      });

      return;
    }

    // Web API ReadableStream fallback for Edge/Vercel standard fetch
    const webStream = new ReadableStream({
      start(controller) {
        mediaStream.on('data', (chunk) => controller.enqueue(chunk));
        mediaStream.on('end', () => controller.close());
        mediaStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        mediaStream.destroy();
      }
    });

    return new Response(webStream, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': isAudioOnly ? 'audio/mpeg' : 'video/mp4',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error in /api/yd/download:', error);
    if (res && res.status) {
      return res.status(500).json({ error: 'Failed to initiate download stream', details: error.message });
    }
    return new Response(JSON.stringify({ error: 'Failed to initiate download stream', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
