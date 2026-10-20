# Plantillas de correo (EmailJS)

El sitio envía **un solo correo automático**: el de **descarga gratuita**, disparado
en `freeSend()` → `notifyFree(email, row, code)` de `assets/js/app.js`. Va al
**solicitante** con el **enlace directo al libro** (campo 7 de la fila) y una
referencia `GR-XXXXXX`. Se envía desde la cuenta conectada (la del administrador)
vía la API REST de EmailJS (`POST https://api.emailjs.com/api/v1.0/email/send`),
sin librerías.

> El antiguo flujo de **pedidos/compras** (y el correo de aviso al administrador
> `notifyOrder`) **se eliminó** junto con el modelo de pago: el catálogo es 100 %
> gratuito. Por eso ya **no** se usa `templateAdmin` ni `plantilla-admin.html`
> (se conservan solo como referencia histórica).

## Puesta en marcha

1. En [dashboard.emailjs.com](https://dashboard.emailjs.com) conecta un *Email
   Service* (Gmail/Outlook/SMTP…) y copia su **Service ID**.
2. Crea **una plantilla** y pega el contenido de `plantilla-cliente.html` en el
   campo *Content*. Ajusta **To Email** y **Subject** así:

   | Plantilla | To Email | Subject |
   | --- | --- | --- |
   | `plantilla-cliente.html` | `{{email}}` | `Tu enlace de descarga — {{items}}` |

3. Copia la **Public Key**, el **Service ID** y el **Template ID** y pégalos en
   `assets/js/config.js` → `emailjs`: `publicKey`, `serviceId`, `templateCliente`.
   (`templateAdmin`/`adminEmail`/`enviarEnlaces` son reservados y hoy no se usan.)
4. Si `publicKey` o `serviceId` quedan vacíos, EmailJS se desactiva y el sitio
   funciona igual (`MAIL_ON = false`): el enlace al libro se muestra en pantalla.

## Variables

Variables que manda `notifyFree` (`{{{enlaces}}}` lleva HTML):

| Variable | Contenido |
| --- | --- |
| `{{email}}` / `{{client_email}}` | Correo del solicitante (To Email) |
| `{{admin_email}}` | Correo del administrador (remitente/Reply-To) |
| `{{order_code}}` | Referencia de la solicitud (`GR-XXXXXX`) |
| `{{metodo}}` | «Descarga gratuita» |
| `{{items}}` | Título del libro solicitado |
| `{{total}}` / `{{moneda}}` | `0.00` / `USD` (el catálogo es gratuito) |
| `{{monto_bs}}` / `{{tasa_bs}}` | Vacíos en descargas gratuitas |
| `{{{enlaces}}}` | Bloque HTML con el enlace directo al libro + enlace a la tienda |
| `{{whatsapp}}` | Enlace `wa.me` para consultas |

Llaves **dobles** = valor escapado; llaves **triples** (`{{{enlaces}}}`) = HTML
sin escapar. Renderizado condicional: `{{#var}}…{{/var}}` y `{{^var}}…{{/var}}`.

## Seguridad

- La **Public Key** es pública por diseño (va en el navegador). **Nunca** pongas
  la clave privada (`accessToken`) en `config.js`.
- Limita el uso con el **Allowlist** de orígenes (EmailJS → Account → Security):
  añade `https://1956jp.github.io` y (si usas Vercel) tu dominio, más
  `http://localhost:8000` para pruebas locales. **Sin el Allowlist configurado, la
  cuenta no atenderá las peticiones desde el sitio.**
- EmailJS limita a **1 envío/segundo** por cuenta.
- En Vercel, `connect-src` de `vercel.json` ya incluye `https://api.emailjs.com`.

## Honestidad

El sitio es **estático**: el correo de descarga gratuita incluye el **enlace
directo a la fuente** (campo 7 de la fila), no un archivo adjunto. Los libros con
archivo propio se sirven aparte, en la página, con una **URL firmada** del bucket
privado `libros` vía la Edge Function `entregar`. El correo del solicitante se
guarda en la tabla `solicitudes` (RLS de solo-INSERT) para consultarlo desde el
panel de Supabase.

## Diagnóstico rápido

Si el correo no llega, comprueba en orden:

1. **¿Sigue viva la cuenta?** `curl` a la API con tu Public Key; `404 Account not
   found` significa que la cuenta/plan caducó o fue eliminada (hay que reconectar).
2. **Allowlist de orígenes** con el dominio real desde el que se prueba.
3. **IDs en `config.js`** (`publicKey`, `serviceId`, `templateCliente`) sin
   espacios ni comillas de más.
4. **Consola del navegador**: `sendMail()` registra `EmailJS <tpl> HTTP <status>`
   cuando falla; el sitio no se rompe (best-effort).
