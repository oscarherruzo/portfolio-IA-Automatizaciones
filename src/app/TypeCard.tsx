"use client";

import Link from "next/link";

export default function TypeCard({ t }: any) {
  return (
    <Link
      href={`/dashboard/automations?new=${t.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          padding: "12px",
          borderRadius: "10px",
          background: "var(--bg-3)",
          border: "1px solid var(--border-bright)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = t.color;
          e.currentTarget.style.background = `${t.color}10`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-bright)";
          e.currentTarget.style.background = "var(--bg-3)";
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>
        <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
          {t.label}
        </span>
        <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>
          {t.desc}
        </span>
      </div>
    </Link>
  );
}