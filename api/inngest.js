import { Inngest } from 'inngest';
import { serve } from 'inngest/vercel';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);
const FALLBACK_KEY = 'sk-inn-apiQ99W3N7WselFCBxBHukEaHZ/9W+aEpmfj6LNFc5W3/PKxjB/r/Hyg3eHdBV9R1Pmlr2+SYsXgAgoWGQrgtmCBA';
const INNGEST_SIGNING_KEY = process.env.INNGEST_SIGNING_KEY || process.env.INNGEST_EVENT_KEY || FALLBACK_KEY;

export const inngest = new Inngest({
  id: 'yd-youtube-downloader',
  eventKey: process.env.INNGEST_EVENT_KEY || INNGEST_SIGNING_KEY,
});

function getYtDlpBinaryPath() {
  const isWin = process.platform === 'win32';
  const binName = isWin ? 'yt-dlp.exe' : 'yt-dlp';
  const localBin = path.join(process.cwd(), 'bin', binName);
  if (fs.existsSync(localBin)) {
    if (!isWin) {
      try { fs.chmodSync(localBin, 0o755); } catch(e) {}
    }
    return localBin;
  }
  return binName;
}

// Inngest background function for robust YouTube stream extraction & download job execution
const processDownloadJob = inngest.createFunction(
  { id: 'yd-process-download', name: 'YD Process YouTube Download' },
  { event: 'yd/download.requested' },
  async ({ event, step }) => {
    const { url } = event.data;

    const streamData = await step.run('extract-stream-urls', async () => {
      const binPath = getYtDlpBinaryPath();
      const { stdout } = await execFileAsync(binPath, ['-j', url], { timeout: 20000 });
      const data = JSON.parse(stdout);
      
      const validFormats = (data.formats || []).filter(f => f.url && f.url.startsWith('http'));
      return {
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        formats: validFormats
      };
    });

    return {
      success: true,
      title: streamData.title,
      downloadUrl: streamData.formats[0]?.url
    };
  }
);

export default serve({
  client: inngest,
  functions: [processDownloadJob],
  signingKey: INNGEST_SIGNING_KEY,
});
