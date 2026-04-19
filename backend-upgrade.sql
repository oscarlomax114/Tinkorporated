-- ═══════════════════════════════════════
-- BACKEND UPGRADE — Run in Supabase SQL Editor
-- Adds: order lifecycle, shipping, status logs,
--        contact submissions, product visibility
-- ═══════════════════════════════════════

-- 1. Enhance orders table with lifecycle fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

-- Update status to allow full lifecycle values
-- (Supabase text columns accept any value, so no enum change needed.
--  Status values: pending, paid, in_production, packed, shipped, delivered, cancelled, refunded)

-- Update existing 'completed' orders to 'paid' for consistency
UPDATE public.orders SET status = 'paid' WHERE status = 'completed';

-- 2. Order status change log
CREATE TABLE IF NOT EXISTS public.order_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.order_status_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view and insert logs
CREATE POLICY "Admins can manage status logs"
  ON public.order_status_logs FOR ALL
  USING (public.is_admin());

-- Users can view their own order logs
CREATE POLICY "Users can view own order logs"
  ON public.order_status_logs FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- 3. Contact submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  inquiry_type text,
  subject text,
  message text NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact submissions"
  ON public.contact_submissions FOR ALL
  USING (public.is_admin());

-- Allow public inserts (contact form is public)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- 4. Product visibility table (for drops/scheduling)
CREATE TABLE IF NOT EXISTS public.product_visibility (
  product_id text PRIMARY KEY,
  visible boolean DEFAULT true,
  publish_at timestamptz,
  unpublish_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product visibility"
  ON public.product_visibility FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product visibility"
  ON public.product_visibility FOR ALL
  USING (public.is_admin());

-- Seed visibility for current products (all visible)
INSERT INTO public.product_visibility (product_id, visible)
VALUES
  ('DSG-MD', true),
  ('DSG-OS', true),
  ('XR-001', true),
  ('XR-002', true),
  ('XR-003', true)
ON CONFLICT (product_id) DO NOTHING;

-- 5. Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  product_id text,
  variant text,
  session_id text,
  user_id uuid,
  source text,
  referrer text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public insert (client-side tracking)
CREATE POLICY "Anyone can log events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read analytics"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin());

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_product ON public.analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_source ON public.analytics_events(source);
