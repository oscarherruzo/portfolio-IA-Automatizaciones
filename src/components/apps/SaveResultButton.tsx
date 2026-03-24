"use client";
import { useState } from "react";

type Props = {
  appId: string;
  appName: string;
  outputText: string;
  inputText?: string;
  title?: string;
};

export default function SaveResultButton({ appId, appName, outputText, inputText, title }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function save() {
    if (!outputText || saving || saved) return;
    setSaving(true);
    await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_name: appName, output_text: outputText, input_text: inputText, title: title || outputText.slice(0, 60) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <button
      onClick={save}
      disabled={!outputText || saving || saved}
      style={{
        background: saved ? "rgba(63,185,80,0.15)" : "var(--bg-3)",
        border: `1px solid ${saved ? "rgba(63,185,80,0.4)" : "var(--border)"}`,
        color: saved ? "#3fb950" : "var(--text-2)",
        padding: "5px 12px", borderRadius: "6px",
        cursor: !outputText || saving || saved ? "not-allowed" : "pointer",
        fontSize: "0.75rem", fontWeight: 600,
        transition: "all 0.2s"
      }}
    >
      {saved ? "✓ Guardado" : saving ? "Guardando..." : "📁 Guardar resultado"}
    </button>
  );
}
