// Ponto de entrada: liga diorama (stage), painel e navegação.
//
// Dois modos:
//  • Visão geral — o quadro fica PARADO. Tocar num pino/zona só abre o painel
//    e destaca a zona no mapa (sem zoom).
//  • Tour guiado — a câmera aproxima suavemente cada etapa, em ordem.
import { buildStops, CHAPTERS } from "./content/paradas.mjs";
import { createStage } from "./ui/stage.mjs";
import { renderIndex, renderStop, renderLegend } from "./ui/panel.mjs";
import { addLife } from "./ui/life.mjs";
import { createJourney } from "./ui/journey.mjs";
import { createAmbient } from "./ui/ambient.mjs";
import { anpDoMes, BIOMETANO } from "./data/numeros.mjs";

const $ = (id) => document.getElementById(id);
// ---------- modo tela (papel de parede / proteção de tela / vídeo)
//   ?tela            só o diorama, em tela cheia, sem painéis nem contador
//   &passeio         a câmera passeia devagar pelas etapas
//   &dia=300         duração de um dia, em segundos (padrão 60)
//   &hora=19         hora inicial (padrão 10)
const params = new URLSearchParams(location.search);
const TELA = params.has("tela");
if (TELA) document.body.classList.add("tela");
const svg = $("world"), panel = $("panel"), body = $("panel-body"), progress = $("progress");
const mobile = matchMedia("(max-width: 820px)");

let mode = "overview"; // "overview" | "tour"
let index = -1; // etapa aberta (-1 = índice)
// modo dos números: "projeto" (nominal/anunciado) ou "auditado" (RenovaBio, da especificação)
let dataMode = params.get("modo") === "auditado" ? "auditado" : "projeto";
let STOPS = buildStops(dataMode);
let tourStops = STOPS;
let exploreStops = STOPS.filter((s) => !s.tourOnly);

const stage = createStage(svg, { stops: STOPS, onPick: (id) => open(id) });
$("loading").remove();
addLife(stage);

// ---------- contador ao vivo: biogás processado na taxa média do mês (série ANP)
const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const MES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
let rate = 0, total = 0, lastT = 0, lastHud = 0, curRec = null;
stage.onFrame((t) => {
  const dt = lastT ? Math.min(0.1, t - lastT) : 0; lastT = t;
  if (ambient?.running) total += dt * rate;
  if (t - lastHud < 0.1) return; lastHud = t;
  $("hud-pot").textContent = nf.format(total);
});
// destaca no gráfico da ANP (se aberto) o mês em que está o relógio
const markMonth = () => { for (const el of body.querySelectorAll(".fig .col[data-k]")) el.classList.toggle("on", !!curRec && el.dataset.k === curRec.ym); };
function setMonth(m, safra) {
  const rec = anpDoMes(m);
  if (rec === curRec && setMonth.done) return;
  setMonth.done = true; curRec = rec;
  // 1 dia do relógio = 60 s: a taxa por segundo real é o volume de um dia em 60 s
  rate = rec ? rec.m3d / (Number(params.get("dia")) || 60) : 0;
  $("hud-bar-real").style.width = rec ? `${rec.pct}%` : "0%";
  $("hud-real").textContent = rec ? `${rec.pct}%` : "—";
  $("hud-eq").innerHTML = rec
    ? `ANP · ${MES_CURTO[m]}/${rec.ym.slice(2, 4)}: <b>${nf.format(rec.m3d)}</b> m³/d de biogás`
    : `ANP · ${MES_CURTO[m]}: <b>sem dado utilizável</b> (série de ago/25 a abr/26)`;
  // velocidade dos fluxos acompanha o uso da capacidade; sem dado, ritmo neutro
  const k = rec ? 0.35 + rec.pct / 45 : 0.8;
  for (const st of ["biogas", "dessulf", "biometano", "co2", "eletricidade", "digestato"]) stage.setSpeed(st, k);
  stage.setSpeed("vinhaca", safra ? 1 : 0.35);
  stage.setSpeed("substrato", safra ? 1 : 0.4);
  markMonth();
}

// ---------- relógio: dia/noite, demanda de gás e safra da cana
var ambient = createAmbient(stage, {
  night: stage.night,
  daySeconds: Number(params.get("dia")) || undefined,
  startHour: params.has("hora") ? Number(params.get("hora")) : 10,
  // começa em outubro: pico da safra e mês com dado da ANP (&mes=1..12 para mudar)
  startMonth: params.has("mes") ? Math.max(0, Math.min(11, Number(params.get("mes")) - 1)) : 9,
  onTick({ h, m, month, safra, pico, night, gasLevel }) {
    setMonth(m, safra);
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10;
    $("clk-time").textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    $("clk-ico").textContent = night > 0.5 ? "☾" : h < 8 || h > 17 ? "◐" : "☀";
    $("clk-month").textContent = month;
    $("clk-season").textContent = safra ? (pico ? "pico da safra" : "safra da cana") : "entressafra";
    $("clk-season").classList.toggle("off", !safra);
    $("gas-lvl").style.width = `${Math.round(gasLevel * 100)}%`;
  },
});
$("clk-pause").onclick = () => { const r = ambient.toggle(); $("clk-pause").textContent = r ? "❚❚" : "▶"; $("clk-pause").setAttribute("aria-label", r ? "Pausar o relógio" : "Retomar o relógio"); };

// ---------- figuras do painel conversam com o mapa
body.addEventListener("pointerover", (e) => { const g = e.target.closest("[data-tag]"); if (g && !journey.running) stage.hover(g.dataset.tag); });
body.addEventListener("pointerout", (e) => { if (e.target.closest("[data-tag]") && !journey.running) stage.hover(null); });

// ---------- "Siga o carbono"
const journey = createJourney(stage, {
  caption(text, i, n) {
    $("caption").hidden = !text;
    if (text) { $("cap-step").innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < i ? "done" : k === i ? "on" : ""}"></i>`).join(""); $("cap-text").textContent = text; $("cap-text").classList.remove("in"); void $("cap-text").offsetWidth; $("cap-text").classList.add("in"); }
  },
  onState(on) { $("journey-btn").textContent = on ? "■ Parar" : "▶ Siga o carbono"; document.body.classList.toggle("journey", on); },
});
$("journey-btn").onclick = () => (journey.running ? journey.stop() : (stage.frame(null, 700), journey.start()));

// ---------- passar o mouse: rótulo da peça e conexões acesas
const LABELS = Object.fromEntries(STOPS.filter((s) => s.tags && !s.badge).map((s) => [s.tags[0], s.kicker]));
Object.assign(LABELS, { usina: "Usina de biogás e biometano", palha: "Palha (uso não comprovado)", patio: "Pátio de cana", destilaria: "Destilaria", etanol: "Tanques de etanol", acucar: "Armazém de açúcar", separacao: "Separação e lagoas de digestato", flare: "Flare (posição esquemática)", citygate: "Estação de entrega da distribuidora", narandiba: "Narandiba", pirapozinho: "Pirapozinho", prudente: "Presidente Prudente", clientes: "Clientes do CO₂ verde", verticais: "Digestores verticais", horizontais: "Digestores horizontais", bunkers: "Bunkers de torta de filtro", lavoura: "Canavial com fertirrigação" });
const tip = $("tip");
svg.addEventListener("pointermove", (e) => {
  if (journey.running || e.pointerType === "touch") return;
  const tag = stage.tagAt(e.target);
  stage.hover(tag);
  if (!tag || !LABELS[tag]) { tip.hidden = true; return; }
  const r = $("map").getBoundingClientRect();
  tip.hidden = false;
  tip.innerHTML = `<b>${LABELS[tag]}</b><span>clique para saber mais</span>`;
  tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
});
svg.addEventListener("pointerleave", () => { if (!journey.running) stage.hover(null); tip.hidden = true; });

// legenda / camadas
$("legend").innerHTML = renderLegend();
$("legend").addEventListener("click", (e) => {
  const b = e.target.closest("[data-stream]");
  if (b) b.setAttribute("aria-pressed", String(stage.toggleStream(b.dataset.stream)));
});

function padding() {
  // no celular o painel cobre a parte de baixo do mapa
  if (!mobile.matches) return { top: 0, bottom: 0 };
  return { top: 0, bottom: 0 };
}

function list() { return mode === "tour" ? tourStops : exploreStops; }

function showIndex() {
  index = -1;
  body.innerHTML = renderIndex(STOPS, CHAPTERS);
  body.scrollTop = 0;
  $("panel-nav").hidden = true;
  stage.highlight(null);
  history.replaceState(null, "", location.pathname + location.search);
}

function show(i) {
  const L = list();
  index = Math.max(0, Math.min(L.length - 1, i));
  const stop = L[index];
  body.innerHTML = renderStop(stop, { index, total: L.length, inTour: mode === "tour" });
  markMonth();
  body.scrollTop = 0;
  $("panel-nav").hidden = false;
  $("prev").disabled = index === 0;
  $("next").disabled = index === L.length - 1;
  progress.style.setProperty("--p", `${((index + 1) / L.length) * 100}%`);
  progress.setAttribute("aria-label", `Etapa ${index + 1} de ${L.length}`);
  stage.highlight(stop.tags || stop.streams !== "all" ? stop : null);
  stage.frame(stop);
  panel.classList.remove("min");
  history.replaceState(null, "", `${location.search}#${stop.id}`);
}

function open(id) {
  const L = list();
  const i = L.findIndex((s) => s.id === id);
  if (i >= 0) show(i);
  else if (mode === "tour") { setMode("overview"); open(id); }
}

function setMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  stage.setFollow(m === "tour");
  $("btn-overview").classList.toggle("on", m === "overview");
  $("btn-tour").classList.toggle("on", m === "tour");
  $("btn-overview").setAttribute("aria-pressed", String(m === "overview"));
  $("btn-tour").setAttribute("aria-pressed", String(m === "tour"));
  $("back-overview").hidden = m !== "tour";
  if (m === "tour") show(0);
  else { stage.frame(null, 900); showIndex(); }
}

// ---------- projeto × auditado: refaz as etapas e reabre a que estava aberta
function setDataMode(m) {
  dataMode = m;
  document.body.dataset.data = m;
  for (const b of document.querySelectorAll("[data-datamode]")) { const on = b.dataset.datamode === m; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); }
  const openId = index >= 0 ? list()[index].id : null;
  STOPS = buildStops(m); tourStops = STOPS; exploreStops = STOPS.filter((s) => !s.tourOnly);
  if (openId) open(openId); else showIndex();
}
for (const b of document.querySelectorAll("[data-datamode]")) b.onclick = () => setDataMode(b.dataset.datamode);
document.body.dataset.data = dataMode;
for (const b of document.querySelectorAll("[data-datamode]")) { const on = b.dataset.datamode === dataMode; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); }

$("btn-overview").onclick = () => setMode("overview");
$("back-overview").onclick = () => setMode("overview");
$("btn-tour").onclick = () => setMode("tour");
$("prev").onclick = () => show(index - 1);
$("next").onclick = () => show(index + 1);
$("sheet-handle").onclick = () => panel.classList.toggle("min");
body.addEventListener("click", (e) => {
  if (e.target.closest("[data-home]")) showIndex();
  if (e.target.closest("[data-tour]")) setMode("tour");
  const go = e.target.closest("[data-go]");
  if (go) open(go.dataset.go);
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, summary")) return;
  if (e.key === "ArrowRight" && index >= 0) show(index + 1);
  if (e.key === "ArrowLeft" && index >= 0) show(index - 1);
  if (e.key === "Escape") setMode("overview");
});
addEventListener("resize", () => { stage.setPadding(padding()); stage.relayout(); });

// início: visão geral parada; um #id na URL abre direto a etapa
stage.setPadding(padding());
document.body.dataset.mode = mode;
stage.frame(null, 1);
const fromHash = location.hash.slice(1);
if (fromHash && STOPS.some((s) => s.id === fromHash)) {
  if (STOPS.find((s) => s.id === fromHash).tourOnly) { setMode("tour"); show(tourStops.findIndex((s) => s.id === fromHash)); }
  else open(fromHash);
} else showIndex();

// ---------- medidor de desempenho: abra a página com ?fps na URL
if (new URLSearchParams(location.search).has("fps")) {
  const el = document.createElement("div");
  el.className = "fps-meter";
  document.body.appendChild(el);
  let frames = 0, t0 = performance.now(), js0 = 0, n0 = 0;
  (function loop(now) {
    frames++;
    if (now - t0 >= 1000) {
      const p = window.__perf || { ms: 0, n: 1 };
      const js = (p.ms - js0) / Math.max(1, p.n - n0);
      el.textContent = `${Math.round((frames * 1000) / (now - t0))} fps · JS ${js.toFixed(1)} ms/quadro`;
      frames = 0; t0 = now; js0 = p.ms; n0 = p.n;
    }
    requestAnimationFrame(loop);
  })(performance.now());
}

// ---------- modo tela: passeio lento da câmera e cursor escondido
if (TELA) {
  if (params.has("passeio")) {
    const spots = STOPS.filter((s) => Array.isArray(s.focus));
    let k = 0;
    const step = () => {
      k++;
      const overview = k % 4 === 0;
      stage.setFollow(!overview);
      stage.frame(overview ? null : spots[(k * 7) % spots.length], 4500);
    };
    setInterval(step, 14000);
  }
  let idle;
  const wake = () => { document.body.classList.remove("idle"); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add("idle"), 2000); };
  addEventListener("pointermove", wake); wake();
}
