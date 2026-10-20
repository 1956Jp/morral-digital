-- =====================================================================
--  EL MORRAL DIGITAL — Saneado de seguridad (idempotente)
--  ---------------------------------------------------------------------
--  Pégalo en el SQL Editor de Supabase y pulsa Run. Aplica:
--   1. Elimina el modelo histórico de pedidos (orders / order_items) y su
--      RPC `registrar_pedido`, que ya no se usan y añadían superficie de
--      escritura pública ejecutable por `anon`.
--   2. Mínimo privilegio: revoca TODOS los privilegios de tabla/rutina/
--      secuencia de `anon` (y `authenticated`) en `public` y concede solo
--      lo estrictamente necesario para el sitio gratuito:
--        · books ......... SELECT               (catálogo público)
--        · reviews ....... SELECT, INSERT       (RLS fuerza status='pending')
--        · section_events  INSERT               (solo analítica)
--        · solicitudes ... INSERT               (descargas + aportes; PII)
--  La `anonKey` es PÚBLICA: la seguridad es RLS + estos GRANTs. NUNCA
--  exponer la `service_role` (solo la Edge Function `entregar` la usa).
--  Es repetible: volver a ejecutarlo no rompe nada.
-- =====================================================================

-- 1) Retirar el modelo histórico de pedidos
drop policy if exists anon_insert_items on public.order_items;
drop policy if exists anon_insert_orders on public.orders;
drop function if exists public.registrar_pedido(text, text, text, numeric, jsonb, text, numeric, numeric);
drop table if exists public.order_items;
drop table if exists public.orders;

-- 2) Mínimo privilegio para el navegador (rol `anon`)
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on public.books to anon;
grant select on public.reviews to anon;
grant insert on public.reviews to anon;
grant insert on public.section_events to anon;
grant insert on public.solicitudes to anon;

revoke all on all routines in schema public from anon;
revoke all on all routines in schema public from authenticated;
revoke all on all sequences in schema public from anon;
revoke all on all sequences in schema public from authenticated;
