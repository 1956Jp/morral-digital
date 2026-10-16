# Plantillas de correo (EmailJS)

Correos **automáticos** al cerrar un pedido. El sitio los dispara solo desde
`done()` en `assets/js/app.js` (`notifyOrder()`), vía la API REST de EmailJS
(`POST https://api.emailjs.com/api/v1.0/email/send`), sin librerías.

- `plantilla-cliente.html` → **acuse + agradecimiento + descargas** al cliente.
- `plantilla-admin.html` → **aviso de pago** al administrador.

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
| `{{enlaces}}` | `<ul>` de descargas (vacío si `enviarEnlaces` es `false`) |
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

El sitio es **estático y no verifica cobros**; los PDF son públicos por URL. Con
`enviarEnlaces: true` el cliente recibe los enlaces de inmediato (por honor). Si
prefieres entregarlos solo tras confirmar el pago, pon `enviarEnlaces: false`: el
correo al cliente mostrará el aviso de *«cuando confirmemos tu pago…»*.
