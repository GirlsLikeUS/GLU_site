-- ============================================================
-- Girls Like Us — Supabase schema
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query →
-- paste all of this → Run. It creates the products table, the photo-storage
-- bucket, the security rules, and seeds your current 9 products.
-- Safe to re-run: it uses "if not exists" / "on conflict do nothing".
-- ============================================================

-- ---- products table ----
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null,
  category    text    not null default 'Dresses' check (category in ('Dresses','Tops','Sets')),
  price       integer not null default 0,                 -- whole rupees
  status      text    not null default 'available' check (status in ('available','sold')),
  fit         text    not null default '',                -- free-text fit / size note
  sizes       text[]  not null default '{}',              -- optional explicit sizes, e.g. {XS,S,M}
  colours     text[]  not null default '{}',              -- colour names (e.g. {Black,Ivory})
  description text    not null default '',
  images      text[]  not null default '{}',              -- public URLs of uploaded photos (up to ~4)
  tone_a      text    not null default '#F6CFC8',         -- gradient fallback tone (when no photo)
  tone_b      text    not null default '#C4485E',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---- table privileges (RLS below is the real guard; these just let the roles in) ----
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;

-- ---- row-level security: public can READ, only logged-in admin can WRITE ----
alter table public.products enable row level security;

drop policy if exists "products public read"   on public.products;
drop policy if exists "products admin write"    on public.products;

create policy "products public read"
  on public.products for select
  using (true);

create policy "products admin write"
  on public.products for all
  to authenticated
  using (true) with check (true);

-- ---- storage bucket for product photos (public read) ----
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists "photos public read"   on storage.objects;
drop policy if exists "photos admin write"   on storage.objects;

create policy "photos public read"
  on storage.objects for select
  using (bucket_id = 'product-photos');

create policy "photos admin write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-photos')
  with check (bucket_id = 'product-photos');

-- ---- seed: your current 9 products (runs only if the table is empty) ----
insert into public.products (name, category, price, status, fit, colours, description, tone_a, tone_b, sort_order)
select * from (values
  ('Rosalie',                'Dresses', 2095, 'available', 'Free size',                     array['Rouge & Ivory','Ivory'],            'A one-piece dress with a soft knit top and a flowy tulle skirt. Comes with a pearl belt and two brooches.', '#C4485E', '#F6EEE4', 1),
  ('Daphne',                 'Dresses', 2095, 'available', 'Free size',                     array['Ivory','Sage'],                     'Floral tulle that moves like a whisper. Light, flowy and easy to dress up.',                                 '#F6F0E4', '#B9CBB0', 2),
  ('Nora',                   'Sets',    2099, 'available', 'Fit details on request',        array['Green','Marble pink'],              'A cream blazer with a slip underneath. Wear it to work, or out for the evening.',                            '#EFE2D0', '#EBC6CC', 3),
  ('Belle',                  'Dresses', 1199, 'available', 'XS/S, bust 32"',                array['Black'],                            'A little black dress with a bib collar and a bow. Made for petite frames.',                                  '#2B2326', '#5C4A52', 4),
  ('Polka side-knot shirt',  'Tops',    1095, 'available', 'Free size, fits bust up to 38"',array['Black','White','Blue','Pink'],      'A polka shirt with a side knot that shapes the waist.',                                                      '#F3C0CB', '#A8C3E0', 5),
  ('Plain wrap shirt',       'Tops',    1095, 'available', 'Free size, fits bust up to 38"',array['Black','White','Green','Blue','Pink'],'A clean wrap shirt that ties at the side. Sharp enough for work, soft enough for brunch.',                   '#E4EEF8', '#F6EFE4', 6),
  ('Polka tee',              'Tops',     895, 'available', 'Free size',                     array['Black','White','Green','Blue','Pink'],'A soft polka top with a draped neckline and long sleeves.',                                                  '#B7CDE6', '#F1C3CF', 7),
  ('Juliet',                 'Dresses', 2599, 'sold',      'Free size, fits bust 28" to 38"',array['Blush','Rouge'],                   'A full-sleeve netted dress, soft, light and flowy from the waist.',                                          '#F6CFC8', '#C4485E', 8),
  ('Margot',                 'Dresses', 1995, 'sold',      'Free size',                     array['Chocolate'],                        'A draped chocolate maxi with a rich, elegant fall.',                                                         '#5B3A2E', '#9A6B55', 9)
) as seed(name, category, price, status, fit, colours, description, tone_a, tone_b, sort_order)
where not exists (select 1 from public.products);
