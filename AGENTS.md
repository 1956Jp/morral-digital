# AGENTS.md

Estático de GitHub Pages: `index.html` + CSS + JS vanila. **No hay package.json, build, tests ni lint** — no inventes comandos de npm/CI; verificación = servir y abrir la página. (Sí es un repo git; commit/push solo si se pide.)

## Previsualización
```bash
./servir.sh                    # red local con prefijo de proyecto → http://IP:8000/morral-digital/
python3 -m http.server 8000    # desde la raíz del repo → http://localhost:8000
node --check assets/js/*.js     # única comprobación automatizable
```
Comprobar a mano: filtros, añadir/quitar del morral, checkout con enlaces de descarga, pestaña **Pago Móvil** (datos, monto en Bs, copiar, WhatsApp), libros de enlace gratuito y formulario de reseñas.

## Estructura que no se ve en los nombres
- `index.html` carga `assets/js/data.js` y luego `assets/js/app.js` como **scripts clásicos con globales** (sin módulos ESM). El orden importa: `B` (catálogo) se define en `data.js` y lo consume `app.js`.
- Desplegado como sitio de proyecto en `/morral-digital/`: **todas las rutas deben ser relativas** (hoy hay 0 rutas raíz `/assets/...`). Mantener `.nojekyll`.
- `books/MANIFIESTO.md` es el registro de dominio público: fuente, licencia y fecha de verificación por título. Nada se publica sin su fila ahí.

## Filas del catálogo (`assets/js/data.js`)
9 campos por fila, **array posicional, sin id**:
`[0 título, 1 autor, 2 corriente, 3 precio USD, 4 color, 5 descripción, 6 archivo, 7 fuenteURL, 8 licencia]`
- `2 corriente` debe ser clave del mapa `IC` de `app.js` o el icono sale `undefined`: `Bolivariano`, `Antiimperialista`, `Latinoamericano`, `Martiano`, `Zapatista`, `Marxista`.
- Los chips de filtro salen de los datos: **una corriente sin libros desaparece del filtro** (hoy `Antiimperialista` está vacío y por eso no se ve).
- `3 precio = 0` → enlace gratuito, no se vende: la ficha muestra "Leer gratis" apuntando al campo 7 y `add()` lo rechaza. Reservado a textos del EZLN (copyright vivo / CC BY-NC-SA).
- `6 archivo` = nombre dentro de `books/` (sin ruta); si está, `done()` pinta `<a download>` en la confirmación del pedido.
- `8 licencia` alimenta el sello de la ficha (`★ {licencia} · {corriente}`); vacío → "Dominio público".

## Añadir un libro (flujo principal)
1. Verificar dominio público **estricto** según `books/MANIFIESTO.md`: autor fallecido +70 años, traducción antigua o marcada PD, y edición sin `D.R.` de terceros.
2. Subir el PDF a `books/` y añadir la fila de 9 campos en `data.js`.
3. Registrar la fila en `books/MANIFIESTO.md` (URL de origen, licencia, fecha).
4. Fuentes bloqueadas: INEHRM, CLACSO y Radio Zapatista (NC), Ocean Press (Che), copias tipo Z-Library. Autores fuera: Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez.

## Pago Móvil (cobro manual, sin backend)
- Config en `assets/js/app.js`: `PAGOMOVIL` (banco/código/teléfono/cédula/titular), `WHATSAPP` (internacional, sin `0`), `VES_RATE` (respaldo si fallan las APIs), `QR_PM` (imagen opcional, se oculta con `onerror`).
- La tasa USD→VES es la **oficial del BCV**, obtenida en `getRate()` con `fetch` a DolarApi (`ve.dolarapi.com/v1/dolares/oficial`, y como respaldo el listado `/v1/dolares` filtrando `fuente=="oficial"`); si fallan, usa `VES_RATE` o muestra «tasa no disponible». Se cachea en `rateCache`.
- Es la **única excepción deliberada** a la regla «sin `fetch`» del proyecto: es una consulta pública sin secretos y con respaldo local. El resto (carrito, reseñas) sigue solo en memoria.
- `orderCode` se genera una vez en `checkout()` (`newOrder()`), para que el concepto no cambie al alternar pestañas.
- `method("bank")` pinta datos + monto en Bs + concepto + botones copiar (`copyText`) + botón WhatsApp; llama a `fillBank()` para rellenar la tasa/monto/`href` de forma asíncrona. `done()` con `lastMethod=="bank"` muestra el pedido **pendiente de verificación** y **no** ofrece descargas.
- Los PDF siguen siendo públicos por URL: la «verificación» es por honor hasta tener backend.

## Gotchas
- El morral guarda **índices de `B`** (`add(i)`/`rm(i)`), no identificadores: insertar filas en medio recoloca los carritos activos.
- Carrito y reseñas solo en memoria (sin `localStorage`); se borran al recargar. No persistir salvo que se pida. Única llamada de red: `getRate()` para la tasa del Pago Móvil (ver arriba).
- El pago es una demo deliberada salvo **Pago Móvil** (cobro manual): `done()` inventa/usa el pedido y luego sirve los PDF de `books/`, que son públicos y accesibles sin pagar. Para cobro automático real hay que sustituir `done()` por Stripe/PayPal/MercadoPago con backend (lo documenta README).
- Modo oscuro solo por CSS (`prefers-color-scheme` + `:root[data-theme="dark"]` en `styles.css`); no hay interruptor.
- Copia de interfaz en español.
- Pagos: pestañas en `method()` (`app.js`): tarjeta/Zinli (demo, inputs decorativos), PayPal (`PAYPAL_USER` → `https://paypal.me/{user}/{importe}USD`), **Pago Móvil** (real, manual) y **Cripto** (pendiente, aún no implementado). `ZINLI_USER` (vacío) solo añade el teléfono a la nota de «Pide y Recibe» si se rellena. Sin backend no hay verificación automática del cobro.
- Los dos PDF con edición en copyright (Alianza y Biblioteca Ayacucho) están fuera de `books/`, en `../_descartados-morral/`; no volver a enlazarlos.
