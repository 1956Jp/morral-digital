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
- `index.html` carga `assets/js/config.js`, luego `assets/js/data.js` y luego `assets/js/app.js` como **scripts clásicos con globales** (sin módulos ESM). El orden importa: `CFG` (config) se define en `config.js`, `B` (catálogo) en `data.js`, y `app.js` los consume.
- **Cacheo:** los assets se referencian con `?v=N` (`styles.css?v=3`, `config.js?v=3`…). Al cambiar CSS/JS, **sube el número** en `index.html` (todos los `?v=` al mismo valor) o el navegador seguirá mostrando la versión vieja (los servidores estáticos no mandan `Cache-Control`).

## Configuración y extensión (`assets/js/config.js`)
Casi todo el sitio se parametriza desde el objeto global `CFG` (con respaldo en `app.js` si falta el archivo). Editar aquí antes de tocar `app.js`:
- `marca` / `textos` → título, hero, catálogo, reseñas, expansión, footer y etiquetas de botones (`botonComprar`, `botonGratis`, `etiquetaMorral`).
- `colores` → se vuelcan a variables CSS (`--bg`, `--card`, `--ink`, `--mut`, `--red`, `--gold`, `--green`, `--line`); valor vacío = usa el CSS.
- `secciones` (vistas: `catalogo`/`resenas`/`expansion`) y `nav` (etiquetas del menú).
- `metodosPago` (orden y visibilidad de las pestañas de pago) y `etiquetasPago`.
- `pago` → `paypal`, `zinli`, `whatsapp`, `vesRate`, `pagomovil{...}`, `binance{...}`.
`app.js` los aplica en `hydrate()` (textos), `applyTheme()` (colores) y `toggleSections()` (vistas), invocadas al cargar. Las pestañas salen de `METODOS` (derivado de `CFG.metodosPago`) y `checkout()` abre la primera. Para **añadir vistas/funciones nuevas** se edita `index.html`/`app.js`; para **libros**, solo `data.js` + `MANIFIESTO.md`.
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
4. Fuentes bloqueadas Radio Zapatista (NC), Ocean Press (Che). Autores fuera:  Margaret Thatcher, Walter Eucken.

## Pago Móvianual, sin backend)
- Config en `assets/js/config.js` → `pago`: `pagomovil` (banco/código/teléfono/cédula/titular/qr), `whatsapp` (internacional, sin `0`), `vesRate` (respaldo si fallan las APIs). En `app.js` se leen como `PAGOMOVIL`, `WHATSAPP`, `VES_RATE`, `QR_PM` (con respaldo por defecto).
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
- Pagos: pestañas en `method()` (`app.js`), orden/visibilidad desde `CFG.metodosPago`: tarjeta/Zinli (demo, inputs decorativos), PayPal (`pago.paypal` → `https://paypal.me/{user}/{importe}USD`), **Pago Móvil** (real, manual) y **Cripto** (Binance Pay, manual: `pago.binance` con `id`/`email`/`tlf` públicos; NUNCA incluir claves privadas ni 2FA). `pago.zinli` (vacío) solo añade el teléfono a la nota de «Pide y Recibe» si se rellena. Sin backend no hay verificación automática del cobro.
- El botón de compra muestra **"COMPRAR"** (`title="Añadir al morral"` conserva el símil del morral); `add()` sigue metiendo el libro en el morral.
- Los dos PDF con edición en copyright (Alianza y Biblioteca Ayacucho) están fuera de `books/`, en `../_descartados-morral/`; no volver a enlazarlos.
