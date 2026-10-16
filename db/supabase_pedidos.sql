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

alter table public.orders
  enable row level security;

alter table public.order_items
  enable row level security;
