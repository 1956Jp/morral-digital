# Informe técnico — El Morral Digital

**Fecha:** 2026-10-20
**Alcance:** revisión de seguridad, depuración de código e integración de (a) envío del
enlace de descarga por correo (EmailJS) y (b) pasarela de aportes a la administración
(Pago Móvil / Binance Pay).
**Repositorio:** `/home/kali/Descargas/morral-digital/morral-digital` (sitio estático, sin build).

---

## 1. Resumen ejecutivo

| Área | Estado antes | Estado después |
|---|---|---|
| XSS en catálogo (`books`) | 🔴 campos sin escapar; color inyectable en `style` | 🟢 escapado + validación de color |
| XSS en reseñas / entrada local | 🟢 ya correcto | 🟢 sin cambios |
| Pasarela de aportes (Pago Móvil / Binance) | 🟢 funciona | 🟢 + corregido mensaje de comprobante |
| Envío de enlace por correo (EmailJS) | 🔴 **cuenta inexistente (404)** | 🟡 código/docs listos; falta reconectar cuenta |
| Supabase (RLS + mínimo privilegio) | 🟢 aplicado | 🟢 verificado |
| Edge Function `entregar` | 🟢 | 🟢 verificado (200/403/404) |

**Bloqueador externo que requiere tu acción:** la cuenta de EmailJS configurada **ya no
existe** (`404 Account not found`). El código está reparado y documentado, pero **el
correo no funcionará hasta reconectar la cuenta** y pegar los nuevos IDs en `config.js`.

---

## 2. Hallazgos y correcciones aplicadas

### 2.1 XSS en el catálogo (corregido)
`draw()` y `upd()` (`assets/js/app.js`) interpolaban los campos de cada libro **sin
escapar**. El catálogo proviene de Supabase. Aunque `anon` **no puede escribir** en
`books` (solo `SELECT`), era una vulnerabilidad latente de XSS almacenado.

- **Campos afectados:** título `b[0]`, autor `b[1]`, corriente `b[2]` (también usada en
  `onclick="cat='…'"` y en `class`), descripción `b[5]`, licencia `b[8]`.
- **Color `b[4]`:** se inyectaba crudo en el atributo `style` → permitía cerrar el
  atributo y añadir `onmouseover=…` o CSS malicioso.
- **Corrección:** se aplica `esc()` (ya existente) a todos los campos y se añade
  `colorSafe()` que solo acepta hex/`rgb()/hsl()`/nombre simple; cualquier otro valor
  cae al color por defecto `#2f6fb0`.
- **Verificación en navegador:** payload `<img src=x onerror=…>` renderiza escapado
  (`&lt;img…`), no dispara el handler; `<script>` inerte; color ilegal
  (`red;background:url(evil)`) → respaldo. **0 errores de consola.**

### 2.2 Correo de descarga gratuita (EmailJS) — causa raíz externa
- La API responde **`404 Account not found`** con la Public Key configurada
  (`kTwN8Sthj84cLVIbV`). Con una clave aleatoria responde `400 Public Key is invalid`,
  lo que confirma que **la clave es de formato válido pero la cuenta se eliminó/desactivó**.
- **No existe** ninguna otra cuenta en el proyecto (se revisó el repo y el historial
  git: la única clave usada jamás fue esta, desde el commit `88ae026`).
- Correcciones de código aplicadas:
  - `sendMail()` ahora emite un `console.error` **explícito y accionable** según el
    código HTTP (`404` cuenta, `400` clave, `403` allowlist), en vez de un `warn` genérico.
  - Plantilla `emailjs/plantilla-cliente.html` **reescrita** para el flujo real de
    descarga gratuita (antes hablaba de «pedido», «confirmar tu pago», etc.).
  - `emailjs/README.md` **reescrito** con la puesta en marcha actual, variables y una
    sección de **diagnóstico**.
  - `assets/js/config.js`: comentario actualizado y nota sobre el error `404`.

### 2.3 Pasarela de aportes (corregido)
- El flujo funciona: `openAportes()` → `method("bank"|"crypto")` → `done()` → registra
  en `solicitudes` (`book_title:"Aporte"`, concepto `MD-XXXXXX`) → WhatsApp de comprobante.
- **Bug corregido:** `done()` mostraba el mensaje de **cripto** para cualquier pestaña
  que no fuera «bank» (incluidas las de demostración). Ahora: `bank` → mensaje Pago
  Móvil; `crypto` → mensaje Binance; cualquier otra → mensaje **genérico** de aporte.
- La tasa del Pago Móvil usa **solo la oficial del BCV** con rango de cordura; si falla,
  respaldo manual o «tasa no disponible». Correcto.
- Registro de aportes verificado (`INSERT` en `solicitudes` → `201`; lectura por `anon`
  → `401`, como debe ser). **Nota:** a la fecha **no se ha registrado ningún aporte**
  (`MD-`) aún; solo hay descargas gratuitas (`GR-`), lo que es normal si nadie ha usado
  el bloque de aportes todavía.

---

## 3. Otros puntos verificados

- **Supabase / RLS / mínimo privilegio:** `anon` solo tiene `SELECT` en `books`/`reviews`
  e `INSERT` en `reviews`/`section_events`/`solicitudes`. Tablas históricas
  `orders`/`order_items` y RPC `registrar_pedido` **eliminadas**. Sin avisos de seguridad.
- **Storage:** bucket `libros` privado, sin políticas para `anon`.
- **Edge Function `entregar`:** firma URL (200), rechaza inexistentes (404) y path
  traversal (403 vía WAF de Cloudflare). `verify_jwt=true`.
- **Cacheo de assets:** subido a `?v=40` (index.html + AGENTS.md) por los cambios de JS.

---

## 4. Acciones pendientes (requieren tu intervención)

1. **Reconectar EmailJS** (bloqueador del correo):
   - Entra en https://dashboard.emailjs.com → conecta un *Email Service* (Gmail/SMTP).
   - Crea **una** plantilla y pega `emailjs/plantilla-cliente.html`; **To Email =
     `{{email}}`**, **Subject = `Tu enlace de descarga — {{items}}`**.
   - Copia **Public Key**, **Service ID** y **Template ID** a
     `assets/js/config.js` → `emailjs` (`publicKey`, `serviceId`, `templateCliente`).
   - En **Account → Security → Allowlist**, añade `https://1956jp.github.io` (y tu
     dominio Vercel si aplica) + `http://localhost:8000`.
2. **Rotar la `sb_secret_…`** (se filtró en una sesión de chat) en
   Supabase → Settings → API Keys → Rotate, y borrar el archivo temporal
   `/tmp/opencode/ss.env`. Cambiar `Firulay#1980%` si es una contraseña real.
3. **Activadores de descargas gratuitas:** el correo de asistencia que se usó como
   ejemplo para el envío de este informe (`elgoldo129@protomail.com`) **no existe**
   (dominio sin MX); si se quiere usar un buzón de contacto, debe ser un dominio válido
   (p. ej. `@protonmail.com` / `@proton.me`).
4. **Drago** (`drago-caso-venezuela.pdf`, 69 MB): sigue **solo como enlace** hasta que
   amplíes el límite de subida del proyecto (plan de pago).

---

## 5. Cambios en esta sesión

- `assets/js/app.js`: `esc()` en `draw()`/`upd()`, `colorSafe()`, `done()` corregido,
  `sendMail()` con diagnóstico de errores.
- `assets/js/config.js`: comentario de correo actualizado.
- `emailjs/plantilla-cliente.html` y `emailjs/README.md`: reescritos para la descarga gratuita.
- `AGENTS.md`: `?v=40` y sección de correo actualizada.
- `index.html`: assets a `?v=40`.

*Todos los cambios pasan `node --check` y se verificaron en Firefox (0 errores de consola).*
