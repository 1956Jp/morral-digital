#!/usr/bin/env bash
# Previsualiza El Morral Digital en la red local, con el mismo prefijo que en
# GitHub Pages (sitio de proyecto): http://IP:PUERTO/morral-digital/
# Uso: ./servir.sh [puerto]   (puerto por defecto: 8000)
set -euo pipefail

PORT="${1:-8000}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVE="$(mktemp -d)"
ln -s "$ROOT" "$SERVE/morral-digital"
trap 'rm -rf "$SERVE"' EXIT

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "El Morral Digital:"
echo "  local -> http://localhost:${PORT}/morral-digital/"
[ -n "${IP}" ] && echo "  red   -> http://${IP}:${PORT}/morral-digital/"
echo "  (Ctrl+C para parar)"

python3 -m http.server "${PORT}" --bind 0.0.0.0 --directory "$SERVE"
