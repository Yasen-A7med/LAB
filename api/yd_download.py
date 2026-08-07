from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import urllib.request
import re

def sanitize_filename(name):
    if not name:
        return 'youtube_video'
    clean = re.sub(r'[^\w\s\-\.\(\)]', '', name)
    clean = re.sub(r'\s+', '_', clean)
    return clean[:100]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed_url.query)
        stream_url = query.get('streamUrl', [''])[0]
        title = query.get('title', ['YouTube_Video'])[0]
        fmt = query.get('format', ['mp4'])[0]

        if not stream_url:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'streamUrl parameter is required'}).encode())
            return

        filename = f"{sanitize_filename(title)}.{fmt}"

        try:
            req = urllib.request.Request(
                stream_url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'}
            )

            with urllib.request.urlopen(req) as resp:
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.end_headers()

                while True:
                    chunk = resp.read(64 * 1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
