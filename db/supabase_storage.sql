-- =====================================================================
--  EL MORRAL DIGITAL — Storage para la entrega protegida (Fase 2)
--  ---------------------------------------------------------------------
--  Crea el bucket PRIVADO `libros`, donde viven los PDF/EPUB del catálogo
--  (ya no en books/, que es un repo público). La descarga es gratuita: las
--  URLs firmadas temporales las genera la Edge Function `entregar`
--  (supabase/functions/entregar) con la service_role.
--
--  Pégalo en el SQL Editor de Supabase y pulsa Run. Es idempotente.
--
--  PUBLIC=false y sin políticas para `anon`/`authenticated` en
--  storage.objects: nadie puede leer ni escribir el bucket directamente.
--  Solo la service_role (que ignora RLS) firma URLs y sube archivos
--  (panel o CLI). NUNCA exponer la service_role en el navegador.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('libros', 'libros', false)
on conflict (id) do update set public = false;

-- Sin políticas para anon/authenticated: el acceso directo queda cerrado.
-- (Las URLs firmadas no dependen de políticas de storage.objects.)
