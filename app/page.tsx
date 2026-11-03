"use client";

import { useEffect, useRef } from "react";

/* Deterministic so there's no hydration mismatch */
const PETALS = [
  { left: "3%", size: 26, dur: 17, delay: 0, char: "🌸" },
  { left: "11%", size: 18, dur: 22, delay: 4, char: "✨" },
  { left: "19%", size: 30, dur: 19, delay: 8, char: "🎀" },
  { left: "27%", size: 20, dur: 24, delay: 2, char: "💗" },
  { left: "36%", size: 24, dur: 16, delay: 11, char: "🦋" },
  { left: "44%", size: 16, dur: 21, delay: 6, char: "✨" },
  { left: "52%", size: 28, dur: 18, delay: 1, char: "🌸" },
  { left: "60%", size: 22, dur: 23, delay: 9, char: "🩰" },
  { left: "68%", size: 18, dur: 20, delay: 5, char: "💗" },
  { left: "76%", size: 30, dur: 17, delay: 13, char: "🎀" },
  { left: "84%", size: 20, dur: 25, delay: 3, char: "✨" },
  { left: "92%", size: 24, dur: 19, delay: 7, char: "🌸" },
  { left: "97%", size: 16, dur: 22, delay: 10, char: "🦋" },
];

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--mx", x.toFixed(3));
        el.style.setProperty("--my", y.toFixed(3));
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

  return (
    <main className="stage" ref={stageRef}>
      {/* ---- living background ---- */}
      <div className="bg" aria-hidden="true">
        <span className="aurora a1" />
        <span className="aurora a2" />
        <span className="aurora a3" />
        <span className="aurora a4" />
      </div>
      <div className="watermark" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />

      {/* ---- falling couture ---- */}
      <div className="petals" aria-hidden="true">
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

      {/* ---- content ---- */}
      <section className="card">
        <span className="tag r1">
          <span className="dot" />
          In the Atelier
        </span>

        <div className="logo-wrap r2">
          <span className="halo" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo" src="/GLU_Logo.jpg" alt="Girls Like Us logo" />
        </div>

        <p className="script r3">Something beautiful is on the hanger…</p>

        <h1 className="headline">
          <span className="line r4">Our Wardrobe Is Being Tailored </span>
          <span className="line shimmer r5">Styled&nbsp;to&nbsp;Perfection</span>
        </h1>

        <p className="lede r6">
          The racks are being curated, the seams are being steamed, and every
          piece is getting its final fitting. <strong>Girls Like Us</strong> is
          putting the finishing stitches on a collection made for girls, just
          like us. The fitting room opens soon.
        </p>

        <div className="rule r6" aria-hidden="true">
          <span>🎀</span>
        </div>

        <div className="seam r7" aria-hidden="true">
          <svg width="300" height="30" viewBox="0 0 300 30" fill="none">
            <path className="guide" d="M6 17 Q 78 7 150 15 T 294 17" />
            <path className="thread" d="M6 17 Q 78 7 150 15 T 294 17" />
          </svg>
          <span className="needle">🪡</span>
        </div>
        <p className="rail-label r7">Tailoring in progress · Stitch by stitch</p>

        <p className="signup-label r8">
          Be first in line for the reveal — the guestlist opens soon 💌
        </p>
        <form className="form r8" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Taking Guestlist Soon"
            aria-label="Guestlist — opening soon"
            disabled
            readOnly
          />
          <button type="button" disabled>
            Notify Me
          </button>
        </form>
        <p className="fineprint r8">
          No spam, only first looks &amp; VIP dressing-room invites.
        </p>

        <div className="socials r9">
          <a
            href="https://www.instagram.com/girlslikeus.store/"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5.5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="mailto:girlslikeusstore@gmail.com" aria-label="Email us">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
              <path d="M3 6l9 6.5L21 6" />
            </svg>
          </a>
          <a
            href="https://wa.me/"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.8 4.9-1.3A9.9 9.9 0 1 0 12 2zm0 1.8a8.1 8.1 0 0 1 6.9 12.4l-.3.5.8 2.9-3-.8-.5.3A8.1 8.1 0 1 1 12 3.8zm-2.9 3.9c-.2 0-.5.1-.7.4-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.2 5 4.4 2.4 1 2.9.8 3.5.8.6-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-2-1.3 7.4 7.4 0 0 1-1.3-1.7c-.1-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.1z" />
            </svg>
          </a>
        </div>

        <p className="footer r9">© 2026 Girls Like Us — A wardrobe for girls like us.</p>
        <p className="footer r9" style={{ marginTop: "0.35rem" }}>
          Heart-Picker by Divyalakshmi
        </p>
      </section>
    </main>
  );
}
