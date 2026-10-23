# AGENTS.md

Sitio **estático** para GitHub Pages: `index.html` + `assets/css/styles.css` + JS clásico. **No hay `package.json`, build, tests ni lint**: no inventes comandos de npm/CI. Verificación = `node --check assets/js/*.js` + servir y probar a mano. Catálogo **100 % gratuito**; los «aportes» son donaciones voluntarias (sin pedidos ni cobro automático).

## Ubicación y repo (leer primero)
- El CWD `/home/kali/Proyectos/morral-digital` es una **copia root-owned y desfasada** (sin git, con `AGENTS.md`/`README.md` viejos). El repo real es **`morral-digital/`**: edita, sirve y commitea desde ahí.
- `origin` = `1956Jp/morral-digital`, rama `main`, Pages en `https://1956jp.github.io/morral-digital/` (sitio de proyecto: **rutas relativas**, `.nojekyll` obligatorio).
- Push: `git -c credential.helper='!gh auth git-credential' push origin main` (el helper global falla). Commit/push solo si se pide.
- La copia externa solo se puede actualizar con `sudo` (pídeselo al usuario).

## Previsualizar
```bash
./servir.sh                    # http://localhost:8000/morral-digital/ (127.0.0.1)
./servir.sh 8000 0.0.0.0       # LAN (solo redes de confianza)
node --check assets/js/*.js    # única comprobación automatizable
```
`servir.sh` bloquea dotfiles y no lista directorios: no lo sustituyas. Prueba a mano: filtros, añadir/quitar de **Tu lista**, descarga directa (URL firmada), «Leer gratis» (correo), **Aportes** (monto, Pago Móvil con Bs y botón Mercantil, Cripto), reseñas.

## Estructura y cacheo
- `index.html` carga **`config.js` → `data.js` → `app.js`** como scripts clásicos con globales (sin ESM). El orden importa: `CFG`, `B`, y `app.js` que los consume.
- Al tocar CSS/JS **sube todos los `?v=N`** de `index.html` al mismo valor (hoy `?v=42`); Pages cachea y sin eso el navegador sirve lo viejo.
- `styles.css` usa `.over` + `.over.show{display:flex}` para los modales (lista y aportes): si falta `.show`, los paneles no abren.

## Configuración (`assets/js/config.js`)
Casi todo se parametriza en `CFG`; edita aquí antes de tocar `app.js`:
- `marca`/`textos` (incluye `botonComprar`, `botonGratis`, `botonDescargar`, `morralTitulo`), `colores` (vacío = CSS), `secciones`/`nav`.
- `metodosPago` (hoy `["bank","crypto"]`) y `aportes` (`montoMin`/`montoMax`/`montos`). `card`/`paypal`/`zinli` existen en `method()` pero no se muestran.
- `pago.pagomovil` (Mercantil 0105; `link` → botón «Abrir Mercantil en línea»; `qr` vacío = sin imagen), `pago.binance` (solo IDs públicos), `whatsapp`, `vesRate*`.
- `supabase{url,anonKey,functions.entregar}` y `emailjs{...}`. La `anonKey` y la Public Key son **públicas**; NUNCA `service_role`, claves privadas, semillas ni 2FA.

## Catálogo (`assets/js/data.js`)
9 campos posicionales, sin id: `[título, autor, corriente, precioUSD, color, descripción, archivo, fuenteURL, licencia]`.
- `corriente` debe existir en `IC` (`app.js`): `Bolivariano`, `Antiimperialista`, `Latinoamericano`, `Martiano`, `Zapatista`, `Marxista`, `Clásico`. Una corriente sin libros desaparece del filtro.
- **Precio 0 en las 26 filas** (todo gratis). Con `archivo` el botón es **Descargar** (`descargar()` → Edge Function → URL firmada); sin archivo y con `fuenteURL`, **Leer gratis** (`freeBook()` pide correo y envía el enlace). `drago-caso-venezuela.pdf` ya **no** tiene archivo: solo enlace.
- Hoy 7 objetos en el bucket: `ariel.pdf`, `facundo.pdf`, `ugarte-el-porvenir.pdf`, `noli-me-tangere.epub`, `el-filibusterismo.epub`, `imperialismo-petrolero-tomo-i.pdf`, `imperialismo-petrolero-tomo-ii.pdf`.
- `add(i)` añade **cualquier** título a «Tu lista» (no valida precio); la lista guarda **títulos** en `localStorage` (`morral-digital:cart:v1`) y no se limpia sola.
- **`data.js` es semilla**: si Supabase responde, `loadBooks()` reemplaza `B` con la tabla `books`. Cambiar solo `data.js` **no** cambia el sitio en vivo.

## Añadir un libro
1. Verifica dominio público **estricto** (autor +70 años, traducción antigua/PD, edición sin `D.R.` de terceros) y regístralo en `books/MANIFIESTO.md` (fuente, licencia, fecha).
2. Sube el PDF/EPUB al bucket privado `libros` y añade la fila de 9 campos; refleja el cambio en la tabla `books` (o usa el atajo).
3. Atajo: `node db/agregar-libro.mjs --titulo "…" --autor "…" --corriente "…" --precio 0 --fuente "https://…" [--archivo "" --desc "…" --anio "…"] [--apply]` (dry-run por defecto; `--lote libros.json`). Valida corriente/duplicados, edita `data.js`, `seed_books.sql`, `MANIFIESTO.md`, sube el `?v=` e imprime el UPSERT de Supabase (aplica solo con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
4. Fuentes bloqueadas: Radio Zapatista (NC), Ocean Press (Che), INEHRM, CLACSO, Z-Library. Fuera de catálogo por copyright vivo: Fidel Castro, Ho Chi Minh, Che Guevara, Hugo Chávez.
5. Honestidad: sin archivo y sin fuente verificable **no se publica** (retíralo si ya estaba).

## Descarga libre (Supabase Storage + Edge Function)
- Bucket **privado** `libros` (`public=false`, sin políticas `anon`); solo la `service_role` firma URLs. Esquema: `db/supabase_storage.sql`.
- Edge Function `entregar` (`supabase/functions/entregar/index.ts`, v2, `verify_jwt=true`): recibe `{archivo}` o `{archivos:[...]}`, valida `^[A-Za-z0-9._-]+$`, comprueba que el objeto exista y devuelve `{url, expires_in}` (~1 h). No exige pago. El navegador envía la `anonKey` (JWT válido).
- Subida: `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… ./db/subir_libros.sh`, panel Storage o CLI. `books/` solo contiene docs; los archivos no se versionan (`.gitignore`) y de los 7 solo hay copia local de `facundo.pdf` en `../_descartados-morral/` (los demás ya están en el bucket).
- Si la función falla, `descargar()` cae al enlace de la fuente (campo 7). El correo es **opcional** en «Descargar»; en «Leer gratis» es obligatorio.

## Recursos educativos (dominio nuevo en Supabase)
Esquema `db/supabase_recursos.sql` (aplicado): tablas `materias`/`grados` (catálogos FK, lectura pública) y `recursos`, espejo de la interfaz `Recurso` (TypeScript): `id uuid` PK, `titulo`/`autor` NOT NULL, `descripcion`/`portada_url` opcional, `materia_id`/`grado_id` (FK), `idioma` CHECK `es|en|otro`, `archivo_url`/`archivo_tipo`/`archivo_tamano` (URL pública directa, NO el bucket `libros`), `etiquetas text[]`, `estado` CHECK `borrador|pendiente|aprobado|rechazado`, `publicado_por` (hoy texto `'anon'`), `creado_en`/`actualizado_en` (trigger `recursos_touch`).

- Flujo de moderación (verificado por REST): `anon` lee **solo `estado='aprobado'`** y solo inserta **`pendiente`** (RLS `with check`); INSERT con `aprobado`/`borrador`/`rechazado` → 401; FK inválida → 409; `anon` NO puede borrar ni actualizar. Moderación (aprobar/rechazar/borrador) solo por panel/service_role.
- Los catálogos van con seed mínimo editable (`general`, `matematicas`… / `primaria-1..6`, `media-1..5`); sin FK válido no hay INSERT posible.
- **Aún no hay UI en el sitio** para recursos: no conectar frontend sin una vista real. Delete las policies sigue el patrón de `reviews`; la capa de entrega de URL directa no usa la Edge Function `entregar`.
- Migraciones MCP aplicadas: `morral_recursos`, `morral_recursos_touch_fix`.

## Aportes (Pago Móvil / Binance Pay, manual)
- No hay pedido: el catálogo es gratis y **la descarga nunca depende del aporte**. `openAportes()` (`checkout()` es alias) abre la primera pestaña de `METODOS`, con concepto `MD-XXXXXX` fijo.
- La tasa USD→VES es **solo BCV oficial** vía `ve.dolarapi.com` (con respaldo `/v1/dolares` filtrando `fuente=="oficial"`); descarta valores fuera de `[vesRateMin, vesRateMax]`; si no hay válida usa `vesRate` o «tasa no disponible».
- `done()` registra el aporte en `solicitudes` (`book_title:"Aporte"`) y ofrece WhatsApp para el comprobante. Es la **única excepción** a «sin `fetch`»; el resto de red es Supabase y EmailJS.

## Supabase (estado vivo)
- Proyecto `uzqadthbjhhdhoqlnupn` (`https://uzqadthbjhhdhoqlnupn.supabase.co`). Si hay MCP de Supabase, úsalo para inspeccionar tablas/objetos y advisors; los `db/*.sql` son la fuente pero hay que **aplicarlos**.
- `books` (26 activas) manda sobre `data.js`; `reviews` (solo `approved`, las nuevas entran `pending`); `section_events` (solo INSERT); `solicitudes` (descargas `GR-XXXXXX` y aportes `MD-XXXXXX`, solo INSERT, `anon` no lee PII).
- Mínimo privilegio aplicado en `db/supabase_limpieza.sql`: `anon` solo `SELECT` en `books`/`reviews` e `INSERT` en `reviews`/`section_events`/`solicitudes`. El modelo antiguo de pedidos (`orders`, RPC `registrar_pedido`) está **retirado** (`db/supabase_pedidos.sql` es histórico; no ejecutar).
- Helpers `sbGet`/`sbInsert` (REST/PostgREST) y todo **best-effort**: si falla la red, la página sigue con datos locales.

## EmailJS (solo descarga gratuita)
- `freeSend()` → `notifyFree()` envía al solicitante el enlace de la fuente (ref. `GR-XXXXXX`) con `fetch` a `api.emailjs.com`; no adjunta archivos ni URLs firmadas. `notifyOrder`/aviso al admin ya no existen.
- Plantilla en uso: `emailjs/plantilla-cliente.html` (**To Email = `{{email}}`**); `plantilla-admin.html` está sin uso. La seguridad es el **Allowlist** de orígenes: `403` = origen no permitido; `404 Account not found` = cuenta/servicio caído; `400` = Public Key inválida.

## Seguridad y despliegue
- GitHub Pages no permite cabeceras propias; `vercel.json` añade CSP y cabeceras (sin build: framework Other, output `.`). La CSP necesita `'unsafe-inline'` en `script-src`/`style-src` por los `onclick`/`style` inline.
- Repo **público**: cédula/teléfono/correo de cobro son visibles (el Pago Móvil los exige). Nunca subas `.env`/claves; `.gitignore` cubre `.env*`, `*.pem`, `*.key`, `*.token`, `gh_token`, `.vercel/` y los 8 nombres de archivo del catálogo.
- `app.js` escapa el catálogo con `esc()`; no interpoles datos de `B` en `innerHTML` sin escapar (XSS).
- El historial git aún contiene los PDF/EPUB antiguos (~53 MB en `.git`); no los vuelvas a añadir. `scripts/enviar-informe.py` envía correo por SMTP y exige credenciales por variables de entorno.
- Modo oscuro solo por CSS (`prefers-color-scheme` + `:root[data-theme="dark"]`); no hay interruptor. La interfaz está en español.

## Referencias
- `docs/ESTRUCTURA.md` (mapa de archivos y flujo), `docs/RESULTADOS.md` (informe), `docs/PENDIENTES.md` (EmailJS 404 a reconectar, copia externa por sudo, próximos pasos), `docs/INFORME-SEGURIDAD.md`, `books/MANIFIESTO.md` (obligatorio por título), `emailjs/README.md`, `README.md`.
