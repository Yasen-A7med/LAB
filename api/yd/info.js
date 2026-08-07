import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Helper to format duration in seconds into HH:MM:SS or MM:SS
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const sec = Math.floor(Number(seconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper to format byte sizes into readable string (e.g., 45.2 MB)
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  const b = Number(bytes);
  if (b === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Helper to format view counts (e.g. 1.5M views)
function formatViews(views) {
  if (!views || isNaN(views)) return 'N/A';
  const v = Number(views);
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toString();
}

export default async function handler(req, res) {
  const urlParams = req.query || Object.fromEntries(new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams);
  const targetUrl = urlParams.url;

  if (!targetUrl) {
    if (res && res.status) {
      return res.status(400).json({ error: 'YouTube URL parameter is required' });
    }
    return new Response(JSON.stringify({ error: 'YouTube URL parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Execute yt-dlp to extract video metadata JSON
    const { stdout } = await execFileAsync('python', [
      '-m', 'yt_dlp',
      '-j',
      '--no-playlist',
      '--no-warnings',
      targetUrl
    ], { maxBuffer: 10 * 1024 * 1024 });

    const rawData = JSON.parse(stdout);

    // Extract video details
    const videoDetails = {
      id: rawData.id,
      title: rawData.title || rawData.fulltitle || 'YouTube Video',
      description: rawData.description ? rawData.description.substring(0, 200) + '...' : '',
      thumbnail: rawData.thumbnail || (rawData.thumbnails && rawData.thumbnails.length > 0 ? rawData.thumbnails[rawData.thumbnails.length - 1].url : `https://i.ytimg.com/vi/${rawData.id}/hqdefault.jpg`),
      duration: rawData.duration || 0,
      durationFormatted: formatDuration(rawData.duration),
      author: rawData.uploader || rawData.channel || 'Unknown Channel',
      authorChannelUrl: rawData.uploader_url || rawData.channel_url || '',
      viewCount: formatViews(rawData.view_count),
      rawViewCount: rawData.view_count || 0,
      uploadDate: rawData.upload_date || '',
    };

    // Filter and normalize formats
    const rawFormats = rawData.formats || [];

    // Group video formats by height (resolution)
    const videoFormatsMap = new Map();
    const audioFormatsList = [];

    rawFormats.forEach(f => {
      const hasVideo = f.vcodec && f.vcodec !== 'none';
      const hasAudio = f.acodec && f.acodec !== 'none';
      const size = f.filesize || f.filesize_approx || 0;

      if (hasVideo) {
        const height = f.height || 0;
        if (height > 0) {
          let label = `${height}p`;
          if (height >= 2160) label = '4K (2160p)';
          else if (height >= 1440) label = '2K (1440p)';
          else if (height >= 1080) label = '1080p Full HD';
          else if (height >= 720) label = '720p HD';
          else if (height >= 480) label = '480p';
          else if (height >= 360) label = '360p';
          else if (height >= 240) label = '240p';

          const key = `${height}p`;
          const existing = videoFormatsMap.get(key);

          const item = {
            formatId: f.format_id,
            quality: key,
            qualityLabel: label,
            height: height,
            width: f.width || 0,
            fps: f.fps || 30,
            ext: f.ext || 'mp4',
            container: f.container || f.ext || 'mp4',
            hasVideo: true,
            hasAudio: hasAudio,
            vcodec: f.vcodec,
            acodec: f.acodec,
            filesize: size,
            filesizeFormatted: formatBytes(size),
            url: f.url
          };

          if (!existing || (item.hasAudio && !existing.hasAudio) || (item.ext === 'mp4' && existing.ext !== 'mp4') || (item.filesize > existing.filesize)) {
            videoFormatsMap.set(key, item);
          }
        }
      }

      if (hasAudio && !hasVideo) {
        const abr = Math.round(f.abr || f.tbr || 128);
        audioFormatsList.push({
          formatId: f.format_id,
          quality: `${abr}kbps`,
          qualityLabel: `${abr} kbps MP3`,
          bitrate: abr,
          ext: 'mp3',
          container: 'mp3',
          hasVideo: false,
          hasAudio: true,
          acodec: f.acodec,
          filesize: size,
          filesizeFormatted: formatBytes(size),
          url: f.url
        });
      }
    });

    const videoFormats = Array.from(videoFormatsMap.values()).sort((a, b) => b.height - a.height);

    if (audioFormatsList.length === 0) {
      const bestAudioFormat = rawFormats.find(f => f.acodec && f.acodec !== 'none');
      audioFormatsList.push(
        { quality: '320kbps', qualityLabel: '320 kbps High Quality', bitrate: 320, ext: 'mp3', container: 'mp3', filesizeFormatted: '~8.5 MB', url: bestAudioFormat?.url || '' },
        { quality: '192kbps', qualityLabel: '192 kbps Standard', bitrate: 192, ext: 'mp3', container: 'mp3', filesizeFormatted: '~5.2 MB', url: bestAudioFormat?.url || '' },
        { quality: '128kbps', qualityLabel: '128 kbps Medium', bitrate: 128, ext: 'mp3', container: 'mp3', filesizeFormatted: '~3.4 MB', url: bestAudioFormat?.url || '' }
      );
    } else {
      audioFormatsList.sort((a, b) => b.bitrate - a.bitrate);
    }

    const payload = {
      success: true,
      video: videoDetails,
      formats: {
        video: videoFormats,
        audio: audioFormatsList
      }
    };

    if (res && res.status) {
      return res.status(200).json(payload);
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in /api/yd/info:', error);
    const errPayload = {
      success: false,
      error: 'Failed to fetch video information. Please ensure the link is a valid YouTube video.',
      details: error.message
    };
    if (res && res.status) {
      return res.status(500).json(errPayload);
    }
    return new Response(JSON.stringify(errPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
