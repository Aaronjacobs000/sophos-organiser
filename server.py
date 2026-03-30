#!/usr/bin/env python3
"""
Sophos Personal Organiser — Local Server (macOS/Linux)
Serves static files and provides a /save endpoint for persistent data storage.
No dependencies required — uses Python standard library only.
"""

import os
import sys
import json
import signal
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(ROOT, 'data.json')


class OrganiserHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = urlparse(self.path).path

        # GET /api/load — read data.json
        if path == '/api/load':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(b'null')
            return

        # Block serving data.json directly (use /api/load instead)
        if path == '/data.json':
            self.send_error(403, 'Use /api/load')
            return

        # Default static file serving
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path

        # POST /api/save — write data.json
        if path == '/api/save':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)

            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                f.write(body.decode('utf-8'))

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'{"status":"saved"}')

            from datetime import datetime
            print(f'  [{datetime.now().strftime("%H:%M:%S")}] Data saved')
            return

        self.send_error(404, 'Not found')

    # Suppress default access logging (too noisy)
    def log_message(self, format, *args):
        pass


def main():
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, lambda s, f: (print('\n  Server stopped.'), sys.exit(0)))

    server = HTTPServer(('localhost', PORT), OrganiserHandler)
    print()
    print('  Sophos Personal Organiser')
    print('  =========================')
    print()
    print(f'  Running at: http://localhost:{PORT}/')
    print(f'  Data file:  {DATA_FILE}')
    print()
    print('  Keep this terminal open while using the organiser.')
    print('  Press Ctrl+C to stop.')
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Server stopped.')
        server.server_close()


if __name__ == '__main__':
    main()
