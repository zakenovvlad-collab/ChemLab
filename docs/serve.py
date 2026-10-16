import http.server
import socketserver

PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("ngrok-skip-browser-warning", "true")
        super().end_headers()


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Сервер запущен: http://localhost:{PORT}")
    httpd.serve_forever()