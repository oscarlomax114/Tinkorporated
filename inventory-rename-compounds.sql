-- ═══════════════════════════════════════
-- RENAME COMPOUND VARIANTS (001→F-xxx)
-- Run this in Supabase SQL Editor
-- Only needed if you already ran inventory-setup.sql with the old 001-010 names
-- ═══════════════════════════════════════

UPDATE public.inventory SET variant = 'F-HY1', label = 'F-HY1' WHERE product_id = 'DSG-OS' AND variant = '001';
UPDATE public.inventory SET variant = 'F-RY1', label = 'F-RY1' WHERE product_id = 'DSG-OS' AND variant = '002';
UPDATE public.inventory SET variant = 'F-N51', label = 'F-N51' WHERE product_id = 'DSG-OS' AND variant = '003';
UPDATE public.inventory SET variant = 'F-SU1', label = 'F-SU1' WHERE product_id = 'DSG-OS' AND variant = '004';
UPDATE public.inventory SET variant = 'F-SS1', label = 'F-SS1' WHERE product_id = 'DSG-OS' AND variant = '005';
UPDATE public.inventory SET variant = 'F-PC1', label = 'F-PC1' WHERE product_id = 'DSG-OS' AND variant = '006';
UPDATE public.inventory SET variant = 'F-AS1', label = 'F-AS1' WHERE product_id = 'DSG-OS' AND variant = '007';
UPDATE public.inventory SET variant = 'F-GR1', label = 'F-GR1' WHERE product_id = 'DSG-OS' AND variant = '008';
UPDATE public.inventory SET variant = 'F-BL1', label = 'F-BL1' WHERE product_id = 'DSG-OS' AND variant = '009';
UPDATE public.inventory SET variant = 'F-FZ1', label = 'F-FZ1' WHERE product_id = 'DSG-OS' AND variant = '010';
