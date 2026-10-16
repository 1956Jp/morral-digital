# AGENTS.md

Estático de GitHub Pages: `index.html` + CSS + JS vanila. **No hay package.json, build, tests ni lint** — no inventes comandos de npm/CI; verificación = servir y abrir la página. (Sí es un repo git; commit/push solo si se pide.)

## Previsualización
```bash
./servir.sh                    # prefijo de proyecto → http://localhost:8000/morral-digital/ (binde 127.0.0.1)
./servir.sh 8000 0.0.0.0       # expuesto en la LAN (solo redes de confianza)
python3 -m http.server 8000    # desde la raíz del repo → http://localhost:8000
node --check assets/js/*.js     # única comprobación automatizable
```
`servir.sh` **bloquea dotfiles** (`.git`, `.env`…) y **no lista directorios**; no lo sustituyas por uno que los exponga.
Comprobar a mano: filtros, añadir/quitar del morral, checkout con enlaces de descarga, pestaña **Pago Móvil** (datos, monto en Bs, copiar, WhatsApp), libros de enlace gratuito y formulario de reseñas.

## Estructura que no se ve en los nombres
- `index.html` carga `assets/js/config.js`, luego `assets/js/data.js` y luego `assets/js/app.js` como **scripts clásicos con globales** (sin módulos ESM). El orden importa: `CFG` (config) se define en `config.js`, `B` (catálogo) en `data.js`, y `app.js` los consume.
- **Cacheo:** los assets se referencian con `?v=N` (`styles.css?v=5`, `config.js?v=5`…). Al cambiar CSS/JS, **sube el número** en `index.html` (todos los `?v=` al mismo valor) o el navegador seguirá mostrando la versión vieja (los servidores estáticos no mandan `Cache-Control`).

## Configuración y extensión (`assets/js/config.js`)
Casi todo el sitio se parametriza desde el objeto global `CFG` (con respaldo en `app.js` si falta el archivo). Editar aquí antes de tocar `app.js`:
- `marca` / `textos` → título, hero, catálogo, reseñas, expansión, footer y etiquetas de botones (`botonComprar`, `botonGratis`, `etiquetaMorral`).
- `colores` → se vuelcan a variables CSS (`--bg`, `--card`, `--ink`, `--mut`, `--red`, `--gold`, `--green`, `--line`); valor vacío = usa el CSS.
- `secciones` (vistas: `catalogo`/`resenas`/`expansion`) y `nav` (etiquetas del menú).
- `metodosPago` (orden y visibilidad de las pestañas de pago) y `etiquetasPago`.
- `pago` → `paypal`, `zinli`, `whatsapp`, `vesRate`, `pagomovil{...}`, `binance{...}`.
`app.js` los aplica en `hydrate()` (textos), `applyTheme()` (colores) y `toggleSections()` (vistas), invocadas al cargar. Las pestañas salen de `METODOS` (derivado de `CFG.metodosPago`) y `checkout()` abre la primera. Para **añadir vistas/funciones nuevas** se edita `index.html`/`app.js`; para **libros**, `data.js` + `MANIFIESTO.md` (y, si usas Supabase, la tabla `books`; ver «Secciones en Supabase»).
- Desplegado como sitio de proyecto en `/morral-digital/`: **todas las rutas deben ser relativas** (hoy hay 0 rutas raíz `/assets/...`). Mantener `.nojekyll`.
- `books/MANIFIESTO.md` es el registro de dominio público: fuente, licencia y fecha de verificación por título. Nada se publica sin su fila ahí.

## Filas del catálogo (`assets/js/data.js`)
9 campos por fila, **array posicional, sin id**:
`[0 título, 1 autor, 2 corriente, 3 precio USD, 4 color, 5 descripción, 6 archivo, 7 fuenteURL, 8 licencia]`
- `2 corriente` debe ser clave del mapa `IC` de `app.js` o el icono sale `undefined`: `Bolivariano`, `Antiimperialista`, `Latinoamericano`, `Martiano`, `Zapatista`, `Marxista`.
- Los chips de filtro salen de los datos: **una corriente sin libros desaparece del filtro** (hoy las 6 tienen contenido).
- `3 precio = 0` → enlace gratuito, no se vende: la ficha muestra "Leer gratis" apuntando al campo 7 y `add()` lo rechaza. Se usa para textos del EZLN (copyright vivo / CC BY-NC-SA) y para obras de dominio público que solo se enlazan sin PDF local (Wikisource, marxists.org).
- `6 archivo` = nombre dentro de `books/` (sin ruta); si está, `done()` pinta `<a download>` en la confirmación del pedido.
- `8 licencia` alimenta el sello de la ficha (`★ {licencia} · {corriente}`); vacío → "Dominio público".

## Añadir un libro (flujo principal)
1. Verificar dominio público **estricto** según `books/MANIFIESTO.md`: autor fallecido +70 años, traducción antigua o marcada PD, y edición sin `D.R.` de terceros.
2. Subir el PDF a `books/` y añadir la fila de 9 campos en `data.js`.
3. Registrar la fila en `books/MANIFIESTO.md` (URL de origen, licencia, fecha).
4. Fuentes bloqueadas: Radio Zapatista (NC), Ocean Press (Che), INEHRM, CLACSO, Z-Library. Autores fuera (copyright vivo): Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez.
5. **Honestidad del catálogo:** un título sin archivo en `books/` y sin fuente verificable **no se publica**; si ya estaba, se retira (ver «Retiradas del catálogo» en `MANIFIESTO.md`).

## Pago Móvil (manual, sin backend)
- Config en `assets/js/config.js` → `pago`: `pagomovil` (banco/código/teléfono/cédula/titular/qr), `whatsapp` (internacional, sin `0`), `vesRate` (respaldo si fallan las APIs). En `app.js` se leen como `PAGOMOVIL`, `WHATSAPP`, `VES_RATE`, `QR_PM` (con respaldo por defecto).
- La tasa USD→VES es la **oficial del BCV**, obtenida en `getRate()` con `fetch` a DolarApi (`ve.dolarapi.com/v1/dolares/oficial`, y como respaldo el listado `/v1/dolares` filtrando `fuente=="oficial"`); si fallan, usa `VES_RATE` o muestra «tasa no disponible». Se cachea en `rateCache`.
- Es la **única excepción deliberada** a la regla «sin `fetch`» del proyecto: es una consulta pública sin secretos y con respaldo local. Las otras llamadas de red son a Supabase (`saveOrder`, y opcionalmente las secciones: `loadBooks`/`loadRevs`/`addRev`/`logSection`; ver abajo). El resto (carrito, reseñas locales) sigue solo en memoria.
- `orderCode` se genera una vez en `checkout()` (`newOrder()`), para que el concepto no cambie al alternar pestañas.
- `method("bank")` pinta datos + monto en Bs + concepto + botones copiar (`copyText`) + botón WhatsApp; llama a `fillBank()` para rellenar la tasa/monto/`href` de forma asíncrona. `done()` con `lastMethod=="bank"` muestra el pedido **pendiente de verificación** y **no** ofrece descargas.
- Los PDF siguen siendo públicos por URL: la «verificación» es por honor hasta tener backend.

## Registro de pedidos (Supabase, opcional)
- `done()` llama a `saveOrder(correo)`, que hace un `POST` a `${SB_URL}/rest/v1/rpc/registrar_pedido` con cabeceras `apikey`/`Authorization: Bearer {anonKey}` y cuerpo `{p_order_code, p_customer_email, p_payment_method, p_currency, p_total_amount, p_monto_bs, p_tasa_bs, p_items:[{book_title, unit_price, quantity}]}`. Sin librería, mismo estilo que `getRate()`.
- Config en `config.js` → `supabase{url, anonKey}`. Vacío = desactivado (`SB_ON=false`), el sitio funciona igual. Constantes `SB`, `SB_URL`, `SB_KEY`, `SB_ON` en `app.js`.
- El esquema vive en `db/supabase_pedidos.sql`: tablas `orders`/`order_items` + **RLS de solo-`INSERT`** para `anon` + la función atómica `registrar_pedido` (`SECURITY INVOKER`, inserta pedido y líneas en una transacción). Sin librería.
- La `anonKey` es **pública** (va en el navegador). La seguridad es la **RLS de solo-`INSERT`**: `anon` no puede leer los pedidos (protege la PII). NUNCA poner la `service_role`. SQL y detalles en `README.md`.
- Estado guardado: siempre `pending_review` (el sitio no verifica cobros); en Pago Móvil añade `monto_bs`/`tasa_bs` desde `rateCache`. Es best-effort: `saveOrder()` traga errores y no bloquea la confirmación. Los estados válidos son `pending_review`/`paid`/`rejected`/`cancelled` (los cambias a mano en el panel).
- En Vercel, `connect-src` de `vercel.json` incluye `https://*.supabase.co`. En GitHub Pages no hay CSP que ajustar.

## Secciones en Supabase (opcional)
Con el **mismo** `supabase{url,anonKey}`, el sitio sincroniza catálogo, reseñas y actividad. Vacío = todo local (`data.js` + reseñas de ejemplo). Esquema en `db/supabase_secciones.sql` (+ `db/seed_books.sql` copia el catálogo de `data.js`).
- **Catálogo (`books`)**: `loadBooks()` hace `GET .../books?select=...&active=eq.true&order=sort_order.asc` y, si hay filas, **sustituye el array `B`** con el mismo array posicional de 9 campos (`B.length=0; B.push(...)`) y redibuja. Lectura pública (RLS `active=true`); `anon` no puede escribir. `data.js` queda como **respaldo/semilla** (si Supabase falla o está vacío, se usa tal cual). Ojo: el morral guarda índices de `B`, y ahora `B` puede cambiar al cargar.
- **Reseñas (`reviews`)**: `loadRevs()` lee las `approved` (reemplazan los ejemplos del HTML); `addRev()` inserta la nueva como `pending` (RLS fuerza `status='pending'`) y la muestra marcada «pendiente de moderación». Se aprueban en el panel. Sin Supabase, `addRev()` vuelve al comportamiento local.
- **Actividad (`section_events`)**: `observeSections()` registra `view` (IntersectionObserver, una vez por sección y carga) y `click` (menú `nav-<seccion>`). Solo INSERT; `anon` no lee.
- Helpers `sbGet(path)` / `sbInsert(table,row)` en `app.js` (REST/PostgREST, sin librerías). Todo **best-effort** (`try/catch`, `.catch`): si falla, no rompe la página.
- El texto de `resenasSub` ya no dice «no se envía a ningún servidor» (era válido solo en modo local).

## Seguridad y despliegue
- **GitHub Pages** (sitio de proyecto `/morral-digital/`) no permite cabeceras HTTP propias. **Vercel** sí: `vercel.json` añade CSP y cabeceras de seguridad (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`). En Vercel el sitio se sirve en la **raíz** (rutas relativas → funciona igual). Sin build: framework Other, output `.`.
- La CSP necesita `'unsafe-inline'` en `script-src`/`style-src` porque `app.js` genera HTML con `onclick`/`style` en línea. Para una CSP estricta, moverlos a `addEventListener`/clases.
- `index.html` lleva `<meta name="referrer" content="no-referrer">` (mínimo común donde no hay cabeceras).
- Repo **público**: la PII de cobro (cédula/teléfono/correo/Binance) es visible y la cédula es **necesaria** para el Pago Móvil. Nunca subir claves privadas, semillas, 2FA ni tokens. `.gitignore` cubre `.env`, `*.pem`, `*.token`, `gh_token`, `.vercel/`, capturas.
- En GitHub, activar *Secret scanning* y *Dependabot* (*Settings → Code security*). Rotar tokens filtrados.

## Gotchas
- El morral guarda **índices de `B`** (`add(i)`/`rm(i)`), no identificadores: insertar filas en medio recoloca los carritos activos.
- Carrito y reseñas solo en memoria (sin `localStorage`); se borran al recargar. No persistir salvo que se pida. Llamadas de red: `getRate()` (tasa del Pago Móvil) y, si está activado, Supabase (`saveOrder`; y las secciones `loadBooks`/`loadRevs`/`addRev`/`logSection`; ver arriba).
- El pago es una demo deliberada salvo **Pago Móvil** (cobro manual): `done()` inventa/usa el pedido y luego sirve los PDF de `books/`, que son públicos y accesibles sin pagar. Para cobro automático real hay que sustituir `done()` por Stripe/PayPal/MercadoPago con backend (lo documenta README).
- Modo oscuro solo por CSS (`prefers-color-scheme` + `:root[data-theme="dark"]` en `styles.css`); no hay interruptor.
- Copia de interfaz en español.
- Pagos: pestañas en `method()` (`app.js`), orden/visibilidad desde `CFG.metodosPago`: tarjeta/Zinli (demo, inputs decorativos), PayPal (`pago.paypal` → `https://paypal.me/{user}/{importe}USD`), **Pago Móvil** (real, manual) y **Cripto** (Binance Pay, manual: `pago.binance` con `id`/`email`/`tlf` públicos; NUNCA incluir claves privadas ni 2FA). `pago.zinli` (vacío) solo añade el teléfono a la nota de «Pide y Recibe» si se rellena. Sin backend no hay verificación automática del cobro.
- El botón de compra muestra **"COMPRAR"** (`title="Añadir al morral"` conserva el símil del morral); `add()` sigue metiendo el libro en el morral.
- Los dos PDF con edición en copyright (Alianza y Biblioteca Ayacucho) están fuera de `books/`, en `../_descartados-morral/`; no volver a enlazarlos.
