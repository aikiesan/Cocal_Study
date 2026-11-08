// Verificação rápida no navegador (sem dependências): abre o site no Edge/Chrome
// sem janela, percorre todas as etapas nos dois modos de dados, roda "Siga o
// carbono", registra erros do console e salva capturas de tela.
//
// Uso: sirva a pasta (python -m http.server 8000) e rode
//   node tools/verificar.mjs [url] [pasta-de-saida]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] || "http://localhost:8000/";
const OUT = process.argv[3] || "capturas";
const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const exe = BROWSERS.find(existsSync);
if (!exe) { console.error("Nenhum Edge/Chrome encontrado."); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 400);
const prof = join(tmpdir(), `cocal-verif-${port}`);
const br = spawn(exe, [`--remote-debugging-port=${port}`, "--headless=new", `--user-data-dir=${prof}`, "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws, seq = 0;
const pending = new Map(), errors = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); break; }
    } catch { /* ainda subindo */ }
    await sleep(200);
  }
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") errors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") errors.push(`${msg.params.entry.text} ${msg.params.entry.url || ""}`);
  };
}
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const shot = async (name) => { const r = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, `${name}.png`), Buffer.from(r.result.data, "base64")); };
const view = (width, height, mobile = false) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });

try {
  await connect();
  await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable");
  await view(1600, 1000);
  await send("Page.navigate", { url: URL_ + "?hora=11" });
  await sleep(4500);
  await shot("01-visao-geral");
  const ids = await evalJs(`[...document.querySelectorAll("[data-go]")].map(e => e.dataset.go).filter((v, i, a) => a.indexOf(v) === i)`);
  console.log("etapas no índice:", ids?.length ?? 0);
  const seen = new Set();
  for (const modo of ["projeto", "auditado"]) {
    await evalJs(`document.querySelector('[data-datamode="${modo}"]').click()`);
    await evalJs(`document.getElementById("btn-tour").click()`);
    await evalJs(`(() => { const a = document.getElementById("tour-auto"); if (a && a.classList.contains("on")) a.click(); })()`);
    await sleep(600);
    for (let i = 0; i < 30; i++) {
      const h = await evalJs("location.hash");
      seen.add(h);
      if (modo === "projeto" && ["#cana", "#digestato", "#limites", "#anp"].includes(h)) { await sleep(1400); await shot(`etapa-${h.slice(1)}`); }
      const end = await evalJs(`(() => { const b = document.getElementById("next"); if (!b || b.disabled) return true; b.click(); return false; })()`);
      await sleep(300);
      if (end) break;
    }
    await evalJs(`document.getElementById("btn-overview").click()`);
    await sleep(400);
  }
  console.log("etapas visitadas no tour:", seen.size);
  await evalJs(`document.getElementById("journey-btn").click()`);
  await sleep(5000);
  await shot("02-siga-o-carbono");
  await evalJs(`document.getElementById("journey-btn").click()`);
  await send("Page.navigate", { url: URL_ + "?mes=12&hora=19#cana" });
  await sleep(4000);
  await shot("03-cana-dezembro");
  await view(390, 844, true);
  await send("Page.navigate", { url: URL_ + "?hora=11" });
  await sleep(4000);
  await shot("04-celular");
} finally {
  console.log(errors.length ? `ERROS (${errors.length}):\n` + [...new Set(errors)].join("\n") : "Sem erros no console.");
  try { await send("Browser.close"); } catch { br.kill(); }
  await sleep(300); br.kill();
  process.exit(errors.length ? 1 : 0);
}
