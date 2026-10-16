# El Morral Digital

Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Obras de dominio público, a precio solidario ($1–$2 USD).

## Estructura
- `index.html` – página principal
- `assets/css/styles.css` – estilos (paleta verde/azul, modo oscuro)
- `assets/js/config.js` – **configuración central** (textos, colores, secciones, pagos); edita aquí primero
- `assets/js/data.js` – catálogo (9 campos por fila, ver `AGENTS.md`)
- `assets/js/app.js` – morral, filtros, pago, descargas y reseñas
- `books/` – archivos PDF/EPUB
- `books/MANIFIESTO.md` – registro de dominio público (fuente, licencia, verificación)
- `db/supabase_pedidos.sql` – esquema SQL para registrar pedidos en Supabase (opcional)
- `db/supabase_secciones.sql` – esquema SQL para catálogo, reseñas y actividad por sección (opcional)
- `db/seed_books.sql` – catálogo inicial para la tabla `books` (opcional)

## Personalizar (sin tocar el código)
Casi todo se cambia en **`assets/js/config.js`**; `index.html`, `app.js` y `styles.css` solo si añades funciones nuevas.
- **Textos** (título, hero, catálogo, reseñas, expansión, footer, etiquetas de botones) → `marca` y `textos`.
- **Diseño/colores** → `colores` (se aplican a las variables CSS `--bg`, `--red`, `--gold`…); deja `""` para usar el CSS. Estilos avanzados en `assets/css/styles.css`.
- **Vistas/secciones** → `secciones` (`true`/`false` oculta Catálogo, Reseñas o Expansión) y `nav` (etiquetas del menú).
- **Métodos de pago** → `metodosPago` (orden y visibilidad; quita los que no uses) y `etiquetasPago`.
- **Datos de cobro** → `pago` (PayPal, Pago Móvil, Binance, WhatsApp, tasa de respaldo).
- **Libros** → `assets/js/data.js` + `books/MANIFIESTO.md` (ver «Añadir un libro» en `AGENTS.md`).
- **Funciones nuevas** → añade el código en `assets/js/app.js`; los textos/etiquetas que uses, léelos de `CFG`.
- **Al cambiar CSS/JS**, sube el número de versión en `index.html` (`assets/...?v=N`, todos los `?v=` al mismo valor) para evitar cachés del navegador.

## Previsualizar en local
```bash
./servir.sh                    # solo esta máquina → http://localhost:8000/morral-digital/
./servir.sh 8000 0.0.0.0       # expuesto en la red local (¡solo redes de confianza!)
```
Por seguridad, el servidor **bloquea archivos/carpetas ocultas** (`.git`, `.env`…) y **desactiva el listado de directorios**. Binde a `127.0.0.1` por defecto; usa `0.0.0.0` solo si necesitas probarlo desde otro dispositivo.
Sin el script: `python3 -m http.server 8000` desde esta carpeta → `http://localhost:8000`.

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub (p. ej. `morral-digital`).
2. Sube todo el contenido de esta carpeta.
3. Ve a *Settings → Pages* y elige *Deploy from a branch → main → / (root)*.
4. Tu sitio quedará en `https://TU-USUARIO.github.io/morral-digital/`.

## Publicar en Vercel (opcional)
Sitio estático sin build: importa el repositorio en Vercel (framework **Other**, sin comando de build, output `.`). Se sirve en la **raíz** del dominio (`https://TU-PROYECTO.vercel.app/`); como todas las rutas son relativas, funciona igual que en Pages. El `vercel.json` incluido añade **cabeceras de seguridad** (ver abajo).

## Seguridad (GitHub vs. Vercel)
- **GitHub Pages no permite cabeceras HTTP propias**; Vercel sí, vía `vercel.json` (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). El `index.html` también lleva `<meta name="referrer" content="no-referrer">` como mínimo común.
- La **CSP** de `vercel.json` permite solo orígenes propios + Google Fonts + `ve.dolarapi.com` + `https://*.supabase.co`; necesita `'unsafe-inline'` en `script-src`/`style-src` porque la interfaz usa manejadores y estilos en línea. Endurecerla más requiere sacar los `onclick`/`style` a `app.js`/`styles.css`.
- El repositorio es **público**: la PII de cobro (cédula, teléfono, correo, Binance Pay) queda visible. Es inevitable en el Pago Móvil (el banco exige la cédula del beneficiario); valora usar cuentas dedicadas. **Nunca** subas claves privadas, frases semilla, 2FA ni tokens (el `.gitignore` cubre `.env`, `*.pem`, `*.token`, `gh_token`).
- GitHub: activa *Secret scanning* y *Dependabot* en *Settings → Code security*. Rota cualquier token que se haya compartido. Los `.git` no se publican (Pages y Vercel no sirven `/.git/`; el `servir.sh` local también lo bloquea).

## Pagos reales
GitHub Pages es un servidor estático: el pago actual es una **demostración**. Opciones sin servidor propio:
- **PayPal.me** (ya integrado): la pestaña PayPal abre `https://paypal.me/{PAYPAL_USER}/{importe}USD`. Cambia `pago.paypal` en `assets/js/config.js` (por defecto `morraldigital`). El sufijo `USD` fija la divisa del importe.
- **Pago Móvil** (ya integrado, cobro manual): la pestaña «Pago Móvil» muestra los datos del cobro y el importe convertido a **Bs**. Configura en `assets/js/config.js` → `pago`:
  - `pago.pagomovil` — `banco`, `codigo` (0175 = Banco Digital de los Trabajadores), `telefono`, `cedula`, `titular`, `qr`.
  - `pago.whatsapp` — número destino del comprobante, formato internacional sin `0` (p. ej. `584268901582`).
  - `pago.vesRate` — respaldo si fallan las APIs de tasa (`0` = sin respaldo).
  La tasa es la **oficial del BCV**, consultada automáticamente vía DolarApi (sin clave y con CORS) con respaldo local. El pedido queda **pendiente de verificación** hasta que confirmes el comprobante; sin backend los PDF siguen siendo públicos por URL.
- **Stripe Payment Links** o **botones de PayPal**: crea un enlace por libro y colócalo en `app.js` en lugar de `done()`.
- **Cripto** (ya integrado, cobro manual): la pestaña «Cripto» muestra tu **Binance Pay** (`pago.binance` en `config.js`: `id`, `email`, `tlf` públicos) y el total en USDT (1:1 con USD). Igual que el Pago Móvil, el pedido queda **pendiente de verificación**. Por seguridad solo se publican identificadores públicos (nunca claves privadas, frases semilla ni 2FA). QR opcional en `assets/img/binance-qr.png`.
- **MercadoPago** (enlaces de pago) para Latinoamérica.
Para entregar archivos solo tras el pago se necesita un backend (p. ej. Netlify/Vercel Functions o Stripe + webhook); con PayPal.me o Pago Móvil manual no se verifica el cobro.

## Registrar pedidos con Supabase (opcional)
Al confirmar un pedido (`done()` en `app.js`), el sitio lo registra en [Supabase](https://supabase.com) vía su API REST (PostgREST), sin librerías ni build. Es opcional: si no lo configuras, todo sigue igual.

1. **Ejecuta el esquema**: pega el contenido de `db/supabase_pedidos.sql` en el **SQL Editor** de Supabase y pulsa Run. Crea:
   - `orders` — una fila por pedido (`order_code`, `customer_email`, `payment_method`, `status`, `total_amount`, `monto_bs`, `tasa_bs`, `created_at`…).
   - `order_items` — una fila por libro (`book_title`, `unit_price`, `quantity`), con `on delete cascade` hacia `orders`.
   - Índices, **RLS con políticas de solo-INSERT para `anon`** (el navegador no puede leer pedidos: la PII del correo queda protegida) y la función atómica **`registrar_pedido(...)`**, que inserta pedido y líneas en una sola transacción (si algo falla, no queda un pedido sin libros).
2. **Rellena `supabase` en `assets/js/config.js`**: `url` (`https://TU-PROYECTO.supabase.co`) y `anonKey` (clave **anónima** pública; **nunca** la `service_role`).
3. Cada pedido entra como `pending_review` (el sitio no verifica cobros) con su correo, método de pago y líneas; en Pago Móvil guarda además `monto_bs`/`tasa_bs` con la tasa BCV del momento. Consúltalos en el **Table Editor** de Supabase (o con la `service_role` desde el servidor) y márcalos `paid` cuando confirmes el comprobante.

Seguridad: la `anonKey` es pública por diseño; la protección es la **RLS de solo-INSERT**, y `registrar_pedido` corre como `SECURITY INVOKER` para que esa RLS siga aplicando. En Vercel, el `connect-src` de `vercel.json` ya incluye `https://*.supabase.co`; en GitHub Pages no hay CSP que ajustar.

## Catálogo, reseñas y actividad con Supabase (opcional)
Con el **mismo** `supabase` de `config.js` que los pedidos, el sitio puede sincronizar tres secciones. Si `url`/`anonKey` están vacíos, todo usa los datos locales (`data.js` y las reseñas de ejemplo) y el sitio funciona igual.

1. **Ejecuta `db/supabase_secciones.sql`** en el SQL Editor. Crea:
   - **`books`** — el catálogo. Lectura **pública** de los títulos `active`; nadie desde el navegador puede escribir.
   - **`reviews`** — reseñas. Cualquiera puede enviar (entra como `pending`); solo se leen las `approved` (apruébalas en el Table Editor).
   - **`section_events`** — actividad por sección: `view` al entrar en pantalla y `click` al pulsar el menú. Solo INSERT; nadie las lee.
2. **Carga el catálogo**: ejecuta `db/seed_books.sql` (copia de `data.js`). A partir de ahí edita los libros en el Table Editor; `data.js` queda como **respaldo** y se usa si Supabase falla o no está configurado.
3. **Mira la actividad** en el Table Editor (`section_events`) o con la `service_role` desde el servidor.

En `app.js`: `loadBooks()` sustituye el array `B` si Supabase devuelve filas; `loadRevs()` pinta las reseñas aprobadas (reemplazan los ejemplos) y `addRev()` envía la nueva como `pending`; `observeSections()` registra `view`/`click`. Son **best-effort**: si algo falla, no rompe la página.

> Al mover el catálogo a Supabase, la lista de libros deja de vivir solo en `data.js` + `books/MANIFIESTO.md`. **Mantén `data.js` y el MANIFIESTO actualizados igualmente**: son el respaldo y el registro de dominio público.

## Derechos
Solo se publican obras de **dominio público estricto** (autor fallecido + 70 años, traducción y edición también libres de copyright de terceros). Cada título debe estar registrado en `books/MANIFIESTO.md` con su URL de origen y su licencia antes de publicarse.

Quedan fuera: licencias con cláusula NC (CC BY-NC / BY-NC-SA), textos con copyright vivo (Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez) y PDFs de institutos que marcan `D.R.` (INEHRM). La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito (`precio = 0`), nunca a la venta.

Corrientes del catálogo: **Bolivariano, Martiano, Zapatista, Marxista, Antiimperialista, Latinoamericano.**
El código del sitio se publica bajo licencia MIT.
