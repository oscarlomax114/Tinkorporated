-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates all the tables needed for Tinkorporated.

-- ═══════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  shipping_address jsonb,
  billing_address jsonb,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read/update their own profile.
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Admins can read all profiles.
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stripe_session_id text unique,
  customer_email text,
  customer_name text,
  amount_total integer not null default 0,
  currency text default 'usd',
  status text default 'completed',
  items jsonb default '[]'::jsonb,
  shipping_address jsonb,
  phone text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Users can view their own orders.
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

-- Admins can view all orders.
create policy "Admins can view all orders" on public.orders
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Service role (webhook) can insert orders — handled via service_role key.

-- ═══════════════════════════════════════
-- LAB ACCESS APPLICATIONS
-- ═══════════════════════════════════════
create table if not exists public.lab_access_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text,
  email text,
  status text default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz default now()
);

alter table public.lab_access_applications enable row level security;

-- Users can view their own applications.
create policy "Users can view own applications" on public.lab_access_applications
  for select using (auth.uid() = user_id);

-- Users can insert their own applications.
create policy "Users can insert own applications" on public.lab_access_applications
  for insert with check (auth.uid() = user_id);

-- Admins can view and update all applications.
create policy "Admins can view all applications" on public.lab_access_applications
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update applications" on public.lab_access_applications
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ═══════════════════════════════════════
-- MAKE YOURSELF ADMIN
-- ═══════════════════════════════════════
-- After you sign up, run this to make your account admin.
-- Replace YOUR_EMAIL with tinkorporated@gmail.com or whichever email you signed up with.
--
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
