-- Fix infinite recursion in RLS policies.
-- The admin policies on profiles reference profiles itself, causing recursion.
-- Solution: use auth.jwt() to check role from the JWT token instead.

-- First, create a helper function that checks admin status without querying profiles.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- ═══ PROFILES ═══
-- Drop the recursive admin policy.
drop policy if exists "Admins can view all profiles" on public.profiles;

-- Recreate using the security definer function (bypasses RLS).
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

-- ═══ ORDERS ═══
-- Drop and recreate admin policy.
drop policy if exists "Admins can view all orders" on public.orders;

create policy "Admins can view all orders" on public.orders
  for select using (public.is_admin());

-- ═══ LAB ACCESS APPLICATIONS ═══
-- Drop and recreate admin policies.
drop policy if exists "Admins can view all applications" on public.lab_access_applications;
drop policy if exists "Admins can update applications" on public.lab_access_applications;

create policy "Admins can view all applications" on public.lab_access_applications
  for select using (public.is_admin());

create policy "Admins can update applications" on public.lab_access_applications
  for update using (public.is_admin());
