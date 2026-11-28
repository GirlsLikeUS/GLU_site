"use client";

import { useEffect, useRef, useState } from "react";
import {
  PRODUCTS,
  SWATCH,
  FILTERS,
  waLink,
  rupees,
  IG_URL,
  type Product,
} from "./shop-data";
import { createClient } from "@/lib/supabase/browser";
import { fetchProducts, supabaseConfigured } from "@/lib/products";
import "./home.css";

/* Deterministic falling couture — no hydration mismatch */
const PETALS = [
  { left: "4%", size: 24, dur: 19, delay: 0, char: "🌸" },
  { left: "13%", size: 16, dur: 24, delay: 5, char: "✨" },
  { left: "22%", size: 28, dur: 20, delay: 9, char: "🎀" },
  { left: "33%", size: 18, dur: 26, delay: 2, char: "💗" },
  { left: "45%", size: 22, dur: 18, delay: 12, char: "🦋" },
  { left: "56%", size: 15, dur: 23, delay: 6, char: "✨" },
  { left: "66%", size: 26, dur: 20, delay: 1, char: "🌸" },
  { left: "76%", size: 19, dur: 25, delay: 10, char: "🩰" },
  { left: "86%", size: 17, dur: 21, delay: 4, char: "💗" },
  { left: "94%", size: 24, dur: 18, delay: 8, char: "🎀" },
];

const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.8 4.9-1.3A9.9 9.9 0 1 0 12 2zm0 1.8a8.1 8.1 0 0 1 6.9 12.4l-.3.5.8 2.9-3-.8-.5.3A8.1 8.1 0 1 1 12 3.8zm-2.9 3.9c-.2 0-.5.1-.7.4-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.2 5 4.4 2.4 1 2.9.8 3.5.8.6-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-2-1.3 7.4 7.4 0 0 1-1.3-1.7c-.1-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.1z" />
  </svg>
);

const Bow = ({ color }: { color: string }) => (
  <svg
    className="glu-bow"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M32 30C22 16 8 16 8 26c0 10 14 10 24 4Z" />
    <path d="M32 30c10-14 24-14 24-4 0 10-14 10-24 4Z" />
    <circle cx="32" cy="30" r="3.5" />
    <path d="M30 33 22 54M34 33l8 21" />
  </svg>
);

function ProductCard({ p }: { p: Product }) {
  const sold = p.status === "sold";
  const msg = sold
    ? `Hi! Could you tell me if ${p.name} will be restocked?`
    : `Hi! I'd like to order ${p.name}. Colour: `;
  return (
    <article className={`glu-card glu-reveal${sold ? " glu-sold" : ""}`}>
      <div
        className="glu-photo"
        style={{ background: `linear-gradient(160deg, ${p.tones[0]}, ${p.tones[1]})` }}
      >
        {p.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.img} alt={p.name} />
        ) : (
          <Bow color={p.bow} />
        )}
        <span className="glu-ptag">{sold ? "Sold out" : "Limited"}</span>
      </div>
      <div className="glu-info">
        <h3>{p.name}</h3>
        <p className="glu-meta">{p.fit}</p>
        <p className="glu-desc">{p.desc}</p>
        <div className="glu-colours">
          {p.colours.map((c) => (
            <span
              key={c}
              className="glu-dot"
              title={c}
              style={{ background: SWATCH[c] || "#ddd" }}
            />
          ))}
          <span className="glu-names">{p.colours.join(", ")}</span>
        </div>
        <div className="glu-buy">
          <span className="glu-price">{rupees(p.price)}</span>
          <a
            className={`glu-btn glu-small${sold ? " glu-ghost" : ""}`}
            href={waLink(msg)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WaIcon />
            {sold ? "Ask about restock" : "Order on WhatsApp"}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  // Static seed renders instantly; live DB products replace it once loaded.
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  // load live products from Supabase (falls back to the seed on any failure)
  useEffect(() => {
    if (!supabaseConfigured()) return;
    let active = true;
    const supabase = createClient();
    fetchProducts(supabase)
      .then((rows) => {
        if (active && rows.length) setProducts(rows);
      })
      .catch((err) => {
        console.warn("[GLU] product fetch failed, showing seed:", err?.message ?? err);
      });
    return () => {
      active = false;
    };
  }, []);

  // mouse parallax (depth + cursor glow)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
        el.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
        el.style.setProperty("--cx", `${e.clientX}px`);
        el.style.setProperty("--cy", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // gentle reveal-on-scroll
  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".glu-reveal"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("glu-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("glu-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filter, products]);

  const shown = products.filter((p) => filter === "All" || p.type === filter).sort(
    (a, b) => Number(a.status === "sold") - Number(b.status === "sold")
  );

  return (
    <div className="glu-root" ref={stageRef} id="top">
      {/* ---- living background ---- */}
      <div className="glu-bg" aria-hidden="true">
        <span className="glu-aurora glu-a1" />
        <span className="glu-aurora glu-a2" />
        <span className="glu-aurora glu-a3" />
        <span className="glu-aurora glu-a4" />
      </div>
      <div className="glu-wm" aria-hidden="true" />
      <div className="glu-grain" aria-hidden="true" />
      <div className="glu-vig" aria-hidden="true" />
      <div className="glu-cursor" aria-hidden="true" />
      <div className="glu-petals" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              fontSize: `${p.size}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* ---- header ---- */}
      <header className="glu-header">
        <div className="glu-wrap glu-bar">
          <a className="glu-brand" href="#top" aria-label="Girls Like Us, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/GLU_Logo.jpg" alt="" />
            <span>Girls Like Us</span>
          </a>
          <nav aria-label="Main" className="glu-nav">
            <a href="#collection">Collection</a>
            <a href="#how">How to order</a>
            <a href="#details">Delivery</a>
            <a href="#about">About</a>
          </nav>
          <a
            className="glu-btn glu-small"
            href={waLink("Hi! I'd like to know more about Girls Like Us.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WaIcon />
            WhatsApp
          </a>
        </div>
      </header>

      <main>
        {/* ---- hero ---- */}
        <section className="glu-wrap glu-hero">
          <div className="glu-herogrid">
            <div>
              <p className="glu-eyebrow glu-reveal">Chosen by me, for that new-dress feeling</p>
              <h1 className="glu-h1 glu-reveal">
                Curated western wear, in <span className="glu-shimmer">limited pieces.</span>
              </h1>
              <p className="glu-lede glu-reveal">
                A small collection of dresses, shirts and sets, hand-picked in Chennai and
                wrapped like a gift. Message us on WhatsApp to order.
              </p>
              <div className="glu-cta glu-reveal">
                <a className="glu-btn" href="#collection">
                  Shop the collection
                </a>
                <a
                  className="glu-btn glu-ghost"
                  href={waLink("Hi! I'd like to order from Girls Like Us.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Order on WhatsApp
                </a>
              </div>
              <ul className="glu-facts glu-reveal">
                <li>Hand-picked in Chennai</li>
                <li>Limited pieces</li>
                <li>Delivery across India</li>
              </ul>
            </div>
            <div className="glu-med glu-reveal">
              <span className="glu-halo" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/GLU_Logo.jpg" alt="Girls Like Us logo" />
            </div>
          </div>
        </section>

        {/* ---- collection ---- */}
        <section className="glu-wrap glu-collection" id="collection">
          <div className="glu-head glu-reveal">
            <p className="glu-kicker">The collection</p>
            <h2 className="glu-h2">Pieces on the rack</h2>
            <p className="glu-sub">
              New pieces are added as they arrive. When a piece is gone, it&apos;s gone.
            </p>
          </div>
          <div className="glu-chips glu-reveal" role="group" aria-label="Filter by type">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`glu-chip${filter === f ? " glu-chip-on" : ""}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="glu-products">
            {shown.map((p) => (
              <ProductCard key={p.id ?? p.name} p={p} />
            ))}
          </div>
        </section>

        {/* ---- styling band ---- */}
        <section className="glu-wrap glu-styling">
          <div className="glu-band glu-reveal">
            <h2 className="glu-h2">Not sure what to wear?</h2>
            <p>
              Tell us your occasion — a trip, a birthday, a concert — and we&apos;ll style it
              from the collection.
            </p>
            <a
              className="glu-btn"
              href={waLink("Hi! I need help styling an outfit. My occasion is: ")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask for styling
            </a>
          </div>
        </section>

        {/* ---- how to order ---- */}
        <section className="glu-wrap glu-how" id="how">
          <div className="glu-head glu-reveal">
            <p className="glu-kicker">Three little steps</p>
            <h2 className="glu-h2">How to order</h2>
          </div>
          <div className="glu-steps">
            {[
              { n: "01", t: "Pick your piece", d: "Choose from the collection, or tell us your occasion and we'll suggest options." },
              { n: "02", t: "Message us", d: "Send the piece, colour and your delivery address on WhatsApp or Instagram." },
              { n: "03", t: "Pay and we ship", d: "Pay by UPI and we'll pack it like a gift and send it your way." },
            ].map((s) => (
              <div className="glu-step glu-reveal" key={s.n}>
                <b>{s.n}</b>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- details ---- */}
        <section className="glu-wrap glu-details" id="details">
          <div className="glu-head glu-reveal">
            <p className="glu-kicker">The practical bits</p>
            <h2 className="glu-h2">Fit, delivery &amp; policies</h2>
          </div>
          <dl className="glu-list">
            {[
              ["Fit", "Most pieces are free size, and each listing says how far it stretches. Not sure? Send us your bust measurement and we'll tell you honestly if it will fit."],
              ["Delivery", "Chennai in about 3 days. Most other places in 5–7 working days. Remote pincodes can take 10–15 working days."],
              ["Shipping", "₹70 per order."],
              ["Payment", "Prepaid by UPI. Currently not accepting cash on delivery."],
              ["Cancellations", "Orders can't be cancelled once confirmed."],
              ["Exchanges", "For damaged or wrong items only. Message us within 24 hours with an unboxing video."],
            ].map(([dt, dd]) => (
              <div className="glu-reveal" key={dt}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- about ---- */}
        <section className="glu-wrap glu-about" id="about">
          <div className="glu-inner glu-reveal">
            <p className="glu-script">Hi, I&apos;m Divyalakshmi.</p>
            <h2 className="glu-h2">The girl behind the rack</h2>
            <p>
              For years I was only the customer. Shopping was my happy place, and I loved the
              unboxing as much as the outfit. So I started Girls Like Us: a small collection
              where every piece is chosen by me and packed like a gift.
            </p>
            <p>
              You may also know me from{" "}
              <a href="https://instagram.com/glowthisway" target="_blank" rel="noopener noreferrer">
                @glowthisway
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      {/* ---- footer ---- */}
      <footer className="glu-footer">
        <div className="glu-wrap glu-foot glu-reveal">
          <h2 className="glu-h2">Ready to order?</h2>
          <div className="glu-links">
            <a
              className="glu-btn"
              href={waLink("Hi! I'd like to place an order.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WaIcon />
              Message us on WhatsApp
            </a>
            <a className="glu-btn glu-ghost" href={IG_URL} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
          <p className="glu-fine">© 2026 Girls Like Us · Chennai · Hand picked by Divyalakshmi</p>
        </div>
      </footer>

      {/* ---- floating order button ---- */}
      <a
        className="glu-btn glu-float"
        href={waLink("Hi! I'd like to order from Girls Like Us.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
      >
        <WaIcon />
        <span>Order</span>
      </a>
    </div>
  );
}
