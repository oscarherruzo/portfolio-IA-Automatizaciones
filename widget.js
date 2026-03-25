(function () {
  const cfg = window.IANegocios;
  if (!cfg) return;

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #ia-widget-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #238636; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(35,134,54,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; transition: transform 0.2s, box-shadow 0.2s;
    }
    #ia-widget-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(35,134,54,0.5); }
    #ia-widget-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 99998;
      width: 340px; background: #161b22;
      border: 1px solid #30363d; border-radius: 12px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      display: none; flex-direction: column; overflow: hidden;
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    #ia-widget-panel.open { display: flex; animation: iaSlideUp 0.25s ease both; }
    @keyframes iaSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    #ia-widget-header {
      background: #0d1117; padding: 14px 16px;
      border-bottom: 1px solid #30363d;
      display: flex; align-items: center; gap: 8px;
    }
    #ia-widget-header .dot { width:8px; height:8px; border-radius:50%; background:#3fb950; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    #ia-widget-header .title { flex:1; font-weight:600; font-size:14px; color:#e6edf3; }
    #ia-widget-header .close { background:none; border:none; color:#7d8590; cursor:pointer; font-size:16px; padding:0; }
    #ia-widget-messages {
      flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px;
      max-height:300px; min-height:120px;
    }
    .ia-msg { padding:10px 12px; border-radius:8px; font-size:13px; line-height:1.5; max-width:85%; }
    .ia-msg.bot { background:#1c2128; border:1px solid #30363d; color:#e6edf3; align-self:flex-start; border-radius:8px 8px 8px 2px; }
    .ia-msg.user { background:#238636; color:#fff; align-self:flex-end; border-radius:8px 8px 2px 8px; }
    .ia-msg.typing { color:#7d8590; font-style:italic; }
    #ia-widget-input-row { padding:10px; border-top:1px solid #30363d; display:flex; gap:8px; }
    #ia-widget-input {
      flex:1; background:#0d1117; border:1px solid #30363d; border-radius:6px;
      color:#e6edf3; padding:8px 10px; font-size:13px; outline:none;
      font-family:inherit; transition:border-color 0.15s;
    }
    #ia-widget-input:focus { border-color:#2f81f7; }
    #ia-widget-send {
      background:#238636; border:none; border-radius:6px; color:#fff;
      width:34px; height:34px; cursor:pointer; font-size:14px;
      display:flex; align-items:center; justify-content:center;
      transition:background 0.15s;
    }
    #ia-widget-send:hover { background:#2ea043; }
    #ia-widget-send:disabled { background:#21262d; cursor:not-allowed; }
    #ia-widget-footer { padding:6px; text-align:center; font-size:10px; color:#484f58; border-top:1px solid #21262d; }
  `;
  document.head.appendChild(style);

  // Create bubble
  const bubble = document.createElement("button");
  bubble.id = "ia-widget-bubble";
  bubble.innerHTML = "⚡";
  bubble.title = "Asistente IA";
  document.body.appendChild(bubble);

  // Create panel
  const panel = document.createElement("div");
  panel.id = "ia-widget-panel";
  panel.innerHTML = `
    <div id="ia-widget-header">
      <div class="dot"></div>
      <div class="title">Asistente IA</div>
      <button class="close" id="ia-widget-close">✕</button>
    </div>
    <div id="ia-widget-messages">
      <div class="ia-msg bot">¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?</div>
    </div>
    <div id="ia-widget-input-row">
      <input id="ia-widget-input" placeholder="Escribe tu mensaje..." />
      <button id="ia-widget-send">↑</button>
    </div>
    <div id="ia-widget-footer">Powered by IA para Negocios</div>
  `;
  document.body.appendChild(panel);

  // Toggle
  bubble.addEventListener("click", () => panel.classList.toggle("open"));
  document.getElementById("ia-widget-close").addEventListener("click", () => panel.classList.remove("open"));

  // Send message
  async function sendMessage() {
    const input = document.getElementById("ia-widget-input");
    const messages = document.getElementById("ia-widget-messages");
    const sendBtn = document.getElementById("ia-widget-send");
    const text = input.value.trim();
    if (!text) return;

    // User bubble
    const userMsg = document.createElement("div");
    userMsg.className = "ia-msg user";
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    input.value = "";
    sendBtn.disabled = true;
    messages.scrollTop = messages.scrollHeight;

    // Typing
    const typing = document.createElement("div");
    typing.className = "ia-msg bot typing";
    typing.textContent = "Escribiendo...";
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(cfg.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automationId: cfg.automationId, userId: cfg.userId, inputText: text }),
      });
      const data = await res.json();
      typing.remove();
      const botMsg = document.createElement("div");
      botMsg.className = "ia-msg bot";
      botMsg.textContent = data.output || "Lo siento, ha habido un error.";
      messages.appendChild(botMsg);
    } catch {
      typing.textContent = "Error de conexión. Inténtalo de nuevo.";
    } finally {
      sendBtn.disabled = false;
      messages.scrollTop = messages.scrollHeight;
    }
  }

  document.getElementById("ia-widget-send").addEventListener("click", sendMessage);
  document.getElementById("ia-widget-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
