// Vercel Edge Function Runtime for unlimited streaming without 10s serverless timeout
export const config = {
  runtime: 'edge',
};

// Clean filename string for safe Content-Disposition header
function sanitizeFilename(name) {
  return (name || 'youtube_video')
    .replace(/[^\w\s\-\.\(\)]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

export default async function handler(req) {
  const url = new URL(req.url);
  const streamUrl = url.searchParams.get('streamUrl');
  const targetUrl = url.searchParams.get('url');
  const title = url.searchParams.get('title') || 'YouTube_Video';
  const format = url.searchParams.get('format') || 'mp4';
  const isAudioOnly = format === 'mp3' || url.searchParams.get('audio') === 'audio_only';

  const filename = `${sanitizeFilename(title)}.${isAudioOnly ? 'mp3' : 'mp4'}`;
  const downloadUrl = streamUrl || targetUrl;

  if (!downloadUrl) {
    return new Response(JSON.stringify({ error: 'streamUrl or url parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const streamRes = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!streamRes.ok && streamRes.status !== 206) {
      return new Response(JSON.stringify({ error: 'Failed to fetch video stream payload from source' }), {
        status: streamRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Force browser file download with application/octet-stream and attachment disposition header
    return new Response(streamRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (err) {
    console.error('Error in Edge download handler:', err);
    return new Response(JSON.stringify({ error: 'Download stream failed', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
