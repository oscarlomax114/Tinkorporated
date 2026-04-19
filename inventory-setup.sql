-- ═══════════════════════════════════════
-- INVENTORY TABLE + DECREMENT FUNCTION
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════

-- 1. Create inventory table
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  dose_id text not null,
  variant text,
  label text,
  stock integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(product_id, variant)
);

alter table public.inventory enable row level security;

-- Public read access (product pages need to show stock)
create policy "Public read access"
  on public.inventory for select
  using (true);

-- 2. Atomic decrement function (prevents overselling)
create or replace function public.decrement_stock(
  p_product_id text,
  p_variant text,
  p_quantity integer
)
returns integer
language plpgsql
security definer
as $$
declare
  new_stock integer;
begin
  update public.inventory
  set stock = stock - p_quantity,
      updated_at = now()
  where product_id = p_product_id
    and (variant is not distinct from p_variant)
    and stock >= p_quantity
  returning stock into new_stock;

  if not found then
    return -1;
  end if;

  return new_stock;
end;
$$;

-- 3. Seed inventory data

-- Mystery Dispense: 215 units, no variant
insert into public.inventory (product_id, dose_id, variant, label, stock)
values ('DSG-MD', 'd-mystery', null, null, 215);

-- Open Selection: 100 units per compound
insert into public.inventory (product_id, dose_id, variant, label, stock)
values
  ('DSG-OS', 'd-open', 'F-HY1', 'F-HY1', 100),
  ('DSG-OS', 'd-open', 'F-RY1', 'F-RY1', 100),
  ('DSG-OS', 'd-open', 'F-N51', 'F-N51', 100),
  ('DSG-OS', 'd-open', 'F-SU1', 'F-SU1', 100),
  ('DSG-OS', 'd-open', 'F-SS1', 'F-SS1', 100),
  ('DSG-OS', 'd-open', 'F-PC1', 'F-PC1', 100),
  ('DSG-OS', 'd-open', 'F-AS1', 'F-AS1', 100),
  ('DSG-OS', 'd-open', 'F-GR1', 'F-GR1', 100),
  ('DSG-OS', 'd-open', 'F-BL1', 'F-BL1', 100),
  ('DSG-OS', 'd-open', 'F-FZ1', 'F-FZ1', 100);

-- Extended Release: 25 units each, no variant
insert into public.inventory (product_id, dose_id, variant, label, stock)
values
  ('XR-001', 'd-xr-001', null, null, 25),
  ('XR-002', 'd-xr-002', null, null, 25),
  ('XR-003', 'd-xr-003', null, null, 25);
