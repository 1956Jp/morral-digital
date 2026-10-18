# El Morral Digital

Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Obras de dominio público, a precio solidario ($1–$1,50 USD).

## Estructura
- `index.html` – página principal
- `assets/css/styles.css` – estilos (paleta verde/azul, modo oscuro)
- `assets/js/config.js` – **configuración central** (textos, colores, secciones, pagos); edita aquí primero
- `assets/js/data.js` – catálogo (9 campos por fila, ver `AGENTS.md`)
- `assets/js/app.js` – morral (persistido en `localStorage`), filtros, pago, entrega y reseñas
- `books/` – documentación (`MANIFIESTO.md`, `LEEME.txt`); los PDF/EPUB de pago ya **no** se publican aquí (van al bucket privado `libros`)
- `books/MANIFIESTO.md` – registro de dominio público (fuente, licencia, verificación)
- `emailjs/` – plantillas de correo (cliente y admin) listas para pegar en EmailJS (opcional)
- `supabase/functions/entregar/` – Edge Function de entrega con URLs firmadas (Fase 2)
- `db/supabase_pedidos.sql` – esquema SQL para registrar pedidos en Supabase (opcional)
- `db/supabase_secciones.sql` – esquema SQL para catálogo, reseñas y actividad por sección (opcional)
- `db/supabase_storage.sql` – crea el bucket privado `libros` para los archivos de pago (opcional)
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
  La tasa es la **oficial del BCV**, consultada automáticamente vía DolarApi (sin clave y con CORS) con respaldo local. El pedido queda **pendiente de verificación** hasta que confirmes el comprobante; la entrega es con URLs firmadas (ver «Entrega protegida»).
- **Stripe Payment Links** o **botones de PayPal**: crea un enlace por libro y colócalo en `app.js` en lugar de `done()`.
- **Cripto** (ya integrado, cobro manual): la pestaña «Cripto» muestra tu **Binance Pay** (`pago.binance` en `config.js`: `id`, `email`, `tlf` públicos) y el total en USDT (1:1 con USD). Igual que el Pago Móvil, el pedido queda **pendiente de verificación**. Por seguridad solo se publican identificadores públicos (nunca claves privadas, frases semilla ni 2FA). QR opcional en `assets/img/binance-qr.png`.
- **MercadoPago** (enlaces de pago) para Latinoamérica.
Para entregar archivos solo tras el pago, este proyecto usa **Supabase Storage con URLs firmadas** (ver «Entrega protegida» abajo); no hace falta un backend propio. Para cobro *automático* sí se necesita una función serverless con webhook (Stripe/PayPal/MercadoPago).

## Registrar pedidos con Supabase (opcional)
Al confirmar un pedido (`done()` en `app.js`), el sitio lo registra en [Supabase](https://supabase.com) vía su API REST (PostgREST), sin librerías ni build. Es opcional: si no lo configuras, todo sigue igual.

1. **Ejecuta el esquema**: pega el contenido de `db/supabase_pedidos.sql` en el **SQL Editor** de Supabase y pulsa Run. Crea:
   - `orders` — una fila por pedido (`order_code`, `customer_email`, `payment_method`, `status`, `total_amount`, `monto_bs`, `tasa_bs`, `created_at`…).
   - `order_items` — una fila por libro (`book_title`, `unit_price`, `quantity`), con `on delete cascade` hacia `orders`.
   - Índices, **RLS con políticas de solo-INSERT para `anon`** (el navegador no puede leer pedidos: la PII del correo queda protegida) y la función atómica **`registrar_pedido(...)`**, que inserta pedido y líneas en una sola transacción (si algo falla, no queda un pedido sin libros).
2. **Rellena `supabase` en `assets/js/config.js`**: `url` (`https://TU-PROYECTO.supabase.co`) y `anonKey` (clave **anónima** pública; **nunca** la `service_role`).
3. Cada pedido entra como `pending_review` (el sitio no verifica cobros) con su correo, método de pago y líneas; en Pago Móvil guarda además `monto_bs`/`tasa_bs` con la tasa BCV del momento. Consúltalos en el **Table Editor** de Supabase (o con la `service_role` desde el servidor) y márcalos `paid` cuando confirmes el comprobante.

Seguridad: la `anonKey` es pública por diseño; la protección es la **RLS de solo-INSERT**, y `registrar_pedido` corre como `SECURITY INVOKER` para que esa RLS siga aplicando. En Vercel, el `connect-src` de `vercel.json` ya incluye `https://*.supabase.co`; en GitHub Pages no hay CSP que ajustar.

> Nota: `registrar_pedido` genera el `id` con `gen_random_uuid()` y **no** usa `insert ... returning`; eso exigiría una política SELECT para `anon`, que no existe a propósito (protege la PII del correo).

**Descargas gratuitas.** Los títulos de enlace libre (precio `0`) no entran al morral: al pulsar *Leer gratis* el sitio pide el **correo del solicitante** y lo guarda en la tabla `solicitudes` (`db/supabase_solicitudes.sql`, misma RLS de solo-INSERT). Así puedes consultar quién pidió cada título desde el Table Editor. El enlace se envía por correo (ver EmailJS).

## Entrega protegida (Fase 2)
Los PDF/EPUB de pago **no** se publican en el repo. Viven en un **bucket privado** `libros` de Supabase Storage y se entregan con **URLs firmadas temporales** (~1 h) solo cuando el pedido está `paid`. Sin `service_role` en el navegador.

1. **Crea el bucket**: ejecuta `db/supabase_storage.sql` en el SQL Editor (crea `libros` privado, sin políticas para `anon`).
2. **Sube los archivos** a `libros`. Tres opciones:
   - **Script incluido** (más fácil): con tu `service_role` en el entorno, ejecuta `db/subir_libros.sh`:
     ```bash
     SUPABASE_URL="https://TU-PROYECTO.supabase.co" \
     SUPABASE_SERVICE_ROLE_KEY="eyJ..." ./db/subir_libros.sh
     ```
   - **Panel**: *Storage → libros → Upload* (arrastra y suelta los 6 archivos).
   - **CLI**: `supabase storage cp books/ariel.pdf ss:///libros/ariel.pdf`.
   Sube cada campo `archivo` de `data.js` (y `file` de la tabla `books`) con el mismo nombre. Los archivos locales se quedan en tu equipo para subirlos, pero **no se versionan** (`.gitignore`).
3. **Despliega la Edge Function**:
   ```bash
   supabase functions deploy entregar
   ```
   Usa la `service_role` que Supabase inyecta como variable de entorno; **nunca** se expone al navegador. Código en `supabase/functions/entregar/index.ts`.
4. **Verifica el pago**: en el Table Editor de Supabase cambia el pedido de `pending_review` a `paid`. A partir de ahí el cliente reclama.
5. **Reclamo del cliente**: en el sitio, tras confirmar el pedido (`done()`) aparece **«Comprobar y descargar»**; y siempre desde el botón **Mis descargas** del menú, introduciendo el **código de pedido** + su **correo**. `claim()` llama a la Edge Function `entregar`, que valida código + correo + estado `paid` y devuelve las URLs firmadas.

Seguridad: la Edge Function corre con `verify_jwt=true` (la `anonKey` es un JWT válido) y exige que el correo coincida con el del pedido, para no exponer descargas a quien solo adivine el código. Los enlaces caducan (~1 h); el cliente puede volver a generarlos desde «Mis descargas».

## Correos con EmailJS (opcional)
Al confirmar un pedido, el sitio puede enviar **dos correos** con [EmailJS](https://www.emailjs.com): un **acuse al cliente** (con los títulos y el **enlace web donde se descargan** — «Mis descargas» —, si `enviarEnlaces` es `true`) y un **aviso de pago al administrador** con el tipo de producto pedido. Al pedir una **descarga gratuita** (`freeSend()`), se envía al solicitante un correo con el **enlace directo al libro** y se guarda su correo en `solicitudes` con una referencia `GR-XXXXXX` que aparece también en el correo (para cruzarlos). Los correos salen desde la cuenta conectada (la del administrador) con un `POST` JSON a `https://api.emailjs.com/api/v1.0/email/send`, **sin librerías**, igual que la tasa del BCV y Supabase. Si `publicKey`/`serviceId` están vacíos, se desactiva y el sitio funciona igual.

1. **Crea la cuenta y conecta el servicio**: en [dashboard.emailjs.com](https://dashboard.emailjs.com) añade un *Email Service* (Gmail/Outlook/SMTP…). Copia su **Service ID** (`service_xxx`).
2. **Crea dos plantillas** (*Email Templates*): el cuerpo listo para pegar está en `emailjs/plantilla-cliente.html` y `emailjs/plantilla-admin.html` (ver `emailjs/README.md`).
   - **Al cliente** (`templateCliente`): en el campo **To Email** pon `{{email}}` (destinatario dinámico). Usa las variables de abajo. Si quieres HTML sin escapar, usa llaves triples (`{{{enlaces}}}`).
   - **Al administrador** (`templateAdmin`): en **To Email** pon tu correo (o `{{admin_email}}`).
3. **Rellena `emailjs` en `assets/js/config.js`**: `publicKey` (Public Key de la cuenta), `serviceId`, `templateCliente`, `templateAdmin`, `adminEmail` y `enviarEnlaces`.
4. **Limita el origen**: en el panel de EmailJS activa el *Allowlist* (p. ej. `https://1956jp.github.io`, el dominio de Vercel y `http://localhost:8000`) para que solo tu sitio pueda usar la Public Key.

Variables disponibles en las plantillas (todas las recibe cada correo):

| Variable | Contenido |
| --- | --- |
| `{{email}}` / `{{client_email}}` | Correo del cliente (To Email del correo al cliente) |
| `{{admin_email}}` | Correo del administrador |
| `{{order_code}}` | Código del pedido (p. ej. `MD-AB12CD`) |
| `{{metodo}}` | Método de pago (Tarjeta, PayPal, Pago Móvil, Cripto…) |
| `{{items}}` | Lista de títulos separados por comas |
| `{{total}}` / `{{moneda}}` | Importe (`$12.00`) y divisa (`USD`) |
| `{{monto_bs}}` / `{{tasa_bs}}` | Monto en Bs y tasa BCV (solo Pago Móvil) |
| `{{enlaces}}` | Enlaces a los libros: en compras, los títulos + el **enlace web** donde se descargan («Mis descargas»); en descargas gratuitas, el enlace directo al libro. Vacío si `enviarEnlaces` es `false` (solo compras) |
| `{{whatsapp}}` | Enlace `wa.me` para enviar el comprobante del pedido por WhatsApp |

> **Límite importante:** el sitio es estático y **no verifica cobros**; los archivos de pago viven en el bucket privado `libros`. El correo **no adjunta archivos ni URLs públicas de pago**: incluye los títulos y el enlace web donde se descargan. Con `enviarEnlaces: false` solo va el acuse. En las **descargas gratuitas** sí se envía el enlace directo al libro. La entrega real (URLs firmadas) la controla el estado `paid` del pedido. EmailJS limita a **1 envío por segundo**: el código separa los dos correos ~1 s.

Seguridad: la **Public Key** es pública (va en el navegador); la protección es el *Allowlist* de orígenes. **Nunca** pongas en `config.js` la clave privada (`accessToken`). En Vercel, el `connect-src` de `vercel.json` ya incluye `https://api.emailjs.com`; en GitHub Pages no hay CSP que ajustar.

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

Corrientes del catálogo: **Bolivariano, Martiano, Zapatista, Marxista, Antiimperialista, Latinoamericano, Clásico.**
El código del sitio se publica bajo licencia MIT.
