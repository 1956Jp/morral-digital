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
Comprobar a mano: filtros, añadir/quitar del morral, checkout, pestaña **Pago Móvil** (datos, monto en Bs, copiar, WhatsApp), pantalla de pedido pendiente + **Mis descargas** (reclamo con URLs firmadas), libros de enlace gratuito y formulario de reseñas.

## Estructura que no se ve en los nombres
- `index.html` carga `assets/js/config.js`, luego `assets/js/data.js` y luego `assets/js/app.js` como **scripts clásicos con globales** (sin módulos ESM). El orden importa: `CFG` (config) se define en `config.js`, `B` (catálogo) en `data.js`, y `app.js` los consume.
- **Cacheo:** los assets se referencian con `?v=N` (`styles.css?v=23`, `config.js?v=23`…). Al cambiar CSS/JS, **sube el número** en `index.html` (todos los `?v=` al mismo valor) o el navegador seguirá mostrando la versión vieja (los servidores estáticos no mandan `Cache-Control`).

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
- `supabase/functions/entregar/index.ts` es la Edge Function de entrega (Fase 2); `db/supabase_storage.sql` crea el bucket privado `libros`. Los PDF/EPUB de pago **no** van en `books/` (repo público): viven en ese bucket y se sirven con URLs firmadas.
- `docs/ESTRUCTURA.md` (mapa frontend/backend/infra/docs y flujo de datos) y `docs/RESULTADOS.md` (informe de resultados y seguimiento) resumen el reparto de archivos; la verificación de pedidos se administra por WhatsApp (cliente manda el comprobante → el admin marca `paid`).

## Filas del catálogo (`assets/js/data.js`)
9 campos por fila, **array posicional, sin id**:
`[0 título, 1 autor, 2 corriente, 3 precio USD, 4 color, 5 descripción, 6 archivo, 7 fuenteURL, 8 licencia]`
- `2 corriente` debe ser clave del mapa `IC` de `app.js` o el icono sale `undefined`: `Bolivariano`, `Antiimperialista`, `Latinoamericano`, `Martiano`, `Zapatista`, `Marxista`.
- Los chips de filtro salen de los datos: **una corriente sin libros desaparece del filtro** (hoy las 6 tienen contenido).
- `3 precio = 0` → enlace gratuito, no se vende: la ficha muestra "Leer gratis" apuntando al campo 7 y `add()` lo rechaza. Se usa para textos del EZLN (copyright vivo / CC BY-NC-SA) y para obras de dominio público que solo se enlazan sin PDF local (Wikisource, marxists.org).
- `6 archivo` = nombre del objeto dentro del bucket **privado** `libros` de Supabase Storage (sin ruta). Los PDF/EPUB de pago **ya no se publican en `books/`** (ver «Entrega protegida»). La Edge Function firma una URL temporal a partir de este nombre.
- `8 licencia` alimenta el sello de la ficha (`★ {licencia} · {corriente}`); vacío → "Dominio público".

## Añadir un libro (flujo principal)
1. Verificar dominio público **estricto** según `books/MANIFIESTO.md`: autor fallecido +70 años, traducción antigua o marcada PD, y edición sin `D.R.` de terceros.
2. Subir el PDF/EPUB al bucket privado `libros` (Supabase Storage) y añadir la fila de 9 campos en `data.js` (campo 6 = nombre del objeto); reflejarlo en la tabla `books` si usas Supabase.
3. Registrar la fila en `books/MANIFIESTO.md` (URL de origen, licencia, fecha).
4. Fuentes bloqueadas: Radio Zapatista (NC), Ocean Press (Che), INEHRM, CLACSO, Z-Library. Autores fuera (copyright vivo): Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez.
5. **Honestidad del catálogo:** un título sin archivo y sin fuente verificable **no se publica**; si ya estaba, se retira (ver «Retiradas del catálogo» en `MANIFIESTO.md`).

## Pago Móvil (manual, sin backend)
- Config en `assets/js/config.js` → `pago`: `pagomovil` (banco/código/teléfono/cédula/titular/qr), `whatsapp` (internacional, sin `0`), `vesRate` (respaldo si fallan las APIs). En `app.js` se leen como `PAGOMOVIL`, `WHATSAPP`, `VES_RATE`, `QR_PM` (con respaldo por defecto).
- La tasa USD→VES es la **oficial del BCV**, obtenida en `getRate()` con `fetch` a DolarApi (`ve.dolarapi.com/v1/dolares/oficial`, y como respaldo el listado `/v1/dolares` filtrando `fuente=="oficial"`); si fallan, usa `VES_RATE` o muestra «tasa no disponible». Se cachea en `rateCache`.
- Es la **única excepción deliberada** a la regla «sin `fetch`» del proyecto: es una consulta pública sin secretos y con respaldo local. Las otras llamadas de red son a Supabase (`saveOrder`, y opcionalmente las secciones: `loadBooks`/`loadRevs`/`addRev`/`logSection`; ver abajo). El resto (morral en `localStorage`, reseñas locales) no hace red.
- `orderCode` se genera una vez en `checkout()` (`newOrder()`), para que el concepto no cambie al alternar pestañas.
- `method("bank")` pinta datos + monto en Bs + concepto + botones copiar (`copyText`) + botón WhatsApp; llama a `fillBank()` para rellenar la tasa/monto/`href` de forma asíncrona. `done()` con `lastMethod=="bank"` (o `crypto`) muestra el pedido **pendiente de verificación**, botón de WhatsApp para el comprobante y el bloque de reclamo (`Comprobar y descargar`); no hay descargas directas.
- Entrega: ver «Entrega protegida (Fase 2)». No hay cobro automático: el admin marca `paid` a mano.

## Registro de pedidos (Supabase, opcional)
- `done()` llama a `saveOrder(correo)`, que hace un `POST` a `${SB_URL}/rest/v1/rpc/registrar_pedido` con cabeceras `apikey`/`Authorization: Bearer {anonKey}` y cuerpo `{p_order_code, p_customer_email, p_payment_method, p_currency, p_total_amount, p_monto_bs, p_tasa_bs, p_items:[{book_title, unit_price, quantity}]}`. Sin librería, mismo estilo que `getRate()`.
- Config en `config.js` → `supabase{url, anonKey}`. Vacío = desactivado (`SB_ON=false`), el sitio funciona igual. Constantes `SB`, `SB_URL`, `SB_KEY`, `SB_ON` en `app.js`.
- El esquema vive en `db/supabase_pedidos.sql`: tablas `orders`/`order_items` + **RLS de solo-`INSERT`** para `anon` + la función atómica `registrar_pedido` (`SECURITY INVOKER`, inserta pedido y líneas en una transacción). Sin librería.
- La `anonKey` es **pública** (va en el navegador). La seguridad es la **RLS de solo-`INSERT`**: `anon` no puede leer los pedidos (protege la PII). NUNCA poner la `service_role`. SQL y detalles en `README.md`.
- Estado guardado: siempre `pending_review` (el sitio no verifica cobros); en Pago Móvil añade `monto_bs`/`tasa_bs` desde `rateCache`. Es best-effort: `saveOrder()` traga errores y no bloquea la confirmación. Los estados válidos son `pending_review`/`paid`/`rejected`/`cancelled` (los cambias a mano en el panel).
- En Vercel, `connect-src` de `vercel.json` incluye `https://*.supabase.co`. En GitHub Pages no hay CSP que ajustar.

## Entrega protegida (Fase 2: Supabase Storage + Edge Function)
Los seis títulos de pago se sirven desde un **bucket privado** `libros` (ya no desde `books/`, que es un repo público). No hay entrega hasta que el pedido esté `paid`.
- **Bucket:** `libros` (privado, `public=false`). Sin políticas para `anon`: nadie lo lee/escribe directo; solo la `service_role` firma URLs. Esquema en `db/supabase_storage.sql`.
- **Subida de archivos (manual):** con el script `db/subir_libros.sh` (`SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./db/subir_libros.sh`), o desde el *Storage* del panel, o con la CLI (`supabase storage cp books/ariel.pdf ss:///libros/ariel.pdf`). Los archivos locales se conservan para subirlos pero **no se versionan** (`.gitignore`).
- **Edge Function `entregar`** (`supabase/functions/entregar/index.ts`): recibe `{order_code, email}`, busca el pedido con la `service_role`, exige correo coincidente y `status='paid'`, y devuelve `{status, expires_in, links:[{title,url,kind}]}` con URLs firmadas (~1 h). Se despliega con `supabase functions deploy entregar` (`verify_jwt=true`; `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` las inyecta Supabase). La `service_role` NUNCA toca el navegador.
- **Flujo en el sitio:** `done()` deja el pedido `pending_review` y pinta `claimBlock()`; `claim(code,email)` (`app.js`) hace `POST` a `SB_FN_ENTREGAR` (`${SB_URL}/functions/v1/entregar`) con la `anonKey`. El acceso permanente es el botón **Mis descargas** (`openClaim()`), donde el cliente reintroduce código + correo.
- **Verificación manual:** el admin confirma el Pago Móvil/Binance y cambia el estado a `paid` en el panel; a partir de ahí el cliente reclama. `enviarEnlaces` ya no adjunta archivos: el correo lleva instrucciones para reclamar en «Mis descargas».

## Secciones en Supabase (opcional)
Con el **mismo** `supabase{url,anonKey}`, el sitio sincroniza catálogo, reseñas y actividad. Vacío = todo local (`data.js` + reseñas de ejemplo). Esquema en `db/supabase_secciones.sql` (+ `db/seed_books.sql` copia el catálogo de `data.js`).
- **Catálogo (`books`)**: `loadBooks()` hace `GET .../books?select=...&active=eq.true&order=sort_order.asc` y, si hay filas, **sustituye el array `B`** con el mismo array posicional de 9 campos (`B.length=0; B.push(...)`) y redibuja. Lectura pública (RLS `active=true`); `anon` no puede escribir. `data.js` queda como **respaldo/semilla** (si Supabase falla o está vacío, se usa tal cual). El morral guarda **títulos** (id estable), no índices, así que el reordenamiento de `B` no lo afecta.
- **Reseñas (`reviews`)**: `loadRevs()` lee las `approved` (reemplazan los ejemplos del HTML); `addRev()` inserta la nueva como `pending` (RLS fuerza `status='pending'`) y la muestra marcada «pendiente de moderación». Se aprueban en el panel. Sin Supabase, `addRev()` vuelve al comportamiento local.
- **Actividad (`section_events`)**: `observeSections()` registra `view` (IntersectionObserver, una vez por sección y carga) y `click` (menú `nav-<seccion>`). Solo INSERT; `anon` no lee.
- Helpers `sbGet(path)` / `sbInsert(table,row)` en `app.js` (REST/PostgREST, sin librerías). Todo **best-effort** (`try/catch`, `.catch`): si falla, no rompe la página.
- El texto de `resenasSub` ya no dice «no se envía a ningún servidor» (era válido solo en modo local).

## Correos con EmailJS (opcional)
Al cerrar un pedido (`done()`), `notifyOrder(correo,codigo)` envía **dos** correos con `fetch` a la API REST de EmailJS (`POST https://api.emailjs.com/api/v1.0/email/send`, sin librerías): un **aviso al administrador** (`templateAdmin`) y un **acuse al cliente** (`templateCliente`), con ~1 s de separación por el límite de **1 envío/segundo**.
- Config en `config.js` → `emailjs{publicKey, serviceId, templateCliente, templateAdmin, adminEmail, enviarEnlaces}`. `sendMail()`/`notifyOrder()` leen `MAIL`/`MAIL_ON` en `app.js`. Vacío (`publicKey`&`serviceId`) = desactivado, el sitio sigue igual.
- Plantillas listas para pegar en EmailJS en `emailjs/`: `plantilla-cliente.html` (To Email = `{{email}}`), `plantilla-admin.html` (To Email = `adminEmail`) y `emailjs/README.md` (config, variables y seguridad).
- La **Public Key** es pública (va en el navegador); la seguridad es el *Allowlist* de orígenes del panel de EmailJS. **NUNCA** la clave privada (`accessToken`).
- El destinatario del correo al cliente es dinámico: en su plantilla, **To Email = `{{email}}`**. Variables: `email`/`client_email`, `admin_email`, `order_code`, `metodo`, `items`, `total`/`moneda`, `monto_bs`/`tasa_bs`, `enlaces`, `whatsapp`.
- **Límite de honestidad:** el sitio es estático y **no verifica cobros**; los archivos de pago viven en el bucket privado `libros`. El correo **no adjunta archivos**: con `enviarEnlaces:true` incluye las instrucciones para reclamar en «Mis descargas» (código + correo); con `false` solo envía el acuse. En Vercel, el `connect-src` de `vercel.json` ya incluye `https://api.emailjs.com` y `https://*.supabase.co`; en GitHub Pages no hay CSP que ajustar.

## Seguridad y despliegue
- **GitHub Pages** (sitio de proyecto `/morral-digital/`) no permite cabeceras HTTP propias. **Vercel** sí: `vercel.json` añade CSP y cabeceras de seguridad (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`). En Vercel el sitio se sirve en la **raíz** (rutas relativas → funciona igual). Sin build: framework Other, output `.`.
- La CSP necesita `'unsafe-inline'` en `script-src`/`style-src` porque `app.js` genera HTML con `onclick`/`style` en línea. Para una CSP estricta, moverlos a `addEventListener`/clases.
- `index.html` lleva `<meta name="referrer" content="no-referrer">` (mínimo común donde no hay cabeceras).
  -  Repo **público**: la PII de cobro (cédula/teléfono/correo/Binance) es visible y la cédula es **necesaria** para el Pago Móvil. Nunca subir claves privadas, semillas, 2FA ni tokens. `.gitignore` cubre `.env`, `*.pem`, `*.token`, `gh_token`, `.vercel/`, capturas y **los 6 libros de pago** (van al bucket privado, no al repo).
- En GitHub, activar *Secret scanning* y *Dependabot* (*Settings → Code security*). Rotar tokens filtrados.

## Gotchas
- El morral guarda **títulos** (id estable; `rowOf`/`cartRows` en `app.js`), no índices de `B`: insertar o reordenar filas (p. ej. `loadBooks()`) no recoloca el carrito. Se persiste en `localStorage` bajo `morral-digital:cart:v1` y se limpia al cerrar el pedido.
- Carrito: persistido en `localStorage` (Fase 1). Reseñas locales: solo en memoria. Llamadas de red: `getRate()` (tasa del Pago Móvil) y, si está activado, Supabase (`saveOrder`; y las secciones `loadBooks`/`loadRevs`/`addRev`/`logSection`; y `claim()` a la Edge Function `entregar`) y EmailJS (`notifyOrder`); ver arriba.
- El pago es una demo deliberada salvo **Pago Móvil**/cripto (cobro manual): `done()` registra el pedido `pending_review`; la entrega se hace **solo** tras marcar `paid`, vía URLs firmadas (bucket privado). No hay cobro automático real (para eso haría falta Stripe/PayPal/MercadoPago con backend; lo documenta README).
- Modo oscuro solo por CSS (`prefers-color-scheme` + `:root[data-theme="dark"]` en `styles.css`); no hay interruptor.
- Copia de interfaz en español.
- Pagos: pestañas en `method()` (`app.js`), orden/visibilidad desde `CFG.metodosPago`: tarjeta/Zinli (demo, inputs decorativos), PayPal (`pago.paypal` → `https://paypal.me/{user}/{importe}USD`), **Pago Móvil** (real, manual) y **Cripto** (Binance Pay, manual: `pago.binance` con `id`/`email`/`tlf` públicos; NUNCA incluir claves privadas ni 2FA). `pago.zinli` (vacío) solo añade el teléfono a la nota de «Pide y Recibe» si se rellena. Sin backend no hay verificación automática del cobro.
- El botón de compra muestra **"COMPRAR"** (`title="Añadir al morral"` conserva el símil del morral); `add()` sigue metiendo el libro en el morral.
- Los dos PDF con edición en copyright (Alianza y Biblioteca Ayacucho) están fuera de `books/`, en `../_descartados-morral/`; no volver a enlazarlos.
