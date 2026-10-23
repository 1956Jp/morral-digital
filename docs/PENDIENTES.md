# Pendientes del proyecto — El Morral Digital

Última actualización: 2026-10-23 (tras `ef22056`).

## 1. Correo EmailJS — BLOCKER actual del correo

El sitio tiene `MAIL_ON=true`, pero el envío responde **`404 Account not found`**:
`service_0xhzzc5` y `template_9a4yync` pertenecen a la cuenta anerior que dejó de
existir (la `publicKey` sí se renovó en `f4a5d87`). Pasos para dejarlo operativo:

1. En [dashboard.emailjs.com](https://dashboard.emailjs.com): crear/entrar a la cuenta
   nueva, conectar un **Email Service** (Gmail/Outlook/SMTP…) y copiar su `service_xxx`.
2. Crear **una plantilla** pegando el cuerpo de `emailjs/plantilla-cliente.html`
   (To Email = `{{email}}`; el HTML del enlace, si el editor no lo escapa, con
   `{{{enlaces}}}`). Copiar su `template_xxx`.
3. Copiar la **Public Key** de esa misma cuenta.
4. Actualizar en `assets/js/config.js` → `emailjs`:
   `publicKey`, `serviceId`, `templateCliente` (`templateAdmin`/`enviarEnlaces` quedan
   reservados, sin uso). Subir `?v=` si se toca `index.html` (no hace falta: config.js
   lo requiere el cache-buster actual `?v=43`).
5. **Allowlist** de orígenes: `https://1956jp.github.io` (sitio de proyecto),
   dominio de Vercel si lo usas, y `http://localhost:8000` para pruebas.
6. Probar: «Leer gratis» en un título de solo enlace con un correo real → debe llegar
   el correo con el enlace y entrar la fila en la tabla `solicitudes` (ref. `GR-XXXXXX`).
   Diagnóstico en consola: `404` cuenta/Service caídos · `403` origen no permitido ·
   `400` Public Key inválida.

> Mientras siga el 404 el sitio funciona igual: solicita el correo, lo guarda en
> `solicitudes` y muestra el enlace en pantalla (best-effort).

## 2. Copia externa (CWD) desfasada — requiere sudo del usuario

`/home/kali/Proyectos/morral-digital` (donde arrancan las sesiones) sigue en `?v=36`
con docs viejas; solo el usuario puede actualizarla (root-owned, password dead TTY):

```bash
sudo tar -xf /tmp/opencode/repo-head.tar -C /home/kali/Proyectos/morral-digital
```

Si el tar ya no existe, regenerar primero:

```bash
git -C /home/kali/Proyectos/morral-digital/morral-digital archive \
  -o /tmp/opencode/repo-head.tar HEAD
```

Verificación tras aplicar: `cmp` de los rastreados outer↔repo = 0 diffs y
`grep -o '?v=[0-9]*' index.html | sort -u` = `?v=43`.

## 3. Próximos pasos candidatos (fase, no urgentes)

- **UI de «Recursos»**: vista sección en el sitio (filtros por
  materia/grado/idioma) + formulario de envío que haga `INSERT recursos`
  (`estado='pendiente'`) contra la RLS ya aplicada; moderación desde el
  Table Editor. Esquema listo en `db/supabase_recursos.sql` (ver
  AGENTS.md «Recursos educativos»).
- **B2** (depende de §1): probar el correo real de descarga gratuita.
- **Contraste modo oscuro**: medir con WCAG AA y ajustar variables si hace
  falta (única parte de Fase 0 abierta).
- Revisar periódicamente advisors de seguridad/performance de Supabase
  (ónimo MCP) — hoy 0 lints de seguridad.
