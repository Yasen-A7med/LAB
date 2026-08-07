import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

function getYtDlpBinaryPath() {
  const isWin = process.platform === 'win32';
  const localBin = path.resolve(process.cwd(), isWin ? 'bin/yt-dlp.exe' : 'bin/yt-dlp');
  if (fs.existsSync(localBin)) {
    if (!isWin) {
      try { fs.chmodSync(localBin, 0o755); } catch(e) {}
    }
    return localBin;
  }
  return isWin ? 'yt-dlp.exe' : 'yt-dlp';
}

function sanitizeFilename(name) {
  return (name || 'youtube_video')
    .replace(/[^\w\s\-\.\(\)]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

export default async function handler(req, res) {
  const urlParams = req.query || Object.fromEntries(new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).searchParams);
  const streamUrl = urlParams.streamUrl;
  const targetUrl = urlParams.url;
  const title = urlParams.title || 'YouTube_Video';
  const format = urlParams.format || 'mp4';
  const isAudioOnly = format === 'mp3' || urlParams.audio === 'audio_only';

  const filename = `${sanitizeFilename(title)}.${isAudioOnly ? 'mp3' : 'mp4'}`;
  let downloadUrl = streamUrl;

  // Resolve targetUrl via bundled yt-dlp binary if streamUrl is missing or incomplete
  if (!downloadUrl && targetUrl) {
    try {
      const binPath = getYtDlpBinaryPath();
      const formatFlag = isAudioOnly ? '-f bestaudio' : '-f bestvideo+bestaudio/best';
      const { stdout } = await execFileAsync(binPath, ['-g', formatFlag, targetUrl], { timeout: 15000 });
      if (stdout) {
        const urls = stdout.trim().split('\n').filter(l => l.startsWith('http'));
        if (urls.length > 0) {
          downloadUrl = urls[0];
        }
      }
    } catch (e) {
      console.warn('yt-dlp stream resolution error in download handler:', e.message);
    }
  }

  if (!downloadUrl) {
    const errPayload = { error: 'streamUrl or valid YouTube url is required' };
    if (res && res.status) return res.status(400).json(errPayload);
    return new Response(JSON.stringify(errPayload), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const streamRes = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      }
    });

    if (!streamRes.ok && streamRes.status !== 206) {
      const errPayload = { error: 'Failed to fetch video stream payload from source' };
      if (res && res.status) return res.status(streamRes.status).json(errPayload);
      return new Response(JSON.stringify(errPayload), { status: streamRes.status, headers: { 'Content-Type': 'application/json' } });
    }

    if (res && res.setHeader) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      const arrayBuffer = await streamRes.arrayBuffer();
      return res.status(200).send(Buffer.from(arrayBuffer));
    }

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
    console.error('Error in download handler:', err);
    const errPayload = { error: 'Download stream failed', details: err.message };
    if (res && res.status) return res.status(500).json(errPayload);
    return new Response(JSON.stringify(errPayload), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
