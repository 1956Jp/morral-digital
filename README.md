# El Morral Digital

Librería digital de pensamiento bolivariano, martiano, zapatista, marxista, antiimperialista y latinoamericano. Obras de dominio público, a precio solidario ($1–$2 USD).

## Estructura
- `index.html` – página principal
- `assets/css/styles.css` – estilos (paleta verde/azul, modo oscuro)
- `assets/js/data.js` – catálogo (9 campos por fila, ver `AGENTS.md`)
- `assets/js/app.js` – morral, filtros, pago, descargas y reseñas
- `books/` – archivos PDF/EPUB
- `books/MANIFIESTO.md` – registro de dominio público (fuente, licencia, verificación)

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub (p. ej. `morral-digital`).
2. Sube todo el contenido de esta carpeta.
3. Ve a *Settings → Pages* y elige *Deploy from a branch → main → / (root)*.
4. Tu sitio quedará en `https://TU-USUARIO.github.io/morral-digital/`.

## Pagos reales
GitHub Pages es un servidor estático: el pago actual es una **demostración**. Opciones sin servidor propio:
- **PayPal.me** (ya integrado): la pestaña PayPal abre `https://paypal.me/{PAYPAL_USER}/{importe}USD`. Cambia `PAYPAL_USER` en `assets/js/app.js` (por defecto `morraldigital`). El sufijo `USD` fija la divisa del importe.
- **Stripe Payment Links** o **botones de PayPal**: crea un enlace por libro y colócalo en `app.js` en lugar de `done()`.
- **MercadoPago** (enlaces de pago) para Latinoamérica.
Para entregar archivos solo tras el pago se necesita un backend (p. ej. Netlify/Vercel Functions o Stripe + webhook); con PayPal.me no se verifica el cobro.

## Derechos
Solo se publican obras de **dominio público estricto** (autor fallecido + 70 años, traducción y edición también libres de copyright de terceros). Cada título debe estar registrado en `books/MANIFIESTO.md` con su URL de origen y su licencia antes de publicarse.

Quedan fuera: licencias con cláusula NC (CC BY-NC / BY-NC-SA), textos con copyright vivo (Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez) y PDFs de institutos que marcan `D.R.` (INEHRM). La corriente zapatista contemporánea (EZLN) se ofrece solo como enlace gratuito (`precio = 0`), nunca a la venta.

Corrientes del catálogo: **Bolivariano, Martiano, Zapatista, Marxista, Antiimperialista, Latinoamericano.**
El código del sitio se publica bajo licencia MIT.
