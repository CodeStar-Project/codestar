"use client";

import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function GlobalError() {
  return (
    <html lang="en" className={outfit.className}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "var(--ge-bg)",
          color: "var(--ge-text)",
        }}
      >
        <style>{`
          :root {
            --ge-bg: #f4f6fb;
            --ge-surface: rgba(255, 255, 255, 0.72);
            --ge-border: rgba(255, 255, 255, 0.65);
            --ge-text: #1a1f2e;
            --ge-text-soft: #4a5366;
            --ge-shadow: 0 8px 32px rgba(31, 38, 135, 0.08);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --ge-bg: #0e1422;
              --ge-surface: rgba(20, 28, 48, 0.78);
              --ge-border: rgba(255, 255, 255, 0.1);
              --ge-text: #edf1f9;
              --ge-text-soft: #b6c0d6;
              --ge-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
            }
          }
        `}</style>
        <main
          style={{
            maxWidth: "32rem",
            textAlign: "center",
            padding: "2.5rem",
            borderRadius: "22px",
            background: "var(--ge-surface)",
            border: "1px solid var(--ge-border)",
            boxShadow: "var(--ge-shadow)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--ge-text)",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0.75rem 0 1.75rem",
              fontSize: "0.95rem",
              lineHeight: 1.55,
              color: "var(--ge-text-soft)",
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "inherit",
              fontSize: "0.92rem",
              fontWeight: 500,
              padding: "0.65rem 1.4rem",
              borderRadius: "99px",
              border: "1px solid var(--ge-border)",
              background: "var(--ge-surface)",
              color: "var(--ge-text)",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
