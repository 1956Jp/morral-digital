# Plantillas de correo (EmailJS)

Correos **automáticos** al **cerrar un pedido** (`done()` → `notifyOrder()`) y al
pedir una **descarga gratuita** (`freeSend()` → `notifyFree()`), en `assets/js/app.js`.
Se envían desde la cuenta conectada (la del administrador) vía la API REST de EmailJS
(`POST https://api.emailjs.com/api/v1.0/email/send`), sin librerías.

- `plantilla-cliente.html` → **acuse + enlaces a los libros** al cliente/solicitante.
- `plantilla-admin.html` → **aviso de pago** al administrador.

En ambos casos, el correo del solicitante se guarda en Supabase (pedidos en `orders`;
descargas gratuitas en `solicitudes`) para poder consultarlo.

## Puesta en marcha

1. En [dashboard.emailjs.com](https://dashboard.emailjs.com) conecta un *Email
   Service* (Gmail/Outlook/SMTP…) y copia su **Service ID**.
2. Crea **dos plantillas** y pega el contenido de cada archivo en el campo
   *Content*. Ajusta **To Email** y **Subject** así:

   | Plantilla | To Email | Subject |
   | --- | --- | --- |
   | `plantilla-cliente.html` | `{{email}}` | `Tu morral de ideas libres — Pedido {{order_code}}` |
   | `plantilla-admin.html` | `abogjoseperez014@gmail.com` | `Nuevo pedido {{order_code}} — {{metodo}}` |

3. Copia los **dos Template IDs** y pega en `assets/js/config.js` →
   `emailjs`: `publicKey`, `serviceId`, `templateCliente`, `templateAdmin`.
4. Si `publicKey` o `serviceId` quedan vacíos, EmailJS se desactiva y el sitio
   funciona igual (`MAIL_ON = false`).

## Variables

| Variable | Contenido |
| --- | --- |
| `{{email}}` / `{{client_email}}` | Correo del cliente (To Email del correo al cliente) |
| `{{admin_email}}` | Correo del administrador |
| `{{order_code}}` | Código del pedido (`MD-XXXXXX`) |
| `{{metodo}}` | Método de pago (Tarjeta, PayPal, Pago Móvil, Cripto, Zinli) |
| `{{items}}` | Títulos separados por comas |
| `{{total}}` / `{{moneda}}` | Importe y divisa (`USD`) |
| `{{monto_bs}}` / `{{tasa_bs}}` | Monto en Bs y tasa BCV (solo Pago Móvil) |
| `{{enlaces}}` | Enlaces a los libros: en compras, los títulos + el **enlace web** donde se descargan («Mis descargas»); en descargas gratuitas, el enlace directo al libro. Vacío si `enviarEnlaces` es `false` (solo compras). |
| `{{whatsapp}}` | Enlace `wa.me` para enviar el comprobante |

Llaves **dobles** = valor escapado; llaves **triples** (`{{{enlaces}}}`) = HTML
sin escapar. Renderizado condicional: `{{#var}}…{{/var}}` y `{{^var}}…{{/var}}`.

## Seguridad

- La **Public Key** es pública por diseño (va en el navegador). **Nunca** pongas
  la clave privada (`accessToken`) en `config.js`.
- Limita el uso con el **Allowlist** de orígenes (EmailJS → Account → Security):
  añade `https://1956jp.github.io` y `http://localhost:8000`.
- EmailJS limita a **1 envío/segundo**: el código separa los dos correos ~1 s.
- En Vercel, `connect-src` de `vercel.json` ya incluye `https://api.emailjs.com`.

## Honestidad

El sitio es **estático y no verifica cobros**. En las **compras**, los archivos de
pago viven en el **bucket privado** `libros` y solo se sirven con URLs firmadas
cuando el pedido está `paid`. Por eso el correo al cliente **no adjunta archivos ni
URLs públicas**: incluye los títulos y el **enlace web donde se descarga** («Mis
descargas»), con el código del pedido y el correo. Con `enviarEnlaces: false` el
correo al cliente solo lleva el acuse.

En las **descargas gratuitas** (títulos de enlace libre) el correo sí lleva el enlace
directo al libro, y el correo del solicitante se guarda en la tabla `solicitudes`
(RLS de solo-INSERT) para consultarlo desde el panel de Supabase.
