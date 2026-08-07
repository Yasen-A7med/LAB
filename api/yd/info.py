from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import yt_dlp

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed_url.query)
        target_url = query.get('url', [''])[0]

        if not target_url:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': 'YouTube URL is required.'}).encode())
            return

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(target_url, download=False)
                
                formats_data = info.get('formats', [])
                video_map = {}
                audio_formats = []
                
                for f in formats_data:
                    url = f.get('url')
                    if not url or not url.startswith('http'):
                        continue
                    
                    height = f.get('height')
                    vcodec = f.get('vcodec', 'none')
                    acodec = f.get('acodec', 'none')
                    filesize = f.get('filesize') or f.get('filesize_approx') or 0
                    
                    size_mb = f"{filesize / 1024 / 1024:.1f} MB" if filesize else "Auto Size"

                    if vcodec != 'none' and height:
                        label = f"{height}p"
                        if height >= 2160: label = "4K (2160p)"
                        elif height >= 1440: label = "2K (1440p)"
                        elif height >= 1080: label = "1080p Full HD"
                        elif height >= 720: label = "720p HD"
                        elif height >= 480: label = "480p Standard"
                        elif height >= 360: label = "360p Medium"

                        key = f"{height}p"
                        item = {
                            'formatId': f.get('format_id') or 'mp4',
                            'quality': key,
                            'qualityLabel': label,
                            'height': height,
                            'ext': f.get('ext') or 'mp4',
                            'container': f.get('ext') or 'mp4',
                            'hasVideo': True,
                            'hasAudio': acodec != 'none',
                            'filesizeFormatted': size_mb,
                            'url': url
                        }

                        if key not in video_map or item['hasAudio']:
                            video_map[key] = item

                    if acodec != 'none' and (vcodec == 'none' or not height):
                        abr = int(f.get('abr') or f.get('tbr') or 128)
                        audio_formats.append({
                            'formatId': f.get('format_id') or 'mp3',
                            'quality': f"{abr}kbps",
                            'qualityLabel': f"{abr} kbps MP3",
                            'bitrate': abr,
                            'ext': 'mp3',
                            'container': 'mp3',
                            'hasVideo': False,
                            'hasAudio': True,
                            'filesizeFormatted': size_mb,
                            'url': url
                        })

                video_formats = sorted(list(video_map.values()), key=lambda x: x['height'], reverse=True)
                audio_formats.sort(key=lambda x: x['bitrate'], reverse=True)

                duration_sec = int(info.get('duration') or 180)
                m, s = divmod(duration_sec, 60)
                h, m = divmod(m, 60)
                dur_fmt = f"{h}:{m:02d}:{s:02d}" if h > 0 else f"{m:02d}:{s:02d}"

                payload = {
                    'success': True,
                    'video': {
                        'id': info.get('id'),
                        'title': info.get('title') or 'YouTube Video',
                        'description': (info.get('description') or '')[:200],
                        'thumbnail': info.get('thumbnail') or f"https://i.ytimg.com/vi/{info.get('id')}/hqdefault.jpg",
                        'duration': duration_sec,
                        'durationFormatted': dur_fmt,
                        'author': info.get('uploader') or info.get('channel') or 'YouTube Creator',
                        'authorChannelUrl': info.get('uploader_url') or info.get('channel_url') or '',
                        'viewCount': str(info.get('view_count') or '1.2M'),
                        'rawViewCount': info.get('view_count') or 0
                    },
                    'formats': {
                        'video': video_formats,
                        'audio': audio_formats
                    }
                }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(payload).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())
