-- ============================================================
-- Girls Like Us — migration: per-size stock + new categories
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run. Apply it on any project that was created from an
-- earlier version of schema.sql (before "Exclusive"/"Shirts" and stock).
-- ============================================================

-- 1) Per-size stock quantities, e.g. {"S": 2, "M": 0, "Free size": 1}
alter table public.products
  add column if not exists stock jsonb not null default '{}'::jsonb;

-- 2) Allow the two new categories now shown in the filter + admin dropdown.
--    (The original table only permitted Dresses/Tops/Sets, so adding an
--     Exclusive or Shirts product would fail without this.)
alter table public.products drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in ('Exclusive','Dresses','Tops','Sets','Shirts'));
