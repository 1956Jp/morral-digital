# Resultados y seguimiento — El Morral Digital

Informe de estado del trabajo. Los aportes se confirman **manualmente por
WhatsApp** (ver `docs/ESTRUCTURA.md` §6); no hay verificación de cobros ni
entrega condicionada. Última actualización: **modelo 100 % gratuito + aportes
voluntarios** y descarga libre vía Edge Function.

## 1. Resumen por fase

| Fase | Descripción | Estado |
| --- | --- | --- |
| Fase 1 | Lista de descargas persistente en `localStorage` (guarda **títulos**, no índices) | ✅ Completada y verificada |
| Iteración actual | Catálogo 100 % gratuito + aportes voluntarios; descarga libre vía Edge Function; morral como lista de descargas | ✅ Implementada; falta subir archivos y verificar correo |
| Fase 0 | Endurecimiento (XSS, accesibilidad, contraste) | ⬜ Pendiente |

## 2. Hecho

- **Modelo gratuito + aportes (iteración actual).** Las 26 filas de `data.js`
  tienen `precio = 0`: no hay compra, pedido ni estados `pending_review`/`paid`.
  Cada ficha muestra «Gratis» con **Descargar** (si hay archivo) o **Leer gratis**
  (si solo hay fuente) más un botón «＋ Añadir» a la lista de descargas. El
  morral pasó de carrito de compra a **lista de descargas** (sin precios ni
  total; panel con «Hacer un aporte» y «Seguir leyendo»). El menú añadió el
  botón **Aportes**.
- **Aportes (donaciones voluntarias).** Bloque `CFG.aportes` (importes rápidos
  $1/$3/$5/$10 o personalizado, tope de cordura). `openAportes()`/`method()`
  ofrecen **Pago Móvil** (monto en Bs con tasa BCV) y **Cripto** (Binance Pay,
  USDT 1:1) con concepto `MD-XXXXXX`; `done()` registra el aporte en
  `solicitudes` (`book_title="Aporte"`, best-effort) y agradece con botón de
  WhatsApp. Se eliminaron `saveOrder`, `notifyOrder`, `claim`/`claimBlock`/
  `openClaim` y «Mis descargas».
- **Descarga libre.** La Edge Function `entregar` se reescribió: recibe
  `{archivo}` o `{archivos:[...]}`, valida el nombre (`^[A-Za-z0-9._-]+$`) y
  devuelve `{url, expires_in}` (URLs firmadas ~1 h) sin exigir pedido, correo
  ni `paid`. `descargar(i)` la usa desde la ficha y la lista; si falla, cae al
  enlace de la fuente (campo 7). 8 libros con archivo en el bucket privado
  `libros` (los tomos de *El imperialismo petrolero* se ofrecen como lectura
  gratuita, con disposición a retirarlos a solicitud de sus derechohabientes).
- **Supabase.** `orders`/`order_items`/`registrar_pedido` quedan **fuera del
  flujo** (esquema histórico en `db/supabase_pedidos.sql`); `books` quedó con
  `price = 0`. `solicitudes` ahora registra **descargas gratuitas**
  (ref. `GR-XXXXXX`) y **aportes** (ref. `MD-XXXXXX`).
- **Fase 1 — lista persistente.** Se guarda en `localStorage`
  (`morral-digital:cart:v1`) por **título** (id estable). Helpers `rowOf`,
  `cartRows`, `cartTitles`, `saveCart`, `loadCart`.
- **Sitio.** `config.js` con `supabase.url` + `anonKey`; textos nuevos
  (`catalogoSub`, `catalogoNota`, `morralTitulo`, `botonDescargar`…); assets a
  `?v=37`.
- **Documentación** (`README`, `AGENTS`, `MANIFIESTO`, `LEEME`, `emailjs/`,
  `ESTRUCTURA`, este informe) actualizada al modelo gratuito.
- **Reconciliación de git** (iteración anterior). Se fusionó el `origin/main`
  divergente (subidas manuales por la web) conservando la versión local y
  eliminando duplicados (`drago-caso-venezuela.pdf` y 3 `.sql` en la raíz).
- **Correo.** `sendMail()` registra errores de EmailJS. Queda el correo de
  descarga gratuita (`freeSend`/`notifyFree`: enlace a la fuente + ref. `GR-XXXXXX`
  en `solicitudes`); el aviso al admin (`notifyOrder`) se eliminó.
- **Limpieza.** Se eliminó un `index.ts` duplicado subido a la raíz.

## 3. Pendiente / bloqueos

| # | Pendiente | Detalle |
| --- | --- | --- |
| B1 | **Subir los 8 archivos al bucket `libros`** | `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./db/subir_libros.sh` (o panel/CLI). Hasta entonces, `descargar()` cae al enlace de la fuente (campo 7). |
| B2 | **Probar el envío de EmailJS** | Los IDs ya están en `config.js` (`MAIL_ON=true`). Falta verificar en el panel el *Allowlist* de orígenes y probar el correo de descarga gratuita (comprobar que el correo del solicitante entra en `solicitudes`). |
| B3 | **Push a GitHub** | Falta credencial: registrar la llave SSH o usar un PAT con scope `repo`. |
| N1 | Reescribir historia (opcional) | Una edición descartada con copyright sigue en el historial (`b8e7945`); requiere force-push. |

## 4. Verificación (evidencia)

- `node --check assets/js/*.js` → OK.
- Navegador: catálogo carga 26 libros (todos «Gratis») desde Supabase; **0 errores** en consola.
- `entregar` (modelo actual): valida el nombre del archivo y devuelve URL firmada; sin bucket/objeto → error claro.
- Descarga gratuita (`freeSend`) → ref. `GR-XXXXXX` en `solicitudes` y correo con el enlace de la fuente.
- Aviso de Supabase: 0 de seguridad; solo INFO de índices sin uso.
- *(Modelo anterior, histórico:)* `saveOrder` → HTTP 200 con pedidos `pending_review`; `entregar` exigía correo + `status='paid'` y devolvía `kind:"none"` con el bucket vacío; el reclamo de pedido pendiente mostraba «Tu pago aún no está verificado…».

## 5. Aportes: confirmación manual por WhatsApp

1. El visitante abre **Aportes**, elige importe y método (Pago Móvil o Cripto).
2. `done()` registra el aporte en `solicitudes` (`book_title="Aporte"`, ref. `MD-XXXXXX`)
   y ofrece enviar el comprobante por **WhatsApp**.
3. No hay estados de pedido ni verificación: la descarga de libros es libre e
   independiente del aporte.

## 6. Próximos pasos

1. **B1** → subir los 8 libros al bucket; probar la descarga real (URLs firmadas).
2. **B2** → verificar el *Allowlist* de EmailJS y probar el correo de descarga gratuita.
3. **B3** → autorizar el push y desplegar en GitHub Pages.
4. **Fase 0** → saneado (escapado XSS en `draw()`, contraste en modo oscuro,
   Esc/trampa de foco/etiquetas en modales).
