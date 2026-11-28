"use client";

// ===== Girls Like Us — admin panel (/admin) =====
// A single client-side page: sign in with Supabase Auth, then add / edit /
// delete products and upload their photos. Writes are allowed only for the
// signed-in admin (enforced by row-level security in the database), so this
// page is safe to ship publicly — visitors just see the login screen.
//
// Styling: app/admin/admin.css, all classes `adm-` prefixed (CSS Modules do
// NOT work in this project — see CLAUDE.md gotcha #4).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import { fetchProducts, supabaseConfigured } from "@/lib/products";
import { rupees, type Product, type ProductType, type ProductStatus } from "../shop-data";
import "./admin.css";

const CATEGORIES: ProductType[] = ["Dresses", "Tops", "Sets"];
const STATUSES: ProductStatus[] = ["available", "sold"];
const BUCKET = "product-photos";
const MAX_PHOTOS = 4;

/** Blank form state for a brand-new product. */
function emptyForm(): Product {
  return {
    name: "",
    type: "Dresses",
    price: 0,
    status: "available",
    fit: "",
    colours: [],
    sizes: [],
    tones: ["#F6CFC8", "#C4485E"],
    bow: "#7A2E48",
    img: "",
    images: [],
    desc: "",
  };
}

const toList = (s: string) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);
const fromList = (a?: string[]) => (a ?? []).join(", ");

/** Pull the storage path out of a public URL so we can delete the file. */
function storagePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

export default function AdminPage() {
  const supabase = useMemo(() => (supabaseConfigured() ? createClient() : null), []);
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  // ---- auth bootstrap ----
  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <Shell>
        <div className="adm-note">
          Supabase isn&apos;t configured yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then reload.
        </div>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <div className="adm-note">Loading…</div>
      </Shell>
    );
  }

  return session ? (
    <Dashboard supabase={supabase} email={session.user.email ?? ""} />
  ) : (
    <Login supabase={supabase} />
  );
}

/* ---------------- shell / page frame ---------------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-root">
      <div className="adm-bg" aria-hidden="true" />
      <main className="adm-wrap">{children}</main>
    </div>
  );
}

/* ---------------- login ---------------- */
function Login({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  };

  return (
    <Shell>
      <div className="adm-login">
        <p className="adm-kicker">Girls Like Us</p>
        <h1 className="adm-title">Studio sign-in</h1>
        <p className="adm-sub">Enter your admin email and password to manage the shop.</p>
        <form className="adm-form" onSubmit={submit}>
          <label className="adm-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="adm-error">{error}</p>}
          <button className="adm-btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </Shell>
  );
}

/* ---------------- dashboard ---------------- */
function Dashboard({
  supabase,
  email,
}: {
  supabase: ReturnType<typeof createClient>;
  email: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchProducts(supabase);
      setProducts(rows);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (p: Product) => {
    if (!p.id) return;
    if (!confirm(`Delete “${p.name}”? This can't be undone.`)) return;
    // best-effort: drop its photos from storage too
    const paths = (p.images ?? []).map(storagePath).filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  };

  return (
    <Shell>
      <header className="adm-top">
        <div>
          <p className="adm-kicker">Girls Like Us</p>
          <h1 className="adm-title">The rack</h1>
        </div>
        <div className="adm-top-actions">
          <span className="adm-who">{email}</span>
          <button className="adm-btn adm-ghost" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      <div className="adm-toolbar">
        <button className="adm-btn" onClick={() => setEditing(emptyForm())}>
          + Add product
        </button>
        <a className="adm-link" href="/" target="_blank" rel="noreferrer">
          View live site ↗
        </a>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-note">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="adm-note">No products yet. Click “Add product” to create the first one.</div>
      ) : (
        <ul className="adm-list">
          {products.map((p) => (
            <li className="adm-row" key={p.id}>
              <div
                className="adm-thumb"
                style={{ background: `linear-gradient(160deg, ${p.tones[0]}, ${p.tones[1]})` }}
              >
                {p.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.img} alt="" />
                ) : (
                  <span className="adm-thumb-empty">no photo</span>
                )}
              </div>
              <div className="adm-row-main">
                <p className="adm-row-name">
                  {p.name}
                  {p.status === "sold" && <span className="adm-badge">Sold</span>}
                </p>
                <p className="adm-row-meta">
                  {p.type} · {rupees(p.price)}
                  {p.sizes && p.sizes.length > 0 && <> · {p.sizes.join(", ")}</>}
                </p>
              </div>
              <div className="adm-row-actions">
                <button className="adm-btn adm-small" onClick={() => setEditing(p)}>
                  Edit
                </button>
                <button className="adm-btn adm-small adm-danger" onClick={() => remove(p)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductForm
          supabase={supabase}
          initial={editing}
          existingCount={products.length}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </Shell>
  );
}

/* ---------------- add / edit form ---------------- */
function ProductForm({
  supabase,
  initial,
  existingCount,
  onClose,
  onSaved,
}: {
  supabase: ReturnType<typeof createClient>;
  initial: Product;
  existingCount: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !initial.id;
  const [f, setF] = useState<Product>(initial);
  const [coloursText, setColoursText] = useState(fromList(initial.colours));
  const [sizesText, setSizesText] = useState(fromList(initial.sizes));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const images = f.images ?? [];

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = MAX_PHOTOS - images.length;
    if (room <= 0) {
      setError(`Up to ${MAX_PHOTOS} photos per product.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    setError("");
    const added: string[] = [];
    for (const file of files.slice(0, room)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        setError(upErr.message);
        break;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      added.push(data.publicUrl);
    }
    if (added.length) set("images", [...images, ...added]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = async (url: string) => {
    const path = storagePath(url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    set("images", images.filter((u) => u !== url));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      setError("Please give the piece a name.");
      return;
    }
    setBusy(true);
    setError("");
    const row = {
      name: f.name.trim(),
      category: f.type,
      price: Math.max(0, Math.round(Number(f.price) || 0)),
      status: f.status,
      fit: f.fit,
      sizes: toList(sizesText),
      colours: toList(coloursText),
      description: f.desc,
      images,
      tone_a: f.tones[0],
      tone_b: f.tones[1],
    };
    const res = initial.id
      ? await supabase.from("products").update(row).eq("id", initial.id)
      : await supabase.from("products").insert({ ...row, sort_order: existingCount + 1 });
    if (res.error) {
      setError(res.error.message);
      setBusy(false);
      return;
    }
    onSaved();
  };

  return (
    <div className="adm-modal" role="dialog" aria-modal="true">
      <div className="adm-backdrop" onClick={onClose} />
      <div className="adm-dialog">
        <div className="adm-dialog-head">
          <h2>{isNew ? "Add a product" : `Edit ${initial.name}`}</h2>
          <button className="adm-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="adm-form" onSubmit={save}>
          <label className="adm-field">
            <span>Name</span>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} required />
          </label>

          <div className="adm-two">
            <label className="adm-field">
              <span>Category</span>
              <select value={f.type} onChange={(e) => set("type", e.target.value as ProductType)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              <span>Price (₹)</span>
              <input
                type="number"
                min={0}
                value={f.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </label>
          </div>

          <div className="adm-two">
            <label className="adm-field">
              <span>Availability</span>
              <select
                value={f.status}
                onChange={(e) => set("status", e.target.value as ProductStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "available" ? "In stock" : "Sold out"}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              <span>Sizes (comma separated)</span>
              <input
                value={sizesText}
                onChange={(e) => setSizesText(e.target.value)}
                placeholder="XS, S, M"
              />
            </label>
          </div>

          <label className="adm-field">
            <span>Fit note</span>
            <input
              value={f.fit}
              onChange={(e) => set("fit", e.target.value)}
              placeholder="Free size, fits bust up to 38&quot;"
            />
          </label>

          <label className="adm-field">
            <span>Colours (comma separated)</span>
            <input
              value={coloursText}
              onChange={(e) => setColoursText(e.target.value)}
              placeholder="Black, Ivory, Pink"
            />
          </label>

          <label className="adm-field">
            <span>Description</span>
            <textarea rows={3} value={f.desc} onChange={(e) => set("desc", e.target.value)} />
          </label>

          <div className="adm-field">
            <span>
              Photos ({images.length}/{MAX_PHOTOS})
            </span>
            <div className="adm-photos">
              {images.map((url) => (
                <div className="adm-photo" key={url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="adm-photo-x"
                    onClick={() => removePhoto(url)}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < MAX_PHOTOS && (
                <button
                  type="button"
                  className="adm-photo-add"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading…" : "+ Photo"}
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onPick}
            />
          </div>

          <div className="adm-two">
            <label className="adm-field">
              <span>Backdrop tone A</span>
              <input
                type="color"
                value={f.tones[0]}
                onChange={(e) => set("tones", [e.target.value, f.tones[1]])}
              />
            </label>
            <label className="adm-field">
              <span>Backdrop tone B</span>
              <input
                type="color"
                value={f.tones[1]}
                onChange={(e) => set("tones", [f.tones[0], e.target.value])}
              />
            </label>
          </div>
          <p className="adm-hint">
            The backdrop tones show as a soft gradient behind pieces with no photo yet.
          </p>

          {error && <p className="adm-error">{error}</p>}

          <div className="adm-actions">
            <button type="button" className="adm-btn adm-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="adm-btn" disabled={busy || uploading}>
              {busy ? "Saving…" : isNew ? "Add product" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
