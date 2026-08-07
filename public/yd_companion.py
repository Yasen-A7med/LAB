#!/usr/bin/env python3
"""
YD Companion Server - Local YouTube stream extraction engine.
Run this on your machine so the YD web app can download videos.

Setup (one-time):
  pip install yt-dlp

Usage:
  python yd_companion.py

Then open the YD web app - it will auto-detect this server.
"""

import json
import re
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

try:
    import yt_dlp
except ImportError:
    print("\n[ERROR] yt-dlp is not installed.")
    print("Run:  pip install yt-dlp")
    print("Then re-run this script.\n")
    sys.exit(1)

PORT = 8765
ALLOWED_ORIGINS = [
    "https://yashoo.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]


def format_bytes(b):
    if not b or b == 0:
        return "Unknown"
    if b >= 1_073_741_824:
        return f"{b / 1_073_741_824:.1f} GB"
    if b >= 1_048_576:
        return f"{b / 1_048_576:.1f} MB"
    if b >= 1024:
        return f"{b / 1024:.1f} KB"
    return f"{b} B"


def format_duration(sec):
    if not sec:
        return "00:00"
    sec = int(sec)
    h, remainder = divmod(sec, 3600)
    m, s = divmod(remainder, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def format_views(v):
    if not v:
        return "0"
    v = int(v)
    if v >= 1_000_000:
        return f"{v / 1_000_000:.1f}M"
    if v >= 1_000:
        return f"{v / 1_000:.1f}K"
    return str(v)


class YDHandler(BaseHTTPRequestHandler):

    def _cors_headers(self, origin):
        if origin in ALLOWED_ORIGINS:
            return origin
        # Allow any localhost origin for dev
        if origin and ("localhost" in origin or "127.0.0.1" in origin):
            return origin
        return ALLOWED_ORIGINS[0]

    def _send_json(self, status, data, origin=""):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", self._cors_headers(origin))
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        origin = self.headers.get("Origin", "")
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self._cors_headers(origin))
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin", "")
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        path = parsed.path.rstrip("/")

        # Health check
        if path == "/ping":
            self._send_json(200, {"status": "ok", "engine": "yt-dlp"}, origin)
            return

        # Video info extraction
        if path == "/info":
            url = qs.get("url", [""])[0]
            if not url:
                self._send_json(400, {"success": False, "error": "url parameter required"}, origin)
                return
            self._handle_info(url, origin)
            return

        # Download redirect
        if path == "/download":
            url = qs.get("url", [""])[0]
            fmt = qs.get("format", ["mp4"])[0]
            quality = qs.get("quality", ["720p"])[0]
            if not url:
                self._send_json(400, {"error": "url parameter required"}, origin)
                return
            self._handle_download(url, fmt, quality, origin)
            return

        self._send_json(404, {"error": "Not found"}, origin)

    def _handle_info(self, url, origin):
        try:
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

            formats_raw = info.get("formats", [])
            video_map = {}
            audio_list = []

            for f in formats_raw:
                stream_url = f.get("url")
                if not stream_url or not stream_url.startswith("http"):
                    continue

                height = f.get("height")
                vcodec = f.get("vcodec", "none")
                acodec = f.get("acodec", "none")
                filesize = f.get("filesize") or f.get("filesize_approx") or 0

                # Video format
                if vcodec != "none" and height:
                    label = f"{height}p"
                    if height >= 2160:
                        label = "4K (2160p)"
                    elif height >= 1440:
                        label = "2K (1440p)"
                    elif height >= 1080:
                        label = "1080p Full HD"
                    elif height >= 720:
                        label = "720p HD"
                    elif height >= 480:
                        label = "480p Standard"
                    elif height >= 360:
                        label = "360p Medium"

                    key = f"{height}p"
                    item = {
                        "formatId": f.get("format_id", ""),
                        "quality": key,
                        "qualityLabel": label,
                        "height": height,
                        "ext": f.get("ext", "mp4"),
                        "container": f.get("ext", "mp4"),
                        "hasVideo": True,
                        "hasAudio": acodec != "none",
                        "filesizeFormatted": format_bytes(filesize),
                        "url": stream_url,
                    }
                    if key not in video_map or item["hasAudio"]:
                        video_map[key] = item

                # Audio format
                if acodec != "none" and (vcodec == "none" or not height):
                    abr = int(f.get("abr") or f.get("tbr") or 128)
                    audio_list.append({
                        "formatId": f.get("format_id", ""),
                        "quality": f"{abr}kbps",
                        "qualityLabel": f"{abr} kbps MP3",
                        "bitrate": abr,
                        "ext": "mp3",
                        "container": "mp3",
                        "hasVideo": False,
                        "hasAudio": True,
                        "filesizeFormatted": format_bytes(filesize),
                        "url": stream_url,
                    })

            video_list = sorted(video_map.values(), key=lambda x: x["height"], reverse=True)
            audio_list.sort(key=lambda x: x["bitrate"], reverse=True)

            duration = info.get("duration") or 0
            payload = {
                "success": True,
                "video": {
                    "id": info.get("id", ""),
                    "title": info.get("title", "YouTube Video"),
                    "description": (info.get("description") or "")[:200],
                    "thumbnail": info.get("thumbnail", ""),
                    "duration": duration,
                    "durationFormatted": format_duration(duration),
                    "author": info.get("uploader") or info.get("channel") or "YouTube",
                    "authorChannelUrl": info.get("uploader_url") or info.get("channel_url") or "",
                    "viewCount": format_views(info.get("view_count")),
                    "rawViewCount": info.get("view_count") or 0,
                },
                "formats": {
                    "video": video_list,
                    "audio": audio_list,
                },
            }
            self._send_json(200, payload, origin)

        except Exception as exc:
            self._send_json(500, {"success": False, "error": str(exc)}, origin)

    def _handle_download(self, url, fmt, quality, origin):
        try:
            is_audio = fmt == "mp3"
            desired_height = 720
            try:
                desired_height = int(re.sub(r"[^0-9]", "", quality) or "720")
            except:
                pass

            if is_audio:
                format_spec = "bestaudio/best"
            else:
                format_spec = (
                    f"bestvideo[height<={desired_height}]+bestaudio/"
                    f"best[height<={desired_height}]/bestvideo+bestaudio/best"
                )

            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "format": format_spec,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

            direct_url = info.get("url")
            if not direct_url:
                for rf in info.get("requested_formats", []):
                    if is_audio and rf.get("acodec", "none") != "none":
                        direct_url = rf["url"]
                        break
                    elif not is_audio and rf.get("vcodec", "none") != "none":
                        direct_url = rf["url"]
                        break
            if not direct_url:
                for f in reversed(info.get("formats", [])):
                    if f.get("url", "").startswith("http"):
                        direct_url = f["url"]
                        break

            if direct_url:
                self.send_response(302)
                self.send_header("Location", direct_url)
                self.send_header("Access-Control-Allow-Origin", self._cors_headers(origin))
                self.end_headers()
            else:
                self._send_json(500, {"error": "Could not extract stream URL"}, origin)

        except Exception as exc:
            self._send_json(500, {"error": str(exc)}, origin)

    def log_message(self, format, *args):
        msg = format % args
        if "OPTIONS" not in msg:
            print(f"  {msg}")


def main():
    print("""
  __   ______
  \\ \\ / /  _ \\
   \\ V /| | | |
    | | | |_| |
    |_| |____/  Companion Server
    """)
    print(f"  Engine:  yt-dlp {yt_dlp.version.__version__}")
    print(f"  Server:  http://localhost:{PORT}")
    print(f"  Status:  Ready — open the YD web app to start downloading.\n")

    server = HTTPServer(("127.0.0.1", PORT), YDHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
