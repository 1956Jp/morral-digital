#!/usr/bin/env bash
# =====================================================================
#  EL MORRAL DIGITAL — Sube los libros de pago al bucket privado `libros`
#  ---------------------------------------------------------------------
#  Uso (la service_role NUNCA se commitea; pásala por entorno):
#
#    SUPABASE_URL="https://TU-PROYECTO.supabase.co" \
#    SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
#    ./db/subir_libros.sh
#
#  La service_role la encuentras en: Project Settings → API → service_role.
#  Requiere que exista el bucket: ejecuta antes db/supabase_storage.sql.
#  Idempotente: re-sube con x-upsert (sobrescribe).
# =====================================================================
set -euo pipefail
: "${SUPABASE_URL:?Falta SUPABASE_URL (p. ej. https://xxxx.supabase.co)}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Falta SUPABASE_SERVICE_ROLE_KEY}"

dir="$(cd "$(dirname "$0")/.." && pwd)/books"
files=(
  ariel.pdf
  facundo.pdf
  ugarte-el-porvenir.pdf
  drago-caso-venezuela.pdf
  noli-me-tangere.epub
  el-filibusterismo.epub
)

for f in "${files[@]}"; do
  if [[ ! -f "$dir/$f" ]]; then
    echo "⚠ No existe $dir/$f (sáltalo o colócalo)" >&2
    continue
  fi
  printf '→ %s\n' "$f"
  curl -fsS -X POST "${SUPABASE_URL%/}/storage/v1/object/libros/$f" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/octet-stream" \
    -H "x-upsert: true" \
    --data-binary "@$dir/$f" >/dev/null
done

echo "Listo. Revisa Storage → bucket «libros»."
