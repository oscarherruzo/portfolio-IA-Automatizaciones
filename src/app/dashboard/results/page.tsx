"use client";
import { useState, useEffect } from "react";

type Result = { id: string; app_id: string; app_name: string; app_icon: string; input_text: string; output_text: string; title: string; created_at: string };

export default function ResultsPage() {
  const [results, setResults]   = useState<Result[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Result | null>(null);
  const [search, setSearch]     = useState("");
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    fetch("/api/results").then(r => r.json()).then(data => { setResults(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function deleteResult(id: string) {
    await fetch("/api/results", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setResults(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function exportTxt(r: Result) {
    const blob = new Blob([`${r.app_name}\n${"=".repeat(40)}\n\nENTRADA:\n${r.input_text}\n\nRESULTADO:\n${r.output_text}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${r.app_name}-${r.id.slice(0,6)}.txt`; a.click();
  }

  const filtered = results.filter(r => r.app_name?.toLowerCase().includes(search.toLowerCase()) || r.title?.toLowerCase().includes(search.toLowerCase()) || r.output_text?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: "40px", color: "var(--text-3)" }}>Cargando resultados...</div>;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1280px", height: "calc(100vh - 48px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "4px" }}>💾 Resultados guardados</h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>{results.length} resultados guardados</p>
        </div>
        <input type="text" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 14px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", width: "220px" }} />
      </div>

      {results.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-3)", gap: "12px" }}>
          <span style={{ fontSize: "3rem" }}>💾</span>
          <span style={{ fontSize: "1rem", fontWeight: 600 }}>No tienes resultados guardados</span>
          <span style={{ fontSize: "0.85rem" }}>Usa cualquier app y pulsa el botón "Guardar resultado"</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", flex: 1, minHeight: 0 }}>
          {/* Lista */}
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflowY: "auto" }}>
            {filtered.map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{
                padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                background: selected?.id === r.id ? "var(--accent-dim)" : "transparent",
                borderLeft: selected?.id === r.id ? "3px solid var(--accent)" : "3px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span>{r.app_icon}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: selected?.id === r.id ? "var(--accent)" : "var(--text-1)" }}>{r.app_name}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.title || r.output_text?.slice(0, 50)}...
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "4px" }}>
                  {new Date(r.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>

          {/* Detalle */}
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px", overflowY: "auto" }}>
            {selected ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.8rem" }}>{selected.app_icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-1)" }}>{selected.app_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                        {new Date(selected.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { navigator.clipboard.writeText(selected.output_text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: copied ? "var(--green)" : "var(--text-2)", padding: "6px 12px", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                      {copied ? "✓ Copiado" : "Copiar"}
                    </button>
                    <button onClick={() => exportTxt(selected)}
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "6px 12px", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem" }}>
                      ⬇ .txt
                    </button>
                    <button onClick={() => deleteResult(selected.id)}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "rgb(239,68,68)", padding: "6px 12px", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem" }}>
                      🗑
                    </button>
                  </div>
                </div>
                {selected.input_text && (
                  <div style={{ background: "var(--bg-2)", borderRadius: "8px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: "6px" }}>Entrada</div>
                    <p style={{ fontSize: "0.83rem", color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{selected.input_text}</p>
                  </div>
                )}
                <div style={{ background: "var(--bg-2)", borderRadius: "8px", padding: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", marginBottom: "6px" }}>Resultado</div>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.84rem", color: "var(--text-1)", margin: 0, fontFamily: "inherit", lineHeight: 1.7 }}>{selected.output_text}</pre>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "10px" }}>
                <span style={{ fontSize: "2.5rem" }}>👈</span>
                <span>Selecciona un resultado para verlo</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
