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
Comprobar a mano: filtros, añadir/quitar de la **lista de descargas**, descarga directa (URL firmada), libros de solo enlace («Leer gratis»), bloque de **Aportes** (importe, pestaña Pago Móvil: datos, monto en Bs, copiar, WhatsApp; pestaña Cripto) y formulario de reseñas.

## Estructura que no se ve en los nombres
- `index.html` carga `assets/js/config.js`, luego `assets/js/data.js` y luego `assets/js/app.js` como **scripts clásicos con globales** (sin módulos ESM). El orden importa: `CFG` (config) se define en `config.js`, `B` (catálogo) en `data.js`, y `app.js` los consume.
- **Cacheo:** los assets se referencian con `?v=N` (`styles.css?v=42`, `config.js?v=42`…). Al cambiar CSS/JS, **sube el número** en `index.html` (todos los `?v=` al mismo valor) o el navegador seguirá mostrando la versión vieja (los servidores estáticos no mandan `Cache-Control`).

## Configuración y extensión (`assets/js/config.js`)
Casi todo el sitio se parametriza desde el objeto global `CFG` (con respaldo en `app.js` si falta el archivo). Editar aquí antes de tocar `app.js`:
- `marca` / `textos` → título, hero, catálogo, reseñas, expansión, footer y etiquetas de botones (`botonComprar` = «Añadir», `botonGratis`, `botonDescargar`, `etiquetaMorral`, `morralTitulo`).
- `colores` → se vuelcan a variables CSS (`--bg`, `--card`, `--ink`, `--mut`, `--red`, `--gold`, `--green`, `--line`); valor vacío = usa el CSS.
- `secciones` (vistas: `catalogo`/`resenas`/`expansion`) y `nav` (etiquetas del menú).
- `metodosPago` (orden y visibilidad de las pestañas de aporte; hoy `["bank","crypto"]`), `etiquetasPago` y `aportes` (`titulo`, `intro`, `montoMin`/`montoMax`, `montos:[1,3,5,10]`).
- `pago` → `whatsapp`, `vesRate`, `pagomovil{...}`, `binance{...}` (también `paypal`/`zinli`: existen en `method()` pero no están activos).
`app.js` los aplica en `hydrate()` (textos), `applyTheme()` (colores) y `toggleSections()` (vistas), invocadas al cargar. El bloque de aportes lo abre `openAportes()` (botones «Aportes» del menú y «Hacer un aporte» de la lista; `checkout()` es el alias) con la primera pestaña de `METODOS` (derivado de `CFG.metodosPago`). Para **añadir vistas/funciones nuevas** se edita `index.html`/`app.js`; para **libros**, `data.js` + `MANIFIESTO.md` (y, si usas Supabase, la tabla `books`; ver «Secciones en Supabase»).
- Desplegado como sitio de proyecto en `/morral-digital/`: **todas las rutas deben ser relativas** (hoy hay 0 rutas raíz `/assets/...`). Mantener `.nojekyll`.
- `books/MANIFIESTO.md` es el registro de dominio público: fuente, licencia y fecha de verificación por título. Nada se publica sin su fila ahí.
- `supabase/functions/entregar/index.ts` es la Edge Function de descarga (ver «Descarga libre»); `db/supabase_storage.sql` crea el bucket privado `libros`. Los PDF/EPUB con archivo **no** van en `books/` (repo público): viven en ese bucket y se sirven gratis con URLs firmadas.
- `docs/ESTRUCTURA.md` (mapa frontend/backend/infra/docs y flujo de datos) y `docs/RESULTADOS.md` (informe de resultados y seguimiento) resumen el reparto de archivos; los comprobantes de aporte se envían por WhatsApp (el sitio no verifica nada).

## Filas del catálogo (`assets/js/data.js`)
9 campos por fila, **array posicional, sin id**:
`[0 título, 1 autor, 2 corriente, 3 precio USD, 4 color, 5 descripción, 6 archivo, 7 fuenteURL, 8 licencia]`
- `2 corriente` debe ser clave del mapa `IC` de `app.js` o el icono sale `undefined`: `Bolivariano`, `Antiimperialista`, `Latinoamericano`, `Martiano`, `Zapatista`, `Marxista`, `Clásico`.
- Los chips de filtro salen de los datos: **una corriente sin libros desaparece del filtro** (hoy las 7 tienen contenido).
- `3 precio` es **0 en las 26 filas**: todo el catálogo es gratuito (no hay precios ni venta). La ficha siempre muestra «Gratis».
- Con `6 archivo` el botón es **Descargar** (`descargar(i)` → Edge Function `entregar` → URL firmada; si falla, se cae al enlace del campo 7). Sin archivo pero con `7 fuenteURL`, el botón es **Leer gratis** (`freeBook()`: pide el correo del solicitante, lo guarda en `solicitudes` con ref. `GR-XXXXXX` y envía el enlace por EmailJS con `notifyFree()`). Ni archivo ni fuente = «Próximamente» (no debería publicarse, ver «Añadir un libro»).
- `6 archivo` = nombre del objeto dentro del bucket **privado** `libros` de Supabase Storage (sin ruta). Hoy 7 libros con archivo: `ariel.pdf`, `facundo.pdf`, `ugarte-el-porvenir.pdf`, `noli-me-tangere.epub`, `el-filibusterismo.epub`, `imperialismo-petrolero-tomo-i.pdf`, `imperialismo-petrolero-tomo-ii.pdf`. Los PDF/EPUB **no** se publican en `books/` (ver «Descarga libre»).
- `8 licencia` alimenta el sello de la ficha (`★ {licencia} · {corriente}`); vacío → "Dominio público".
- `add(i)` mete **cualquier** título en la lista de descargas (no valida precio): es una lista, no un carrito de compra.

## Añadir un libro (flujo principal)
1. Verificar dominio público **estricto** según `books/MANIFIESTO.md`: autor fallecido +70 años, traducción antigua o marcada PD, y edición sin `D.R.` de terceros.
2. Subir el PDF/EPUB al bucket privado `libros` (Supabase Storage) y añadir la fila de 9 campos en `data.js` (campo 6 = nombre del objeto); reflejarlo en la tabla `books` si usas Supabase.
3. Registrar la fila en `books/MANIFIESTO.md` (URL de origen, licencia, fecha).
4. Fuentes bloqueadas: Radio Zapatista (NC), Ocean Press (Che), INEHRM, CLACSO, Z-Library. Autores fuera (copyright vivo): Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez.
5. **Honestidad del catálogo:** un título sin archivo y sin fuente verificable **no se publica**; si ya estaba, se retira (ver «Retiradas del catálogo» en `MANIFIESTO.md`).
- **Atajo (los pasos 2–3 en una orden):** `node db/agregar-libro.mjs --titulo "…" --autor "…" --corriente "…" --precio 0 --fuente "https://…" [--desc "…" --color "#…" --anio "…" --archivo "" --nota "edición/traductor/año"] [--apply]`. Valida que la corriente exista en `IC` (app.js), la duplicación por título y añade la fila a `data.js`, `db/seed_books.sql` y `books/MANIFIESTO.md` (recalcula los conteos), **sube el `?v=`** e **imprime el UPSERT de Supabase** (lo aplica solo si defines `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; usa el `on_conflict=title` de PostgREST). Sin `--apply` es dry-run. Lote: `--lote libros.json` (array de objetos).

## Aportes (Pago Móvil y Cripto; manual, sin backend)
El catálogo es gratuito; el antiguo panel de pago ahora recibe **aportes voluntarios** para el desarrollo tecnológico (hosting, dominio, herramientas, mantenimiento). No hay pedido ni verificación automática.
- Config en `assets/js/config.js` → `pago`: `pagomovil` (banco/código/teléfono/cédula/titular/`link` → botón «Abrir Mercantil en línea»/`qr` → solo si hay imagen; vacío = no se muestra), `whatsapp` (internacional, sin `0`), `vesRate`/`vesRateMin`/`vesRateMax` (respaldo manual y rango de cordura). En `app.js` se leen como `PAGOMOVIL`/`PAGOMOVIL_LINK`, `WHATSAPP`, `VES_RATE`, `RATE_MIN`/`RATE_MAX`, `QR_PM` (con respaldo por defecto). Los importes y textos del bloque salen de `CFG.aportes` (`APOR` en `app.js`): botones rápidos `$1/$3/$5/$10`, monto personalizado (`aporteSet()`/`aporteInput()`) y rango `[montoMin, montoMax]`.
- La tasa USD→VES es **solo la oficial del BCV**, obtenida en `getRate()` con `fetch` a DolarApi (`ve.dolarapi.com/v1/dolares/oficial`, y como respaldo el listado `/v1/dolares` filtrando `fuente=="oficial"`). Se **descartan las tasas fuera del rango `[RATE_MIN, RATE_MAX]`** (p. ej. respuestas anómalas) en vez de mostrarlas; si no hay ninguna válida, usa `VES_RATE` (si está en rango) o muestra «tasa no disponible». Se cachea en `rateCache`.
- Es la **única excepción deliberada** a la regla «sin `fetch`» del proyecto: es una consulta pública sin secretos y con respaldo local. Las otras llamadas de red son a Supabase (secciones: `loadBooks`/`loadRevs`/`addRev`/`logSection`; `saveSolicitud`/`saveAporte`; y la Edge Function `entregar` en `descargar()`) y a EmailJS (`notifyFree`; ver «Correos con EmailJS»). El resto (lista de descargas en `localStorage`, reseñas locales) no hace red.
- `orderCode` (concepto `MD-XXXXXX`) se genera una vez al abrir el bloque (`openAportes()` → `newOrder()`), para que el concepto no cambie al alternar pestañas. `total()` devuelve el importe del aporte (`aporte`), no precios de libros.
- `method("bank")` pinta datos del Pago Móvil + monto en Bs + concepto + botones copiar (`copyText`) + botón WhatsApp (la tasa/monto/`href` los rellena `fillBank()` de forma asíncrona); `method("crypto")` hace lo propio en USDT con Binance Pay (`fillCrypto()`). `done()` registra el aporte (`saveAporte()`, ver «Registro de aportes y descargas»), agradece y ofrece enviar el comprobante por WhatsApp. No hay estados `pending_review`/`paid`: la confirmación es manual por WhatsApp y **no condiciona ninguna descarga**.

## Registro de aportes y descargas (Supabase, opcional)
- `done()` llama a `saveAporte(correo)`, que hace un `INSERT` en `solicitudes` con `book_title:"Aporte"`, `source_url:""` y `code` = concepto del aporte (`MD-XXXXXX`). Las descargas gratuitas registran allí mismo su fila con `saveSolicitud()` (ref. `GR-XXXXXX`; ver «Secciones en Supabase»). Sin librería: helpers `sbInsert`/`sbGet` (REST/PostgREST, mismo estilo que `getRate()`). Best-effort: traga errores y no bloquea la confirmación.
- Config en `config.js` → `supabase{url, anonKey}`. Vacío = desactivado (`SB_ON=false`), el sitio funciona igual. Constantes `SB`, `SB_URL`, `SB_KEY`, `SB_ON` en `app.js`.
- El esquema de la tabla `solicitudes` vive en `db/supabase_solicitudes.sql` (RLS de solo-`INSERT` para `anon`). El esquema histórico de pedidos (`db/supabase_pedidos.sql`: `orders`/`order_items` + RPC `registrar_pedido`) **está retirado y ya se eliminó de la base** (migración en `db/supabase_limpieza.sql`); el sitio no registra pedidos.
- **Mínimo privilegio (aplicado en `db/supabase_limpieza.sql`):** `anon` solo tiene `SELECT` en `books`/`reviews` e `INSERT` en `reviews`/`section_events`/`solicitudes`; sin `DELETE`/`UPDATE`/`TRUNCATE`/`REFERENCES`/`TRIGGER` ni `EXECUTE` de rutinas. La `anonKey` es **pública** (va en el navegador): la seguridad es RLS **más** estos `GRANT`. `anon` no puede leer `solicitudes` (protege la PII). NUNCA poner la `service_role`. SQL y detalles en `README.md`.
- En Vercel, `connect-src` de `vercel.json` incluye `https://*.supabase.co`. En GitHub Pages no hay CSP que ajustar.

## Descarga libre (bucket privado + Edge Function)
Los 7 libros con archivo se sirven desde un **bucket privado** `libros` (no desde `books/`, que es un repo público). No hay pago ni pedido: cualquiera puede descargarlos.
- **Bucket:** `libros` (privado, `public=false`). Sin políticas para `anon`: nadie lo lee/escribe directo; solo la `service_role` firma URLs. Esquema en `db/supabase_storage.sql`.
- **Subida de archivos (manual):** con el script `db/subir_libros.sh` (`SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./db/subir_libros.sh`), o desde el *Storage* del panel, o con la CLI (`supabase storage cp books/ariel.pdf ss:///libros/ariel.pdf`). Los archivos locales se conservan para subirlos pero **no se versionan** (`.gitignore`).
- **Edge Function `entregar`** (`supabase/functions/entregar/index.ts`): recibe `{archivo}` o `{archivos:[...]}`, valida el nombre (`^[A-Za-z0-9._-]+$`, sin rutas) y que el objeto exista en el bucket, y devuelve `{url, expires_in}` (o `{links:[{archivo,url}]}`) con URLs firmadas (~1 h). Se despliega con `supabase functions deploy entregar` (`verify_jwt=true`; `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` las inyecta Supabase). La `service_role` NUNCA toca el navegador.
- **Flujo en el sitio:** el botón **Descargar** (ficha o lista) llama a `descargar(i)`, que hace `POST` a `SB_FN_ENTREGAR` (`${SB_URL}/functions/v1/entregar`) con la `anonKey` y el nombre del objeto (campo 6), y dispara la descarga con la URL firmada. Si la función no está configurada o falla, se cae al enlace de la fuente (campo 7) o se avisa en el panel.

## Secciones en Supabase (opcional)
Con el **mismo** `supabase{url,anonKey}`, el sitio sincroniza catálogo, reseñas y actividad. Vacío = todo local (`data.js` + reseñas de ejemplo). Esquema en `db/supabase_secciones.sql` (+ `db/seed_books.sql` copia el catálogo de `data.js`).
- **Catálogo (`books`)**: `loadBooks()` hace `GET .../books?select=...&active=eq.true&order=sort_order.asc` y, si hay filas, **sustituye el array `B`** con el mismo array posicional de 9 campos (`B.length=0; B.push(...)`) y redibuja. Lectura pública (RLS `active=true`); `anon` no puede escribir. `data.js` queda como **respaldo/semilla** (si Supabase falla o está vacío, se usa tal cual). La lista de descargas guarda **títulos** (id estable), no índices, así que el reordenamiento de `B` no lo afecta.
- **Reseñas (`reviews`)**: `loadRevs()` lee las `approved` (reemplazan los ejemplos del HTML); `addRev()` inserta la nueva como `pending` (RLS fuerza `status='pending'`) y la muestra marcada «pendiente de moderación». Se aprueban en el panel. Sin Supabase, `addRev()` vuelve al comportamiento local.
- **Actividad (`section_events`)**: `observeSections()` registra `view` (IntersectionObserver, una vez por sección y carga) y `click` (menú `nav-<seccion>`). Solo INSERT; `anon` no lee.
- **Solicitudes (`solicitudes`)**: registro único de **descargas gratuitas** y **aportes**. `saveSolicitud(email,row,code)` (llamada desde `freeSend()`) guarda el correo del solicitante, el título y una referencia `GR-XXXXXX` (la misma que va en el correo); `saveAporte(email)` (llamada desde `done()`) guarda `book_title:"Aporte"` con el concepto `MD-XXXXXX`. RLS de solo-INSERT; `anon` no lee. Esquema en `db/supabase_solicitudes.sql`. Se consultan desde el panel.
- Helpers `sbGet(path)` / `sbInsert(table,row)` en `app.js` (REST/PostgREST, sin librerías). Todo **best-effort** (`try/catch`, `.catch`): si falla, no rompe la página.
- El texto de `resenasSub` ya no dice «no se envía a ningún servidor» (era válido solo en modo local).

## Correos con EmailJS (opcional)
El único correo que envía el sitio hoy es el de **descarga gratuita**: en `freeSend()`, `notifyFree(email,row,code)` manda al solicitante (desde la cuenta del administrador) un correo con el **enlace directo al libro** (campo 7) y guarda su correo en `solicitudes` con una referencia `GR-XXXXXX` (el registro para el admin es la fila, no un correo). Usa `fetch` a la API REST de EmailJS (`POST https://api.emailjs.com/api/v1.0/email/send`, sin librerías). El antiguo aviso al administrador (`notifyOrder`) se eliminó junto con el flujo de pedidos.
- Config en `config.js` → `emailjs{publicKey, serviceId, templateCliente, templateAdmin, adminEmail, enviarEnlaces}`. `sendMail()`/`notifyFree()` leen `MAIL`/`MAIL_ON` en `app.js`. Vacío (`publicKey`&`serviceId`) = desactivado, el sitio sigue igual. `templateAdmin`, `adminEmail` y `enviarEnlaces` quedan en `config.js` reservados, pero el sitio ya no los usa.
- Plantillas listas para pegar en EmailJS en `emailjs/`: `plantilla-cliente.html` (**descarga gratuita**: To Email = `{{email}}`, Subject = `Tu enlace de descarga — {{items}}`), `plantilla-admin.html` (histórico, **sin uso** desde que se retiró el flujo de pedidos) y `emailjs/README.md` (config, variables, seguridad y **diagnóstico**: qué significa cada error de la API).
- La **Public Key** es pública (va en el navegador); la seguridad es el *Allowlist* de orígenes del panel de EmailJS. **NUNCA** la clave privada (`accessToken`).
- El destinatario del correo es dinámico: en su plantilla, **To Email = `{{email}}`**. Variables que manda `notifyFree`: `email`/`client_email`, `admin_email`, `order_code` (ref. `GR-…`), `metodo` («Descarga gratuita»), `items` (título), `total`/`moneda` (0 USD), `monto_bs`/`tasa_bs` (vacíos), `enlaces` (HTML con el enlace de la fuente, campo 7) y `whatsapp`.
- **Errores de la API (diagnóstico en consola):** `sendMail()` registra un `console.error` explícito: `404 Account not found` = la cuenta/plan dejó de existir (reconectar Service y actualizar los ID en `config.js`); `400 Public Key is invalid` = clave mal copiada; `403` = origen no permitido (falta el dominio en el *Allowlist*). Todo es best-effort: el sitio nunca se rompe por el correo.
- **Límite de honestidad:** el catálogo es gratuito y los archivos viven en el bucket privado `libros`. El correo **no adjunta archivos ni URLs firmadas**: `{{enlaces}}` es el enlace de la fuente original; la descarga directa ocurre en la página vía Edge Function. En Vercel, el `connect-src` de `vercel.json` ya incluye `https://api.emailjs.com` y `https://*.supabase.co`; en GitHub Pages no hay CSP que ajustar.

## Seguridad y despliegue
- **GitHub Pages** (sitio de proyecto `/morral-digital/`) no permite cabeceras HTTP propias. **Vercel** sí: `vercel.json` añade CSP y cabeceras de seguridad (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`). En Vercel el sitio se sirve en la **raíz** (rutas relativas → funciona igual). Sin build: framework Other, output `.`.
- La CSP necesita `'unsafe-inline'` en `script-src`/`style-src` porque `app.js` genera HTML con `onclick`/`style` en línea. Para una CSP estricta, moverlos a `addEventListener`/clases.
- `index.html` lleva `<meta name="referrer" content="no-referrer">` (mínimo común donde no hay cabeceras).
  -  Repo **público**: la PII que se facilita para los aportes (cédula/teléfono/correo/Binance) es visible y la cédula es **necesaria** para el Pago Móvil. Nunca subir claves privadas, semillas, 2FA ni tokens. `.gitignore` cubre `.env`, `*.pem`, `*.token`, `gh_token`, `.vercel/`, capturas y **los PDF/EPUB con archivo** (van al bucket privado, no al repo).
- En GitHub, activar *Secret scanning* y *Dependabot* (*Settings → Code security*). Rotar tokens filtrados.

## Gotchas
- El morral es ahora una **lista de descargas**: guarda **títulos** (id estable; `rowOf`/`cartRows` en `app.js`), no índices de `B`, así que insertar o reordenar filas (p. ej. `loadBooks()`) no recoloca la lista. Se persiste en `localStorage` bajo `morral-digital:cart:v1`; **no se limpia sola** (se quita ítem a ítem con `rmAt`).
- Lista persistida en `localStorage`. Reseñas locales: solo en memoria. Llamadas de red: `getRate()` (tasa del Pago Móvil) y, si está activado, Supabase (secciones `loadBooks`/`loadRevs`/`addRev`/`logSection`; `saveSolicitud`/`saveAporte`; y la Edge Function `entregar` en `descargar()`) y EmailJS (`notifyFree`); ver arriba.
- No hay compra ni pedido: el catálogo es 100 % gratuito y **la descarga nunca depende del aporte**. `openAportes()` recibe donaciones voluntarias (Pago Móvil o Binance Pay, confirmación manual por WhatsApp) y `done()` solo las registra en `solicitudes` (best-effort, `book_title:"Aporte"`). No hay verificación automática ni estados de pedido.
- Modo oscuro solo por CSS (`prefers-color-scheme` + `:root[data-theme="dark"]` en `styles.css`); no hay interruptor.
- Copia de interfaz en español.
- Aportes: pestañas en `method()` (`app.js`), orden/visibilidad desde `CFG.metodosPago` (hoy solo `["bank","crypto"]`: **Pago Móvil**, con datos de `pago.pagomovil`, y **Cripto**, Binance Pay con `pago.binance` — solo identificadores PÚBLICOS; NUNCA claves privadas ni 2FA). Las claves `card`/`paypal`/`zinli` siguen en `method()` como demo, pero no se muestran. El importe lo elige el usuario (`CFG.aportes.montos` o personalizado); el concepto es `MD-XXXXXX`.
- El botón de la ficha muestra **"＋ Añadir"** (`botonComprar`; `etiquetaMorral` es el `title`) y `add()` mete el libro en la lista; el menú tiene **Aportes** (`openAportes()`) y **Tu lista (N)** (`openCart()`). El panel de la lista ofrece «Hacer un aporte» y «Seguir leyendo» (no hay fila Total).
- Los dos PDF con edición en copyright (Alianza y Biblioteca Ayacucho) están fuera de `books/`, en `../_descartados-morral/`; no volver a enlazarlos.
