import Link from "next/link";

/* Real product homepage — placeholder starting point.
   The coming-soon landing page now lives at /soon (app/soon/page.tsx). */
export default function Home() {
  return (
    <main style={{ padding: "4rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Girls Like Us</h1>
      <p>The real product site is being built here. This is a placeholder homepage.</p>
      <nav style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <Link href="/shop">Shop</Link>
        <Link href="/about">About</Link>
        <Link href="/soon">Coming-soon page</Link>
      </nav>
    </main>
  );
}
