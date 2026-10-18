# Estructura del proyecto — El Morral Digital

Sitio **estático** para GitHub Pages: `index.html` + CSS + JS vanila. No hay
build, ni `package.json`, ni tests automatizados. "Backend" aquí significa
**Supabase** (Postgres, Storage y Edge Functions) más los scripts de `db/`.

## 1. Frontend (corre en el navegador)

| Archivo | Rol |
| --- | --- |
| `index.html` | Marcado de la página: barra de navegación, hero, secciones (catálogo, reseñas, expansión), modales de morral y pago. Carga `config.js` → `data.js` → `app.js` como scripts clásicos. |
| `assets/css/styles.css` | Estilos, variables de color (`--bg`, `--card`, `--ink`, `--gold`, `--pollo`, `--sangre`…) y modo oscuro. |
| `assets/js/config.js` | Configuración central `CFG`: marca, textos, colores, secciones, métodos de pago, datos de cobro (`pago`), Supabase y EmailJS. |
| `assets/js/data.js` | Catálogo **semilla** `B`: 19 filas posicionales de 9 campos. Respaldo si Supabase no responde. |
| `assets/js/app.js` | Lógica: filtros, morral persistente (`localStorage`), checkout, descargas gratuitas (`freeBook`/`freeSend`), reclamo de descargas (`claim`), helpers de Supabase (`sbGet`/`sbInsert`), `saveOrder`/`saveSolicitud`, `notifyOrder`/`notifyFree` (EmailJS). |

## 2. Backend (Supabase + entrega protegida)

| Archivo | Rol |
| --- | --- |
| `db/supabase_pedidos.sql` | Tablas `orders` / `order_items`, RLS de solo-`INSERT` para `anon` y función atómica `registrar_pedido`. |
| `db/supabase_secciones.sql` | Tablas `books` / `reviews` / `section_events` (catálogo, reseñas y actividad). |
| `db/supabase_solicitudes.sql` | Tabla `solicitudes` (correo del solicitante + referencia `GR-XXXXXX` en descargas gratuitas; RLS de solo-`INSERT`). |
| `db/supabase_storage.sql` | Bucket **privado** `libros` (sin acceso `anon`). |
| `db/seed_books.sql` | Semilla del catálogo para la tabla `books` (copia de `data.js`). |
| `db/agregar-libro.mjs` | Atajo para añadir libro(s): valida la corriente, edita `data.js`/`seed_books.sql`/`MANIFIESTO.md`, sube el `?v=` e imprime el INSERT de Supabase (`--apply`, `--lote`; dry-run por defecto). |
| `db/subir_libros.sh` | Sube los 6 PDF/EPUB de pago al bucket `libros` usando la `service_role` (por variable de entorno). |
| `supabase/functions/entregar/index.ts` | Edge Function: valida `order_code` + `email` + `status='paid'` y devuelve URLs firmadas (~1 h). |

> La `service_role` **nunca** toca el navegador: solo la usa la Edge Function y
> el script de subida. La `anonKey` sí es pública (RLS insert-only protege la PII).

## 3. Infraestructura / despliegue

| Archivo | Rol |
| --- | --- |
| `servir.sh` | Servidor local de previsualización (bloquea dotfiles; prefijo `/morral-digital/`). |
| `.nojekyll` | Necesario para servir assets sin procesar en GitHub Pages. |
| `vercel.json` | CSP y cabeceras de seguridad (nosniff, X-Frame-Options, Referrer-Policy, COOP). |
| `.gitignore` | Excluye `.env`, `*.pem`, tokens, `.vercel/` y **los 6 libros de pago** (van al bucket, no al repo). |

## 4. Documentación

| Archivo | Rol |
| --- | --- |
| `README.md` | Visión general, instalación local, pagos, entrega protegida y seguridad. |
| `AGENTS.md` | Guía para agentes/desarrolladores: convenciones, gotchas y cacheo `?v=N`. |
| `books/MANIFIESTO.md` | Registro de dominio público: fuente, licencia y fecha por título. |
| `books/LEEME.txt` | Nota sobre los archivos movidos al bucket privado. |
| `emailjs/README.md` | Configuración de las plantillas de correo. |
| `emailjs/plantilla-cliente.html` | Plantilla del acuse al cliente (To Email = `{{email}}`). |
| `emailjs/plantilla-admin.html` | Plantilla del aviso al administrador. |
| `CLAUDE.md`, `.cursor/rules/project.mdc` | Reglas de asistentes. |
| `LICENSE` | Licencia del repositorio. |
| `docs/ESTRUCTURA.md` | Este documento. |
| `docs/RESULTADOS.md` | Informe de resultados y seguimiento. |

## 5. Flujo de datos

```
Cliente (navegador)
  │  morral → localStorage
  │  checkout() → saveOrder() ── POST /rpc/registrar_pedido ─► Supabase (orders, pending_review)
  │  done() → notifyOrder() ───── POST api.emailjs.com ──────► correo admin + cliente
  │  freeBook()/freeSend() (título gratis)
  │        ├─ saveSolicitud() ── INSERT ─► Supabase (solicitudes: correo + ref. GR-XXXXXX)
  │        └─ notifyFree() ───── POST api.emailjs.com ──────► correo al solicitante (enlace al libro)
  │
Admin
  │  recibe el comprobante por WhatsApp → verifica → marca status='paid' en Supabase
  │
Cliente («Mis descargas»)
  │  claim(code,email) ── POST /functions/v1/entregar ─► Edge Function
  │        └─ valida pago ─► firma URLs del bucket privado 'libros' ─► descarga
```

## 6. Administración desde WhatsApp

La verificación de pagos es **manual y se administra desde WhatsApp**
(`config.js → pago.whatsapp`):

1. Al cerrar el pedido, `done()` muestra el pedido como **pendiente de verificación**
   y un botón para enviar el comprobante por WhatsApp (también va en el correo).
2. El administrador recibe el comprobante en WhatsApp, lo verifica y cambia el
   estado del pedido a `paid` en el panel de Supabase (Table Editor).
3. A partir de ahí el cliente reclama sus descargas en «Mis descargas».

Estados válidos del pedido: `pending_review` → `paid` | `rejected` | `cancelled`.
