# El Morral Digital

Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. **Todo el catálogo es gratuito** (obras de dominio público): se sostiene con **aportes voluntarios** para el desarrollo tecnológico.

## Estructura
- `index.html` – página principal
- `assets/css/styles.css` – estilos (paleta verde/azul, modo oscuro)
- `assets/js/config.js` – **configuración central** (textos, colores, secciones, aportes); edita aquí primero
- `assets/js/data.js` – catálogo (9 campos por fila, ver `AGENTS.md`); **todos los precios son 0**
- `assets/js/app.js` – lista de descargas (persistida en `localStorage`), filtros, descarga libre, aportes y reseñas
- `books/` – documentación (`MANIFIESTO.md`, `LEEME.txt`); los PDF/EPUB ya **no** se publican aquí (van al bucket privado `libros`, que se firma para descarga gratuita)
- `books/MANIFIESTO.md` – registro de dominio público (fuente, licencia, verificación)
- `emailjs/` – plantillas de correo listas para pegar en EmailJS (opcional)
- `supabase/functions/entregar/` – Edge Function que firma URLs de descarga gratuita
- `db/supabase_pedidos.sql` – esquema SQL de pedidos **histórico y retirado** (NO ejecutar); sus tablas ya se eliminaron con `db/supabase_limpieza.sql`
- `db/supabase_secciones.sql` – esquema SQL para catálogo, reseñas y actividad por sección (opcional)
- `db/supabase_storage.sql` – crea el bucket privado `libros` para los archivos descargables (opcional)
- `db/supabase_solicitudes.sql` – esquema SQL de solicitudes/contactos (opcional)
- `db/seed_books.sql` – catálogo inicial para la tabla `books` (opcional)

## Personalizar (sin tocar el código)
Casi todo se cambia en **`assets/js/config.js`**; `index.html`, `app.js` y `styles.css` solo si añades funciones nuevas.
- **Textos** (título, hero, catálogo, reseñas, expansión, footer, etiquetas de botones) → `marca` y `textos`.
- **Diseño/colores** → `colores` (se aplican a las variables CSS `--bg`, `--red`, `--gold`…); deja `""` para usar el CSS. Estilos avanzados en `assets/css/styles.css`.
- **Vistas/secciones** → `secciones` (`true`/`false` oculta Catálogo, Reseñas o Expansión) y `nav` (etiquetas del menú).
- **Métodos de aporte** → `metodosPago` (orden y visibilidad; hoy `["bank","crypto"]`) y `etiquetasPago`.
- **Datos de cobro (aportes)** → `pago` (Pago Móvil, Binance, WhatsApp, tasa de respaldo) y `aportes` (textos e importes sugeridos).
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

## Aportes (donaciones voluntarias)
El catálogo es **gratuito**: no hay precios ni checkout de libros. Lo único que se cobra son **aportes voluntarios** para sostener el desarrollo de la tecnología (hosting, dominio, herramientas y mantenimiento). El sitio es estático; no hay cobro automático ni verificación de pago. Configura en `assets/js/config.js`:
- `aportes` — `titulo`, `intro`, `montoMin`, `montoMax` e importes sugeridos (`montos`).
- `pago.pagomovil` — `banco`, `codigo` (0105 = Banco Mercantil), `telefono`, `cedula`, `titular`, `link` (web del banco que abre el botón «Abrir Mercantil en línea»), `qr` (imagen opcional).
- `pago.whatsapp` — número destino del comprobante, formato internacional sin `0` (p. ej. `584268901582`).
- `pago.vesRate` — respaldo si fallan las APIs de tasa (`0` = sin respaldo).
- `pago.binance` — `id`, `email`, `tlf` (solo identificadores **públicos**; nunca claves privadas, frases semilla ni 2FA) y `qr` opcional.

La tasa es la **oficial del BCV**, consultada automáticamente vía DolarApi (sin clave y con CORS) con respaldo local. El aporte por **Pago Móvil** convierte el monto a **Bs**; el de **Cripto** (Binance Pay) va 1:1 con USD/USDT. El usuario elige el importe, se le muestra un **concepto** (`MD-XXXXXX`) y un botón de **WhatsApp** para enviar el comprobante. No hay verificación automática del cobro.
- Otros métodos (Stripe Payment Links, MercadoPago, PayPal.me) pueden añadirse cambiando `metodosPago` y `method()` en `app.js`.

## Descarga libre (bucket privado + Edge Function)
Los PDF/EPUB **no** se publican en el repo. Viven en un **bucket privado** `libros` de Supabase Storage y se entregan con **URLs firmadas temporales** (~1 h). Ya **no hay pago ni verificación**: cualquier visitante puede descargar, porque todo el contenido es de dominio público.

1. **Crea el bucket**: ejecuta `db/supabase_storage.sql` en el SQL Editor (crea `libros` privado, sin políticas para `anon`).
2. **Sube los archivos** a `libros`. Tres opciones:
   - **Script incluido**: con tu `service_role` en el entorno, ejecuta `db/subir_libros.sh`:
     ```bash
     SUPABASE_URL="https://TU-PROYECTO.supabase.co" \
     SUPABASE_SERVICE_ROLE_KEY="eyJ..." ./db/subir_libros.sh
     ```
   - **Panel**: *Storage → libros → Upload*.
   - **CLI**: `supabase storage cp books/ariel.pdf ss:///libros/ariel.pdf`.
   Sube cada campo `archivo` de `data.js` (y `file` de la tabla `books`) con el mismo nombre. Los archivos locales **no** se versionan (`.gitignore`).
3. **Despliega la Edge Function**:
   ```bash
   supabase functions deploy entregar
   ```
   Recibe `{archivo}` (o `{archivos:[...]}`) y devuelve `{url, expires_in}` con la URL firmada, sin exigir pedido ni pago. Usa la `service_role` que Supabase inyecta como variable de entorno; **nunca** se expone al navegador. Código en `supabase/functions/entregar/index.ts`.
4. **Descarga en el sitio**: cada ficha con archivo muestra **«Descargar»**; `descargar(i)` llama a la Edge Function y abre la URL firmada (`download`). Si el libro solo tiene fuente en línea, muestra **«Leer gratis»** (`freeBook`), que abre el enlace y, opcionalmente, lo envía por correo y guarda el contacto en `solicitudes`.

> Nota: los libros con `archivo` (bucket) y los de solo `fuente` (enlace externo) conviven en el catálogo; la ficha decide el botón según el campo 6 de `data.js`.

## Correos con EmailJS (opcional)
En el flujo gratuito, al pedir el enlace de un libro de **solo fuente en línea** (`freeSend()`), el sitio envía al solicitante **un único correo** con el **enlace directo al libro** y guarda su correo en `solicitudes` con una referencia `GR-XXXXXX` (para consultarla en el Table Editor). En «Descargar» con bucket, el correo es opcional y va por el mismo camino (`descargarFile()` → `notifyFree`). Los correos salen desde la cuenta conectada (la del administrador) con un `POST` JSON a `https://api.emailjs.com/api/v1.0/email/send`, **sin librerías**, igual que la tasa del BCV y Supabase. Si `publicKey`/`serviceId` están vacíos, se desactiva y el sitio funciona igual. El aviso al administrador existió para el antiguo flujo de pedidos y **ya no se envía** (`plantilla-admin.html` queda como histórico).

1. **Crea la cuenta y conecta el servicio**: en [dashboard.emailjs.com](https://dashboard.emailjs.com) añade un *Email Service* (Gmail/Outlook/SMTP…). Copia su **Service ID** (`service_xxx`).
2. **Crea una plantilla** (*Email Templates*): el cuerpo listo para pegar está en `emailjs/plantilla-cliente.html` (ver `emailjs/README.md`).
   - **Al cliente** (`templateCliente`): en el campo **To Email** pon `{{email}}` (destinatario dinámico). Usa las variables de abajo. Si quieres HTML sin escapar, usa llaves triples (`{{{enlaces}}}`).
3. **Rellena `emailjs` en `assets/js/config.js`**: `publicKey` (Public Key de la cuenta), `serviceId`, `templateCliente` y `adminEmail` (`templateAdmin`/`enviarEnlaces` quedan reservados sin uso).
4. **Limita el origen**: en el panel de EmailJS activa el *Allowlist* (p. ej. `https://1956jp.github.io`, el dominio de Vercel y `http://localhost:8000`) para que solo tu sitio pueda usar la Public Key. Nota de diagnóstico: `404 Account not found` = cuenta/Service caídos (reconecta y actualiza los ID en `config.js`); `403` = origen sin permitir; `400` = Public Key inválida.

Variables que envía `notifyFree` (y qué recibe cada una):

| Variable | Contenido |
| --- | --- |
| `{{email}}` / `{{client_email}}` | Correo del solicitante (**To Email** de la plantilla) |
| `{{admin_email}}` | Correo del administrador (de `config.js`) |
| `{{order_code}}` | Referencia `GR-XXXXXX` de la solicitud |
| `{{metodo}}` | Texto fijo «Descarga gratuita» |
| `{{items}}` | Título del libro solicitado |
| `{{total}}` / `{{moneda}}` | `$0.00` / `USD` (el catálogo es gratuito) |
| `{{monto_bs}}` / `{{tasa_bs}}` | Vacíos (historial del flujo anterior; sin uso en el correo actual) |
| `{{enlaces}}` | Enlace directo a la fuente del libro + enlace al sitio |
| `{{whatsapp}}` | Enlace `wa.me` para comprar sobre el título por WhatsApp |

> **Límite importante:** el sitio es estático. Los archivos viven en el bucket privado `libros` y se entregan con URLs firmadas por la Edge Function (descarga libre). EmailJS limita a **1 envío por segundo**.

Seguridad: la **Public Key** es pública (va en el navegador); la protección es el *Allowlist* de orígenes. **Nunca** pongas en `config.js` la clave privada (`accessToken`). En Vercel, el `connect-src` de `vercel.json` ya incluye `https://api.emailjs.com`; en GitHub Pages no hay CSP que ajustar.

## Catálogo, reseñas y actividad con Supabase (opcional)
Con el **mismo** `supabase` de `config.js` (el modelo de pedidos ya está retirado; ver `db/supabase_limpieza.sql`), el sitio puede sincronizar tres secciones. Si `url`/`anonKey` están vacíos, todo usa los datos locales (`data.js` y las reseñas de ejemplo) y el sitio funciona igual.

1. **Ejecuta `db/supabase_secciones.sql`** en el SQL Editor. Crea:
   - **`books`** — el catálogo. Lectura **pública** de los títulos `active`; nadie desde el navegador puede escribir.
   - **`reviews`** — reseñas. Cualquiera puede enviar (entra como `pending`); solo se leen las `approved` (apruébalas en el Table Editor).
   - **`section_events`** — actividad por sección: `view` al entrar en pantalla y `click` al pulsar el menú. Solo INSERT; nadie las lee.
2. **Carga el catálogo**: ejecuta `db/seed_books.sql` (copia de `data.js`). A partir de ahí edita los libros en el Table Editor; `data.js` queda como **respaldo** y se usa si Supabase falla o no está configurado.
3. **Mira la actividad** en el Table Editor (`section_events`) o con la `service_role` desde el servidor.

En `app.js`: `loadBooks()` sustituye el array `B` si Supabase devuelve filas; `loadRevs()` pinta las reseñas aprobadas (reemplazan los ejemplos) y `addRev()` envía la nueva como `pending`; `observeSections()` registra `view`/`click`. Son **best-effort**: si algo falla, no rompe la página.

> Al mover el catálogo a Supabase, la lista de libros deja de vivir solo en `data.js` + `books/MANIFIESTO.md`. **Mantén `data.js` y el MANIFIESTO actualizados igualmente**: son el respaldo y el registro de dominio público.

## Derechos
Solo se publican obras de **dominio público estricto** (autor fallecido + 70 años, traducción y edición también libres de copyright de terceros). Cada título debe estar registrado en `books/MANIFIESTO.md` con su URL de origen y su licencia antes de publicarse. **Todo el catálogo se ofrece de forma gratuita.**

Quedan fuera: licencias con cláusula NC (CC BY-NC / BY-NC-SA), textos con copyright vivo (Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez) y PDFs de institutos que marcan `D.R.` (INEHRM). La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito, nunca como archivo propio.

Corrientes del catálogo: **Bolivariano, Martiano, Zapatista, Marxista, Antiimperialista, Latinoamericano, Clásico.**
El código del sitio se publica bajo licencia MIT.
