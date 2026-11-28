# Supabase setup — Girls Like Us admin

One-time setup. Takes ~10 minutes. You only need to do steps 1–5; I handle the code.

## 1. Create the project
1. Go to <https://supabase.com> → **Sign in** (GitHub login is easiest) → **New project**.
2. Name it `girls-like-us`, set a database password (save it somewhere), pick the region
   closest to you (**Mumbai** or **Singapore** for India). Create — it takes ~2 min to boot.

## 2. Create the tables + storage + security (+ seed your products)
1. In the project: left sidebar → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy everything, paste it in, click **Run**.
3. You should see "Success". This created the `products` table (with your current 9 pieces),
   the `product-photos` storage bucket, and the security rules.

## 3. Create your admin login
1. Left sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your email + a password. **Tick "Auto Confirm User".** This is your `/admin` login.
3. (Optional, recommended) Authentication → **Providers** → Email → turn **off** "Allow new
   users to sign up", so only you can have an account.

## 4. Copy your keys
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy the **Project URL** and the **anon public** key.

## 5. Put the keys in place
- **Locally:** open `.env.local` in this repo and replace the two placeholder values with
  your Project URL and anon key. Save. (This file is git-ignored.)
- **For the live site (do this at launch):** in **Vercel** → your project → **Settings →
  Environment Variables**, add the same two:
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Done
Tell me once steps 1–5 are finished. Then I'll wire the homepage to read from the database
and build the `/admin` panel (login → add / edit / delete products, upload photos, toggle
sold-out). The anon key is safe to expose (it's meant for the browser); the real protection
is the login + the security rules from step 2.
