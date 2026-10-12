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

## Personalizar (sin tocar el código)
Casi todo se cambia en **`assets/js/config.js`**; `index.html`, `app.js` y `styles.css` solo si añades funciones nuevas.
- **Textos** (título, hero, catálogo, reseñas, expansión, footer, etiquetas de botones) → `marca` y `textos`.
- **Diseño/colores** → `colores` (se aplican a las variables CSS `--bg`, `--red`, `--gold`…); deja `""` para usar el CSS. Estilos avanzados en `assets/css/styles.css`.
- **Vistas/secciones** → `secciones` (`true`/`false` oculta Catálogo, Reseñas o Expansión) y `nav` (etiquetas del menú).
- **Métodos de pago** → `metodosPago` (orden y visibilidad; quita los que no uses) y `etiquetasPago`.
- **Datos de cobro** → `pago` (PayPal, Pago Móvil, Binance, WhatsApp, tasa de respaldo).
- **Libros** → `assets/js/data.js` + `books/MANIFIESTO.md` (ver «Añadir un libro» en `AGENTS.md`).
- **Funciones nuevas** → añade el código en `assets/js/app.js`; los textos/etiquetas que uses, léelos de `CFG`.
- **Al cambiar CSS/JS**, sube el número de versión en `index.html` (`assets/...?v=3`) para evitar cachés del navegador.

## Previsualizar en local
```bash
./servir.sh            # red local, con el mismo prefijo que en Pages
#   local -> http://localhost:8000/morral-digital/
#   red   -> http://TU-IP:8000/morral-digital/
```
Sin el script: `python3 -m http.server 8000` desde esta carpeta → `http://localhost:8000`.

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub (p. ej. `morral-digital`).
2. Sube todo el contenido de esta carpeta.
3. Ve a *Settings → Pages* y elige *Deploy from a branch → main → / (root)*.
4. Tu sitio quedará en `https://TU-USUARIO.github.io/morral-digital/`.

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

## Derechos
Solo se publican obras de **dominio público estricto** (autor fallecido + 70 años, traducción y edición también libres de copyright de terceros). Cada título debe estar registrado en `books/MANIFIESTO.md` con su URL de origen y su licencia antes de publicarse.

Quedan fuera: licencias con cláusula NC (CC BY-NC / BY-NC-SA), textos con copyright vivo (Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez) y PDFs de institutos que marcan `D.R.` (INEHRM). La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito (`precio = 0`), nunca a la venta.

Corrientes del catálogo: **Bolivariano, Martiano, Zapatista, Marxista, Antiimperialista, Latinoamericano.**
El código del sitio se publica bajo licencia MIT.
