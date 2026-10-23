-- =====================================================================
--  EL MORRAL DIGITAL — Recursos educativos (dominio nuevo)
--  ---------------------------------------------------------------------
--  Pega todo en el SQL Editor de Supabase y pulsa Run. Es idempotente:
--  puedes ejecutarlo varias veces sin borrar datos (solo crea lo falta).
--
--  Modelo espejo de la interfaz `Recurso` (TypeScript, ver AGENTS.md):
--    · materias / grados  → catálogos FK (lectura pública).
--    · recursos           → la entidad, con flujo de moderación:
--      anon (el sitio) solo ve `estado='aprobado'` y solo puede INSERTAR
--      en `estado='pendiente'` (igual que reviews). Borrador/aprobado/
--      rechazado los gestiona el panel (service_role).
--
--  `archivo_url` es una URL pública directa (fuente original u objeto
--  servido por su propio medio): NO es el bucket privado `libros` de
--  books/, ahí la entrega es con URLs firmadas vía Edge Function.
--  `publicado_por` es texto (hoy 'anon'): cuando exista auth se guarda
--  ahí el id del usuario. NUNCA exponer la service_role.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Catálogos FK (se rellenan a mano o con el seed de abajo; editables)
-- ---------------------------------------------------------------------
create table if not exists public.materias (
  id text primary key,
  nombre text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.grados (
  id text primary key,
  nombre text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed mínimo (editable). ON CONFLICT: repetible sin duplicar.
insert into public.materias (id, nombre, sort_order) values
  ('general', 'General', 0),
  ('matematicas', 'Matemáticas', 1),
  ('lenguaje', 'Lengua y Literatura', 2),
  ('ciencias', 'Ciencias', 3),
  ('sociales', 'Ciencias Sociales', 4),
  ('ingles', 'Inglés', 5),
  ('informatica', 'Informática', 6)
on conflict (id) do nothing;

insert into public.grados (id, nombre, sort_order) values
  ('general', 'General', 0),
  ('primaria-1', 'Primaria · 1°', 1),
  ('primaria-2', 'Primaria · 2°', 2),
  ('primaria-3', 'Primaria · 3°', 3),
  ('primaria-4', 'Primaria · 4°', 4),
  ('primaria-5', 'Primaria · 5°', 5),
  ('primaria-6', 'Primaria · 6°', 6),
  ('media-1', 'Media · 1°', 7),
  ('media-2', 'Media · 2°', 8),
  ('media-3', 'Media · 3°', 9),
  ('media-4', 'Media · 4°', 10),
  ('media-5', 'Media · 5°', 11)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- recursos — entidad principal
-- ---------------------------------------------------------------------
create table if not exists public.recursos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text not null,
  descripcion text,
  -- FK a catálogos
  materia_id text not null references public.materias (id),
  grado_id text not null references public.grados (id),
  idioma text not null default 'es'
    check (idioma in ('es', 'en', 'otro')),
  archivo_url text not null,
  archivo_tipo text not null
    check (char_length(archivo_tipo) between 1 and 100),
  archivo_tamano bigint not null check (archivo_tamano >= 0),
  portada_url text,
  etiquetas text[] not null default '{}',
  -- flujo de moderación; anon solo entra en `pendiente`
  estado text not null default 'pendiente'
    check (estado in ('borrador', 'pendiente', 'aprobado', 'rechazado')),
  -- FK usuario: hoy texto ('anon'); cuando exista auth, id de auth.users
  publicado_por text not null default 'anon',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists recursos_estado_creado_idx
  on public.recursos (estado, creado_en desc);
create index if not exists recursos_materia_idx
  on public.recursos (materia_id);
create index if not exists recursos_grado_idx
  on public.recursos (grado_id);

-- actualizado_en se refresca en toda UPDATE (panel/service_role).
create or replace function public.touch_actualizado_en()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end $$;

drop trigger if exists recursos_touch ON public.recursos;
create trigger recursos_touch
  before update on public.recursos
  for each row execute function public.touch_actualizado_en();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.materias enable row level security;
alter table public.grados enable row level security;
alter table public.recursos enable row level security;

-- Catálogos: lectura pública; escritura solo desde el panel.
drop policy if exists "anon_select_materias" on public.materias;
create policy "anon_select_materias"
  on public.materias for select to anon using (true);

drop policy if exists "anon_select_grados" on public.grados;
create policy "anon_select_grados"
  on public.grados for select to anon using (true);

-- recursos: el sitio solo ve los aprobados y solo puede INSERTAR en
-- `pendiente` (la moderación la decide el panel).
drop policy if exists "anon_select_recursos" on public.recursos;
create policy "anon_select_recursos"
  on public.recursos for select to anon
  using (estado = 'aprobado');

drop policy if exists "anon_insert_recursos" on public.recursos;
create policy "anon_insert_recursos"
  on public.recursos for insert to anon
  with check (estado = 'pendiente');

-- ---------------------------------------------------------------------
-- Permisos del rol anónimo (el navegador). La RLS sigue gobernando.
-- ---------------------------------------------------------------------
grant select on public.materias to anon;
grant select on public.grados to anon;
grant select, insert on public.recursos to anon;
