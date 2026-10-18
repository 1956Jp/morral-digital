-- =====================================================================
--  EL MORRAL DIGITAL — Solicitudes de descarga gratuita
--  ---------------------------------------------------------------------
--  Pega todo en el SQL Editor de Supabase y pulsa Run. Es idempotente:
--  puedes ejecutarlo varias veces sin borrar datos.
--
--  Crea la tabla `solicitudes`: cuando alguien pulsa «Leer gratis» en un
--  título de enlace libre (precio 0), el sitio guarda aquí su correo (con una
--  referencia `GR-XXXXXX`) y le envía el enlace desde la cuenta del
--  administrador (EmailJS). Sirve para consultar quién pidió cada título.
--
--  La anonKey del sitio es PÚBLICA (va en el navegador): la seguridad es la
--  RLS de abajo (solo INSERT; nadie lee los correos). NUNCA exponer la
--  service_role. Para consultarlas usa el panel (Table Editor) o la
--  service_role desde el servidor.
-- =====================================================================

create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  code text,
  email text not null,
  book_title text not null,
  source_url text,
  created_at timestamptz not null default now()
);

-- Por si la tabla ya existía sin la columna (idempotente).
alter table public.solicitudes add column if not exists code text;

create index if not exists solicitudes_created_idx
  on public.solicitudes (created_at desc);

-- ---------------------------------------------------------------------
--  RLS: el navegador (rol `anon`) solo puede INSERTAR. Sin política de
--  SELECT, nadie puede leer los correos desde el sitio (protege la PII).
-- ---------------------------------------------------------------------
alter table public.solicitudes enable row level security;

drop policy if exists "anon_insert_solicitudes" on public.solicitudes;
create policy "anon_insert_solicitudes"
  on public.solicitudes
  for insert
  to anon
  with check (true);

grant insert on public.solicitudes to anon;
