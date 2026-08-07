import { spawn } from 'child_process';

// Clean filename string for safe header Content-Disposition
function sanitizeFilename(name) {
  return (name || 'youtube_video')
    .replace(/[^\w\s\-\.\(\)]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

export default async function handler(req, res) {
  const urlParams = req.query || Object.fromEntries(new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams);
  const targetUrl = urlParams.url;
  const targetFormat = urlParams.format || 'mp4'; // 'mp4' or 'mp3'
  const quality = urlParams.quality || '720p';
  const audioMode = urlParams.audio || 'true'; // 'true' (with sound), 'false' (muted), 'audio_only'
  const title = urlParams.title || 'YouTube_Video';

  if (!targetUrl) {
    if (res && res.status) {
      return res.status(400).json({ error: 'YouTube URL parameter is required' });
    }
    return new Response(JSON.stringify({ error: 'YouTube URL parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const filename = `${sanitizeFilename(title)}.${targetFormat === 'mp3' ? 'mp3' : 'mp4'}`;

  // Configure yt-dlp download arguments
  let ytArgs = ['-m', 'yt_dlp', '-o', '-', '--no-playlist', '--no-warnings'];

  if (targetFormat === 'mp3' || audioMode === 'audio_only') {
    ytArgs.push('-f', 'bestaudio/best', '-x', '--audio-format', 'mp3');
  } else {
    // MP4 Video format selector based on quality
    const heightNum = quality.replace(/\D/g, '') || '720';
    if (audioMode === 'false') {
      // Muted video only
      ytArgs.push('-f', `bestvideo[height<=${heightNum}]/bestvideo/best`);
    } else {
      // Video + Audio (preferred combined mp4 or best video+audio)
      ytArgs.push('-f', `best[height<=${heightNum}][ext=mp4]/bestvideo[height<=${heightNum}]+bestaudio/best`);
    }
  }

  ytArgs.push(targetUrl);

  try {
    if (res && res.setHeader) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', targetFormat === 'mp3' ? 'audio/mpeg' : 'video/mp4');

      const ytProcess = spawn('python', ytArgs);

      ytProcess.stdout.pipe(res);

      ytProcess.stderr.on('data', (data) => {
        // Log stderr silently or for debugging
        console.log(`yt-dlp download status: ${data.toString()}`);
      });

      req.on('close', () => {
        ytProcess.kill('SIGTERM');
      });

      return;
    }

    // Fallback for Web API standard Response stream
    const ytProcess = spawn('python', ytArgs);
    const stream = new ReadableStream({
      start(controller) {
        ytProcess.stdout.on('data', (chunk) => controller.enqueue(chunk));
        ytProcess.stdout.on('end', () => controller.close());
        ytProcess.stdout.on('error', (err) => controller.error(err));
      },
      cancel() {
        ytProcess.kill('SIGTERM');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': targetFormat === 'mp3' ? 'audio/mpeg' : 'video/mp4'
      }
    });

  } catch (error) {
    console.error('Error in /api/yd/download:', error);
    if (res && res.status) {
      return res.status(500).json({ error: 'Failed to initiate download', details: error.message });
    }
    return new Response(JSON.stringify({ error: 'Failed to initiate download', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
