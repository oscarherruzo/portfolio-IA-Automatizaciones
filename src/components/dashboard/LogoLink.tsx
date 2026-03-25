"use client";
import Link from "next/link";
export default function LogoLink() {
  return (
    <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#e6edf3" }}>
      <div style={{ width: "28px", height: "28px", background: "#238636", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
      <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>IA para Negocios</span>
    </Link>
  );
}
