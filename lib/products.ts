// ===== Products data layer =====
// Maps Supabase `products` rows to the client-side Product shape used by the
// homepage cards, and fetches the live list. Falls back to the static seed in
// app/shop-data.ts whenever Supabase isn't configured or a query fails.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductType, ProductStatus, Size } from "@/app/shop-data";

/** A row as stored in the Supabase `products` table. */
export type ProductRow = {
  id: string;
  name: string;
  category: ProductType;
  price: number;
  status: ProductStatus;
  fit: string;
  sizes: string[] | null;
  stock: Partial<Record<Size, number>> | null;
  colours: string[] | null;
  description: string;
  images: string[] | null;
  tone_a: string;
  tone_b: string;
  sort_order: number;
};

const DEFAULT_BOW = "#7A2E48";

/** Convert a DB row into the Product shape the homepage renders. */
export function rowToProduct(r: ProductRow): Product {
  const images = r.images ?? [];
  return {
    id: r.id,
    name: r.name,
    type: r.category,
    price: r.price,
    status: r.status,
    fit: r.fit ?? "",
    colours: r.colours ?? [],
    sizes: r.sizes ?? [],
    stock: r.stock ?? {},
    tones: [r.tone_a || "#F6CFC8", r.tone_b || "#C4485E"],
    bow: DEFAULT_BOW,
    img: images[0] || "",
    images,
    desc: r.description ?? "",
  };
}

/** Load every product, ordered for display. Throws on error (caller falls back to seed). */
export async function fetchProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(rowToProduct);
}

/** True when the public Supabase env vars are present (checked client-side). */
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
