# Resultados y seguimiento — El Morral Digital

Informe de estado del trabajo. La administración de pedidos se gestiona
**desde WhatsApp** (ver `docs/ESTRUCTURA.md` §6). Última actualización: Fase 2
+ endurecimiento de pedidos y limpieza de duplicados.

## 1. Resumen por fase

| Fase | Descripción | Estado |
| --- | --- | --- |
| Fase 1 | Morral persistente en `localStorage` (guarda **títulos**, no índices) | ✅ Completada y verificada |
| Fase 2 | Entrega protegida: pedidos en Supabase + bucket privado + Edge Function + reclamo | 🟡 Implementada; falta subir archivos y config de correo |
| Fase 0 | Endurecimiento (XSS, accesibilidad, contraste) | ⬜ Pendiente |

## 2. Hecho

- **Fase 1 — morral persistente.** El carrito se guarda en `localStorage`
  (`morral-digital:cart:v1`) por **título** (id estable). Helpers `rowOf`,
  `cartRows`, `cartTitles`, `saveCart`, `loadCart`. Se limpia al cerrar el pedido.
- **Supabase (proyecto `uzqadthbjhhdhoqlnupn`).**
  - `orders` / `order_items` + RLS insert-only + RPC `registrar_pedido`.
  - `books` / `reviews` / `section_events`; catálogo sembrado (19 filas).
  - `solicitudes` (correo del solicitante + ref. `GR-XXXXXX` en descargas gratuitas) + RLS insert-only.
  - Bucket privado `libros`.
- **Edge Function `entregar`** desplegada: valida correo + `status='paid'` y
  firma URLs temporales.
- **Sitio.** `config.js` con `supabase.url` + `anonKey`; botón **Mis descargas**;
  flujo `claim()` / `claimBlock()` / `openClaim()`; `done()` marca el pedido
  `pending_review` y ya no ofrece descargas públicas.
- **Los 6 PDF/EPUB de pago salieron de `books/`** (untracked + `.gitignore`):
  viven en el bucket privado.
- **Documentación** (`README`, `AGENTS`, `MANIFIESTO`, `LEEME`, `emailjs/`).
- **Reconciliación de git.** Se fusionó el `origin/main` divergente (subidas
  manuales por la web) conservando la versión local y eliminando duplicados
  (`drago-caso-venezuela.pdf` y 3 `.sql` en la raíz).
- **Correo.** `sendMail()` registra errores de EmailJS; `config.js` ya tiene
  `publicKey`, `serviceId` y los dos Template IDs. Al cerrar un pedido se avisa
  al admin y se acusa al cliente; en descargas gratuitas (`freeSend`) se envía
  al solicitante el enlace al libro y su correo queda en `solicitudes` con una
  referencia `GR-XXXXXX`.
- **Endurecimiento de pedidos.** Se asegura `orderCode` antes de guardar y se
  capturan las promesas de `saveOrder`/`notifyOrder`.
- **Limpieza.** Se eliminó un `index.ts` duplicado subido a la raíz; assets a `?v=27`.

## 3. Pendiente / bloqueos

| # | Pendiente | Detalle |
| --- | --- | --- |
| B1 | **Subir los 6 archivos al bucket `libros`** | `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./db/subir_libros.sh` (o panel/CLI). Hasta entonces, los reclamos pagados devuelven `kind:"none"`. |
| B2 | **Probar el envío de EmailJS** | Los IDs ya están en `config.js` (`MAIL_ON=true`). Falta verificar en el panel el *Allowlist* de orígenes y probar los dos correos (pedido y descarga gratuita). |
| B3 | **Push a GitHub** | Falta credencial: registrar la llave SSH o usar un PAT con scope `repo`. |
| N1 | Reescribir historia (opcional) | El PDF de pago sigue en el historial (`b8e7945`); requiere force-push. |

## 4. Verificación (evidencia)

- `node --check assets/js/*.js` → OK.
- Navegador: catálogo carga 19 libros desde Supabase; **0 errores** en consola.
- `saveOrder` → HTTP 200; pedidos reales `pending_review` creados.
- `entregar`: `not_found` (código inexistente), `forbidden` (correo no coincide),
  `paid` → `{status:"paid", links:[… kind:"none"]}` (bucket aún vacío).
- Reclamo de pedido pendiente → «Tu pago aún no está verificado…».
- Avisos de Supabase: 0 de seguridad; solo INFO de índices sin uso.

## 5. Administración desde WhatsApp

1. El cliente cierra el pedido y envía el comprobante por **WhatsApp**
   (`done()` deja el pedido `pending_review`).
2. El administrador lo verifica y cambia el estado a **`paid`** en Supabase.
3. El cliente descarga desde **«Mis descargas»** (código + correo).

## 6. Próximos pasos

1. **B2** → verificar el *Allowlist* de EmailJS y probar el envío (pedido y descarga gratuita: comprobar que el correo del solicitante entra en `solicitudes`).
2. **B1** → subir los 6 libros al bucket; probar la descarga real (URLs firmadas).
3. **B3** → autorizar el push y desplegar en GitHub Pages.
4. **Fase 0** → saneado (escapado XSS en `draw()`, contraste en modo oscuro,
   Esc/trampa de foco/etiquetas en modales).
