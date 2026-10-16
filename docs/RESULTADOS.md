# Resultados y seguimiento — El Morral Digital

Informe de estado del trabajo. La administración de pedidos se gestiona
**desde WhatsApp** (ver `docs/ESTRUCTURA.md` §6). Última actualización: sesión
de Fase 2.

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
  - `books` / `reviews` / `section_events`; catálogo sembrado (14 filas).
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
- **Correo.** `sendMail()` ahora registra errores de EmailJS. Assets a `?v=20`.

## 3. Pendiente / bloqueos

| # | Pendiente | Detalle |
| --- | --- | --- |
| B1 | **Subir los 6 archivos al bucket `libros`** | `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./db/subir_libros.sh` (o panel/CLI). Hasta entonces, los reclamos pagados devuelven `kind:"none"`. |
| B2 | **Credenciales de EmailJS** | Pegar `serviceId`, `templateCliente`, `templateAdmin` en `config.js`. Sin ellas `MAIL_ON=false` y no se envía nada. |
| B3 | **Push a GitHub** | Falta credencial: registrar la llave SSH o usar un PAT con scope `repo`. |
| N1 | Reescribir historia (opcional) | El PDF de pago sigue en el historial (`b8e7945`); requiere force-push. |

## 4. Verificación (evidencia)

- `node --check assets/js/*.js` → OK.
- Navegador: catálogo carga 14 libros desde Supabase; **0 errores** en consola.
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

1. **B2** → configurar EmailJS y pegar los 3 IDs; verificar el envío con Playwright.
2. **B1** → subir los 6 libros al bucket; probar la descarga real (URLs firmadas).
3. **B3** → autorizar el push y desplegar en GitHub Pages.
4. **Fase 0** → saneado (escapado XSS en `draw()`, contraste en modo oscuro,
   Esc/trampa de foco/etiquetas en modales).
