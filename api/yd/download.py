from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import yt_dlp

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed_url.query)
        
        stream_url = query.get('streamUrl', [''])[0]
        video_url = query.get('url', [''])[0]
        fmt = query.get('format', ['mp4'])[0]
        quality = query.get('quality', ['720p'])[0]

        # If we already have a direct stream URL, redirect to it
        if stream_url and stream_url.startswith('http') and 'googlevideo.com' in stream_url:
            self.send_response(302)
            self.send_header('Location', stream_url)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            return

        # Otherwise, use yt-dlp to extract the direct stream URL and redirect
        if not video_url:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'url parameter is required'}).encode())
            return

        try:
            # Parse desired height from quality string like "720p"
            desired_height = 720
            try:
                desired_height = int(quality.replace('p', '').replace('kbps', ''))
            except:
                pass

            is_audio = fmt == 'mp3'

            if is_audio:
                ydl_opts = {
                    'quiet': True,
                    'no_warnings': True,
                    'format': 'bestaudio/best',
                }
            else:
                # Try to get the specific quality, fall back to best available
                ydl_opts = {
                    'quiet': True,
                    'no_warnings': True,
                    'format': f'bestvideo[height<={desired_height}]+bestaudio/best[height<={desired_height}]/bestvideo+bestaudio/best',
                }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Get the direct URL
                direct_url = info.get('url')
                
                if not direct_url:
                    # If merged format, get the video stream URL
                    requested_formats = info.get('requested_formats', [])
                    if requested_formats:
                        if is_audio:
                            # Get audio stream
                            for rf in requested_formats:
                                if rf.get('acodec', 'none') != 'none':
                                    direct_url = rf.get('url')
                                    break
                        else:
                            # Get video stream (first one is usually video)
                            direct_url = requested_formats[0].get('url')
                    
                    if not direct_url:
                        # Last resort: find best matching format from all formats
                        formats = info.get('formats', [])
                        for f in reversed(formats):
                            if f.get('url') and f['url'].startswith('http'):
                                if is_audio and f.get('acodec', 'none') != 'none' and (f.get('vcodec', 'none') == 'none' or not f.get('height')):
                                    direct_url = f['url']
                                    break
                                elif not is_audio and f.get('height') and f.get('vcodec', 'none') != 'none':
                                    if f['height'] <= desired_height:
                                        direct_url = f['url']
                                        break

                if direct_url:
                    self.send_response(302)
                    self.send_header('Location', direct_url)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                else:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Could not extract direct stream URL'}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
