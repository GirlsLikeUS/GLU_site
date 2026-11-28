-- Quick fix: your products table was blocking public reads because the table
-- privileges were never granted. Run this ONCE in Supabase → SQL Editor → New
-- query → paste → Run. (Row-level security still decides who can read/write;
-- this just lets the roles reach the table so the policies can apply.)

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
