-- =====================================================================
--  EL MORRAL DIGITAL — Pedidos en Supabase  ⛔ RETIRADO (NO EJECUTAR)
--  ---------------------------------------------------------------------
--  HISTÓRICO: este esquema (tablas `orders`/`order_items` + RPC
--  `registrar_pedido`) quedó FUERA del flujo cuando el catálogo pasó a ser
--  100 % gratuito. Las tablas, políticas y la función YA SE ELIMINARON de
--  la base con la migración de saneado (ver `db/supabase_limpieza.sql`).
--
--  Se conserva solo como referencia; NO volver a ejecutarlo: recrearía una
--  superficie de escritura pública sin uso (y un RPC ejecutable por `anon`).
--  El registro vigente es `db/supabase_solicitudes.sql` (descargas + aportes).
-- =====================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_email text not null,
  payment_method text not null
    check (payment_method in (
      'paypal', 'bank', 'crypto', 'card', 'zinli'
    )),
  status text not null default 'pending_review'
    check (status in (
      'pending_review', 'paid', 'rejected', 'cancelled'
    )),
  currency text not null default 'USD',
  total_amount numeric(10,2) not null
    check (total_amount > 0),
  -- Importe convertido a bolívares con la tasa BCV del momento (solo
  -- Pago Móvil; el resto queda en null).
  monto_bs numeric(14,2),
  tasa_bs numeric(14,4),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null
    references public.orders(id) on delete cascade,
  book_title text not null,
  unit_price numeric(10,2) not null
    check (unit_price > 0),
  quantity integer not null default 1
    check (quantity > 0)
);

create index orders_created_at_idx
  on public.orders (created_at desc);

create index order_items_order_id_idx
  on public.order_items (order_id);

-- ---------------------------------------------------------------------
--  RLS: el navegador solo puede INSERTAR. No hay política de SELECT, así
--  que el rol `anon` no puede leer pedidos (protege la PII del correo).
-- ---------------------------------------------------------------------
alter table public.orders
  enable row level security;

alter table public.order_items
  enable row level security;

create policy "anon_insert_orders"
  on public.orders
  for insert
  to anon
  with check (true);

create policy "anon_insert_items"
  on public.order_items
  for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------
--  registrar_pedido: un solo INSERT que crea el pedido y sus líneas.
--  Atómico: si falla alguna línea, se revierte todo. SECURITY INVOKER
--  para que siga aplicando la RLS de arriba. `set search_path` evita
--  que otra ruta se cuelgue en la definición.
--  Llamado desde el sitio:
--    POST {url}/rest/v1/rpc/registrar_pedido
--    {
--      "p_order_code": "MD-XXXXXX",
--      "p_customer_email": "hola@ejemplo.com",
--      "p_payment_method": "bank",
--      "p_currency": "USD",
--      "p_total_amount": 4,
--      "p_monto_bs": 140.50,
--      "p_tasa_bs": 35.125,
--      "p_items": [{"book_title": "Ariel", "unit_price": 2, "quantity": 1}]
--    }
-- ---------------------------------------------------------------------
--  Nota: los parámetros obligatorios van PRIMERO; los que tienen default
--  ('USD'/null) van al final (regla de SQL). PostgREST empareja por nombre,
--  así que el orden no afecta cómo se llama desde el sitio.
--  Nota: NO se usa `insert ... returning id` porque eso exigiría una
--  política SELECT para `anon` (que no existe a propósito: protege la PII).
--  El id se genera con gen_random_uuid() y se inserta explícito.
create or replace function public.registrar_pedido(
  p_order_code text,
  p_customer_email text,
  p_payment_method text,
  p_total_amount numeric,
  p_items jsonb,
  p_currency text default 'USD',
  p_monto_bs numeric default null,
  p_tasa_bs numeric default null
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'p_items debe ser un array no vacío';
  end if;

  insert into public.orders (
    id, order_code, customer_email, payment_method, currency,
    total_amount, monto_bs, tasa_bs
  ) values (
    v_id, p_order_code, p_customer_email, p_payment_method, p_currency,
    p_total_amount, p_monto_bs, p_tasa_bs
  );

  insert into public.order_items (order_id, book_title, unit_price, quantity)
  select
    v_id,
    it->>'book_title',
    (it->>'unit_price')::numeric,
    coalesce(nullif(it->>'quantity', '')::integer, 1)
  from jsonb_array_elements(p_items) as it;

  return v_id;
end;
$$;

-- Solo el navegador (anon) puede ejecutarla. La lectura de pedidos se hace
-- desde el panel de Supabase o con la service_role.
revoke execute on function public.registrar_pedido(
  text, text, text, numeric, jsonb, text, numeric, numeric
) from public, anon, authenticated;

grant execute on function public.registrar_pedido(
  text, text, text, numeric, jsonb, text, numeric, numeric
) to anon;
