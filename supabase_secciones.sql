-- =====================================================================
--  EL MORRAL DIGITAL — Secciones en Supabase
--  ---------------------------------------------------------------------
--  Pega todo en el SQL Editor de Supabase y pulsa Run. Es idempotente:
--  puedes ejecutarlo varias veces sin borrar datos.
--
--  Crea tres tablas para las secciones del sitio:
--    · books          → catálogo (Catálogo). Lectura pública; escritura
--                       solo desde el panel/servidor (service_role).
--    · reviews        → reseñas (Reseñas). Cualquiera puede enviar una
--                       reseña (queda `pending`); solo se leen las
--                       `approved`.
--    · section_events  → actividad por sección (visitas y clics).
--                       Solo INSERT desde el navegador; nadie las lee.
--
--  La anonKey del sitio es PÚBLICA (va en el navegador): la seguridad
--  es la RLS de abajo. NUNCA exponer la service_role.
--
--  Después, si quieres, carga el catálogo inicial con db/seed_books.sql
--  y activa `supabase` en assets/js/config.js.
-- =====================================================================

-- ---------------------------------------------------------------------
--  books — catálogo (mismos campos que una fila de assets/js/data.js)
--  [título, autor, corriente, precio USD, color, descripción, archivo,
--   fuente (URL), licencia]
-- ---------------------------------------------------------------------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  author text not null,
  corriente text not null
    check (corriente in (
      'Bolivariano', 'Antiimperialista', 'Latinoamericano',
      'Martiano', 'Zapatista', 'Marxista'
    )),
  -- 0 = enlace gratuito (no se vende).
  price numeric(10,2) not null default 0
    check (price >= 0),
  color text not null default '#2f6fb0',
  description text not null default '',
  -- Nombre del archivo dentro de books/ (sin ruta). Vacío = sin PDF local.
  file text not null default '',
  source_url text not null default '',
  license text not null default 'Dominio público',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists books_order_idx
  on public.books (sort_order);

-- ---------------------------------------------------------------------
--  reviews — reseñas de lectores. El navegador solo INSERTA en estado
--  `pending`; para publicarlas hay que aprobarlas en el panel.
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null
    check (char_length(name) between 1 and 80),
  rating integer not null
    check (rating between 1 and 5),
  comment text not null
    check (char_length(comment) between 1 and 1000),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);

-- ---------------------------------------------------------------------
--  section_events — actividad por sección (`view` al entrar en pantalla,
--  `click` al pulsar el menú). Sin datos personales.
-- ---------------------------------------------------------------------
create table if not exists public.section_events (
  id bigint generated always as identity primary key,
  section text not null
    check (section in ('catalogo', 'resenas', 'expansion')),
  event text not null
    check (event in ('view', 'click')),
  created_at timestamptz not null default now()
);

create index if not exists section_events_created_idx
  on public.section_events (created_at desc);

-- ---------------------------------------------------------------------
--  RLS
-- ---------------------------------------------------------------------
alter table public.books enable row level security;
alter table public.reviews enable row level security;
alter table public.section_events enable row level security;

-- books: lectura pública de los títulos activos. Sin políticas de
-- INSERT/UPDATE/DELETE para anon, así que solo el panel (service_role)
-- puede modificarlos.
drop policy if exists "anon_select_books" on public.books;
create policy "anon_select_books"
  on public.books
  for select
  to anon
  using (active = true);

-- reviews: leer solo las aprobadas; enviar siempre en `pending`.
drop policy if exists "anon_select_reviews" on public.reviews;
create policy "anon_select_reviews"
  on public.reviews
  for select
  to anon
  using (status = 'approved');

drop policy if exists "anon_insert_reviews" on public.reviews;
create policy "anon_insert_reviews"
  on public.reviews
  for insert
  to anon
  with check (status = 'pending');

-- section_events: solo INSERT; sin política de SELECT nadie las lee.
drop policy if exists "anon_insert_section_events" on public.section_events;
create policy "anon_insert_section_events"
  on public.section_events
  for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------
--  Permisos del rol anónimo (el navegador). La RLS sigue gobernando.
-- ---------------------------------------------------------------------
grant select on public.books to anon;
grant select, insert on public.reviews to anon;
grant insert on public.section_events to anon;
