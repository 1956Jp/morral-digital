# Estructura del proyecto — El Morral Digital

Sitio **estático** para GitHub Pages: `index.html` + CSS + JS vanila. No hay
build, ni `package.json`, ni tests automatizados. "Backend" aquí significa
**Supabase** (Postgres, Storage y Edge Functions) más los scripts de `db/`.

## 1. Frontend (corre en el navegador)

| Archivo | Rol |
| --- | --- |
| `index.html` | Marcado de la página: barra de navegación (incluye **Aportes** y **Tu lista**), hero, secciones (catálogo, reseñas, expansión), modales de lista de descargas y de aportes. Carga `config.js` → `data.js` → `app.js` como scripts clásicos. |
| `assets/css/styles.css` | Estilos, variables de color (`--bg`, `--card`, `--ink`, `--gold`, `--pollo`, `--sangre`…) y modo oscuro. |
| `assets/js/config.js` | Configuración central `CFG`: marca, textos, colores, secciones, aportes (`aportes`, `metodosPago`), datos de Pago Móvil/Binance (`pago`), Supabase y EmailJS. |
| `assets/js/data.js` | Catálogo **semilla** `B`: 26 filas posicionales de 9 campos, **precio 0 en todas** (catálogo gratuito); 8 con archivo en el bucket. Respaldo si Supabase no responde. |
| `assets/js/app.js` | Lógica: filtros, lista de descargas persistente (`localStorage`), descarga directa (`descargar` → Edge Function `entregar`), descarga por enlace (`freeBook`/`freeSend`), aportes (`openAportes`/`aporteSet`/`method`/`done`/`saveAporte`), helpers de Supabase (`sbGet`/`sbInsert`), `saveSolicitud` y `notifyFree` (EmailJS). |

## 2. Backend (Supabase: descarga libre y registro)

| Archivo | Rol |
| --- | --- |
| `db/supabase_pedidos.sql` | Esquema **histórico** de pedidos (`orders` / `order_items`, RPC `registrar_pedido`): **retirado y eliminado de la base** (ver `db/supabase_limpieza.sql`). No ejecutar. |
| `db/supabase_limpieza.sql` | Saneado: elimina el modelo de pedidos y aplica mínimo privilegio de `anon` en `public`. |
| `db/supabase_secciones.sql` | Tablas `books` / `reviews` / `section_events` (catálogo, reseñas y actividad). |
| `db/supabase_solicitudes.sql` | Tabla `solicitudes`: descargas gratuitas (correo + ref. `GR-XXXXXX`) y aportes (`book_title="Aporte"` + ref. `MD-XXXXXX`); RLS de solo-`INSERT`. |
| `db/supabase_storage.sql` | Bucket **privado** `libros` (descarga gratuita; sin acceso `anon`). |
| `db/seed_books.sql` | Semilla del catálogo para la tabla `books` (copia de `data.js`, precios a 0). |
| `db/agregar-libro.mjs` | Atajo para añadir libro(s): valida la corriente, edita `data.js`/`seed_books.sql`/`MANIFIESTO.md`, sube el `?v=` e imprime el INSERT de Supabase (`--apply`, `--lote`; dry-run por defecto). |
| `db/subir_libros.sh` | Sube los PDF/EPUB del catálogo al bucket `libros` usando la `service_role` (por variable de entorno). |
| `supabase/functions/entregar/index.ts` | Edge Function: recibe `{archivo}` (o `{archivos:[...]}`), valida el nombre y devuelve una URL firmada (~1 h); sin pago ni pedido. |

> La `service_role` **nunca** toca el navegador: solo la usa la Edge Function y
> el script de subida. La `anonKey` sí es pública (RLS insert-only protege la PII).

## 3. Infraestructura / despliegue

| Archivo | Rol |
| --- | --- |
| `servir.sh` | Servidor local de previsualización (bloquea dotfiles; prefijo `/morral-digital/`). |
| `.nojekyll` | Necesario para servir assets sin procesar en GitHub Pages. |
| `vercel.json` | CSP y cabeceras de seguridad (nosniff, X-Frame-Options, Referrer-Policy, COOP). |
| `.gitignore` | Excluye `.env`, `*.pem`, tokens, `.vercel/` y **los PDF/EPUB con archivo** (van al bucket, no al repo). |

## 4. Documentación

| Archivo | Rol |
| --- | --- |
| `README.md` | Visión general, instalación local, catálogo gratuito, aportes, descarga libre y seguridad. |
| `AGENTS.md` | Guía para agentes/desarrolladores: convenciones, gotchas y cacheo `?v=N`. |
| `books/MANIFIESTO.md` | Registro de dominio público: fuente, licencia y fecha por título. |
| `books/LEEME.txt` | Nota sobre los archivos movidos al bucket privado. |
| `emailjs/README.md` | Configuración de las plantillas de correo. |
| `emailjs/plantilla-cliente.html` | Plantilla del correo de descarga gratuita (To Email = `{{email}}`). |
| `emailjs/plantilla-admin.html` | Plantilla del antiguo aviso al administrador (hoy sin uso). |
| `CLAUDE.md`, `.cursor/rules/project.mdc` | Reglas de asistentes. |
| `LICENSE` | Licencia del repositorio. |
| `docs/ESTRUCTURA.md` | Este documento. |
| `docs/RESULTADOS.md` | Informe de resultados y seguimiento. |

## 5. Flujo de datos

```
Cliente (navegador)
  │  lista de descargas → localStorage (títulos, sin precios)
  │  catálogo 100 % gratuito: todo botón de ficha es «Descargar» o «Leer gratis»
  │
  │  descargar(i) (hay archivo, campo 6)
  │        └─ POST /functions/v1/entregar {archivo} ─► Edge Function
  │              └─ firma el objeto del bucket privado 'libros' ─► descarga (~1 h)
  │
  │  freeBook()/freeSend(i) (solo fuente, campo 7)
  │        ├─ saveSolicitud() ── INSERT ─► Supabase (solicitudes: correo + ref. GR-XXXXXX)
  │        └─ notifyFree() ───── POST api.emailjs.com ──────► correo al solicitante (enlace a la fuente)
  │
  │  openAportes() → método (Pago Móvil / Cripto) → done()
  │        ├─ saveAporte() ──── INSERT ─► Supabase (solicitudes: book_title="Aporte" + ref. MD-XXXXXX)
  │        └─ botón WhatsApp ──► el cliente envía el comprobante (confirmación manual)
  │
  │  loadBooks()/loadRevs()/addRev()/observeSections() ─► Supabase (books, reviews, section_events)
```

## 6. Aportes: confirmación manual por WhatsApp

El catálogo es gratuito; los **aportes** (`config.js → pago.whatsapp`) son
donaciones voluntarias para la tecnología, sin verificación automática:

1. El visitante abre **Aportes** (`openAportes()`), elige importe ($1/$3/$5/$10
   o personalizado) y método (Pago Móvil o Cripto). `done()` registra el aporte
   en `solicitudes` (`book_title="Aporte"`, ref. `MD-XXXXXX`) y agradece.
2. El comprobante se envía por **WhatsApp** con el botón del panel (no hay
   estados de pedido: nada se verifica ni se condiciona).
3. La descarga de libros no depende en ningún caso del aporte.
