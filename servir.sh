#!/usr/bin/env bash
# Previsualiza El Morral Digital, con el mismo prefijo que en GitHub Pages
# (sitio de proyecto): http://IP:PUERTO/morral-digital/
# Uso: ./servir.sh [puerto] [host]
#   host por defecto: 127.0.0.1 (solo esta máquina)
#   usa 0.0.0.0 para exponerlo en la red local (¡solo en redes de confianza!)
# Por seguridad, el servidor bloquea archivos/ carpetas ocultas (p. ej. .git,
# .env) y desactiva el listado de directorios.
set -euo pipefail

PORT="${1:-8000}"
HOST="${2:-127.0.0.1}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVE="$(mktemp -d)"
ln -s "$ROOT" "$SERVE/morral-digital"
trap 'rm -rf "$SERVE"' EXIT

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "El Morral Digital:"
echo "  local -> http://localhost:${PORT}/morral-digital/"
if [ "$HOST" = "0.0.0.0" ] && [ -n "${IP}" ]; then
  echo "  red   -> http://${IP}:${PORT}/morral-digital/  (expuesto en la LAN)"
fi
echo "  (Ctrl+C para parar)"

python3 - "$SERVE" "$HOST" "$PORT" <<'PY'
import sys, os, urllib.parse, http.server

root, host, port = sys.argv[1], sys.argv[2], int(sys.argv[3])

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=root, **k)

    def translate_path(self, path):
        # Bloquea cualquier ruta que contenga un segmento oculto (.git, .env, …)
        segs = [s for s in urllib.parse.urlparse(path).path.split('/') if s not in ('', '.')]
        if any(s.startswith('.') for s in segs):
            return os.path.join(root, '__forbidden__')
        return super().translate_path(path)

    def list_directory(self, path):
        # Sin listado de directorios
        self.send_error(404, "Not found")
        return None

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

http.server.ThreadingHTTPServer((host, port), Handler).serve_forever()
PY
