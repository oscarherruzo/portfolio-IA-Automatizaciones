"use client";

import Link from "next/link";

export default function ViewAllButton() {
  return (
    <Link href="/dashboard/automations" style={{ textDecoration: "none" }}>
      <div
        style={{
          marginTop: "8px",
          padding: "9px",
          borderRadius: "8px",
          border: "1px dashed var(--border-bright)",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: "0.78rem",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-bright)";
          e.currentTarget.style.color = "var(--text-3)";
        }}
      >
        + Ver todos los tipos
      </div>
    </Link>
  );
}