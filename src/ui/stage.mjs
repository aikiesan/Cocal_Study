// Palco: monta o diorama no SVG, enquadra a câmera (estática na visão geral,
// com voo suave apenas no tour), anima fluxos/veículos e destaca zonas.
import { buildWorld, focusRect, iso } from "../scene/world.mjs";
import { materialCss } from "../scene/materials.mjs";
import { HOME } from "../scene/zones/destinos.mjs";
import { DIGESTERS } from "../scene/zones/biogas.mjs";
import { STREAMS, CERT } from "./palette.mjs";
import { PLOTS, SPOTS } from "../scene/layout.mjs";

const NS = "http://www.w3.org/2000/svg";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createStage(svg, { stops, onPick }) {
  const W = buildWorld();
  const style = document.createElement("style");
  style.textContent = materialCss() + Object.entries(STREAMS).map(([k, s]) => `.s-${k}{--c:${s.color}}`).join("");
  document.head.appendChild(style);

  // ---------- pinos numerados e selos de certificado
  const pin = (s) => {
    const [x, y] = iso(s.anchor);
    return `<g class="pin" data-stop="${s.id}" tabindex="0" role="button" aria-label="${s.n}. ${s.kicker}">
      <g class="scaled" data-x="${x}" data-y="${y}"><path class="ps" d="M0,0 L0,-9"/><circle class="ring" cx="0" cy="-20" r="11"/><circle class="pc" cx="0" cy="-20" r="11"/><text class="pt" x="0" y="-20">${s.n}</text>
      <text class="pin-label" x="16" y="-20">${s.kicker}</text></g></g>`;
  };
  const badge = (s) => {
    const [x, y] = iso(s.badge.at);
    const hex = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${(Math.cos(a) * 15).toFixed(1)},${(Math.sin(a) * 15).toFixed(1)}`; }).join(" ");
    return `<g class="pin cert" data-stop="${s.id}" tabindex="0" role="button" aria-label="${s.n}. ${s.kicker}">
      <g class="scaled" data-x="${x}" data-y="${y}"><polygon class="ring" points="${hex}"/><polygon class="hx" points="${hex}" fill="${CERT[s.id]}"/><text class="ht">${s.badge.tag}</text>
      <text class="pin-label" x="20" y="0">${s.kicker}</text></g></g>`;
  };
  const pins = stops.filter((s) => s.anchor).map(pin).join("") + stops.filter((s) => s.badge).map(badge).join("");

  // ---------- efeitos
  const fx = [];
  const flame = (p, s = 1, cls = "flame") => { const [x, y] = iso(p); return `<path class="${cls}" d="M${x},${y} c${-3 * s},${-4 * s} ${-2 * s},${-9 * s} 0,${-13 * s} c${2 * s},${4 * s} ${3 * s},${9 * s} 0,${13 * s}Z"/>`; };
  fx.push(`<g data-fx="flare">${flame([...SPOTS.flare, SPOTS.flareTop + 2], 1.1)}</g>`, `<g data-fx="casa">${flame([HOME.x + 16, HOME.y + 10, 6], 0.5, "flame blue")}</g>`);
  const smoke = (p, delays = [0, 1.7, 3.4]) => { const [x, y] = iso(p); return delays.map((d) => `<circle class="smoke" cx="${x}" cy="${y}" r="3" style="animation-delay:${d}s"/>`).join(""); };
  fx.push(...SPOTS.boilerStacks.map((p, i) => smoke(p, [i * 0.8, 1.7 + i * 0.8, 3.4 + i * 0.8])), ...SPOTS.chpStack.map((p, i) => smoke(p, [0.4 + i, 2.1 + i, 3.8 + i])));
  DIGESTERS.forEach(([cx, cy], k) => { for (let i = 0; i < 3; i++) { const [x, y] = iso([cx - 10 + i * 9, cy + 8 - i * 4, 31]); fx.push(`<circle class="bubble" cx="${x}" cy="${y}" r="1.4" style="animation-delay:${(i * 0.8 + k * 0.5).toFixed(1)}s"/>`); } });
  // raios de eletricidade na subestação
  { const [x, y] = iso(SPOTS.substation); fx.push(`<path class="spark" d="M${x},${y} l3,-6 l-2,0 l3,-6"/>`); }

  // ---------- CAMADAS
  // O diorama é dividido em várias <svg>/<canvas> empilhadas. As camadas
  // estáticas (chão e objetos, que são pesadas) são desenhadas uma única vez e
  // ficam em camadas próprias do compositor; só as camadas leves (fluxos,
  // partículas, veículos, efeitos) são repintadas a cada quadro.
  const root = svg; // <div id="world" class="layers">
  const L = (id, body, { kind = "svg", cls = "" } = {}) => kind === "canvas"
    ? `<canvas id="${id}" class="layer ${cls}"></canvas>`
    : `<svg id="${id}" class="layer ${cls}" xmlns="${NS}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
  root.insertAdjacentHTML("beforeend", `<div class="cam" id="cam">` +
    `<div id="ly-world-bg" class="worldhtml">${W.layers.sky}</div>` +
    L("ly-ground", `<defs>${W.defs}</defs><g id="L-ground">${W.layers.ground}</g><g id="L-pipes">${W.layers.pipes}</g>`, { cls: "static interactive" }) +
    L("ly-cores", `<defs>${W.defs}</defs><g id="L-under">${W.layers.under}</g><g id="halo-plots"></g><g id="L-cores">${W.layers.cores}</g><g id="L-vehicles">${W.layers.vehicles}</g>`, { cls: "anim" }) +
    L("ly-particles", "", { kind: "canvas" }) +
    `<img id="ly-halo" class="layer static" alt="" hidden>` +
    `<img id="ly-halo-hover" class="layer static" alt="" hidden>` +
    L("ly-objects", `<defs>${W.defs}</defs><g id="L-objects">${W.layers.objects}</g>`, { cls: "static interactive" }) +
    L("ly-over", `<defs>${W.defs}</defs><g id="L-dyn">${W.layers.dyn}</g><g id="L-vehicles-top">${W.layers.vehiclesTop}</g><g id="L-life"></g><g id="L-overhead">${W.layers.overhead}</g><g id="L-fx">${fx.join("")}</g>`, { cls: "anim" }) +
    L("ly-lights", `<rect id="night-tint-rect" x="-4000" y="-4000" width="9000" height="9000"/><g id="L-lights"></g>`, { cls: "fade" }) +
    L("ly-top", "", { kind: "canvas" }) +
    L("ly-pins", `<g id="L-pins">${pins}</g>`, { cls: "pins" }) +
    L("ly-journey", `<g id="L-journey"></g>`, { cls: "anim" }) +
    `<div id="ly-world-fg" class="worldhtml"></div>` +
    `</div>`);
  const cam = document.getElementById("cam");
  const svgs = [...cam.querySelectorAll("svg.layer")];
  const canvases = [document.getElementById("ly-particles"), document.getElementById("ly-top")];

  // ---------- câmera
  // Na visão geral o quadro é fixo. No tour, o voo usa só transform CSS sobre
  // as camadas já desenhadas (barato) e, ao chegar, redesenha nítido no novo viewBox.
  const B = W.bounds;
  let vb = { ...B }, raster = { ...B }, tween = null, follow = false, viewPad = { top: 0, bottom: 0 }, pinScale = 1;
  const scaled = [...root.querySelectorAll(".scaled")];
  const size = () => { const r = root.getBoundingClientRect(); return { w: r.width || 1, h: r.height || 1 }; };
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);
  function sizeCanvases() {
    const { w, h } = size(), d = dpr();
    for (const c of canvases) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
  }
  function apply() {
    // redesenha as camadas no viewBox atual (caro: só no fim de um voo ou ao redimensionar)
    const { w } = size();
    const vbs = `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`;
    for (const el of svgs) el.setAttribute("viewBox", vbs);
    raster = { ...vb };
    cam.style.transform = "";
    const k = Math.min(3.5, Math.max(0.55, vb.w / w));
    pinScale = k;
    for (const g of scaled) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${k.toFixed(3)})`);
    // camadas HTML em coordenadas de mundo (nuvens, pássaros, avião): só transform
    const kk = w / vb.w;
    for (const el of root.querySelectorAll(".worldhtml")) el.style.transform = `matrix(${kk},0,0,${kk},${(-vb.x * kk).toFixed(2)},${(-vb.y * kk).toFixed(2)})`;
    if (typeof refreshHalos === "function") try { refreshHalos(); } catch {}
  }
  function camTransform() {
    // mapeia o raster (feito em `raster`) para a vista atual `vb`, sem repintar
    const { w } = size();
    const k = w / vb.w, s = raster.w / vb.w;
    cam.style.transform = `translate(${((raster.x - vb.x) * k).toFixed(2)}px, ${((raster.y - vb.y) * k).toFixed(2)}px) scale(${s.toFixed(4)})`;
  }
  function fit(rect, pad = 1) {
    const { w, h } = size();
    const ah = h - viewPad.top - viewPad.bottom;
    const k = Math.max((rect.w * pad) / w, (rect.h * pad) / ah);
    const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
    return { x: cx - (w / 2) * k, y: cy - (viewPad.top + ah / 2) * k, w: w * k, h: h * k };
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function flyTo(target, ms = 1200) {
    if (reduceMotion || ms <= 1) { vb = target; tween = null; apply(); return; }
    const from = { ...vb }, t0 = performance.now();
    tween = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      vb = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e };
      if (t >= 1) { tween = null; apply(); } else camTransform();
    };
  }
  const overviewRect = () => fit(B, 1.0);
  let current = null;
  function frame(stop, ms = 1200) {
    if (!follow || !stop || stop.focus === "all") return flyTo(overviewRect(), ms);
    const [x0, y0, x1, y1] = stop.focus;
    flyTo(fit(focusRect([x0, y0, x1, y1], 50), 1.1), ms);
  }

  // ---------- contorno (halo) pré-renderizado como imagem
  // O filtro de contorno é caro; em vez de recalculá-lo a cada quadro, a
  // silhueta dos objetos destacados vira uma imagem estática uma única vez.
  const HALO_FILTER = `<filter id="h" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d1"/><feFlood flood-color="#00573A"/><feComposite in2="d1" operator="in" result="o1"/><feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="d2"/><feGaussianBlur in="d2" stdDeviation="2.2" result="b2"/><feFlood flood-color="#B6E03B"/><feComposite in2="b2" operator="in" result="o2"/><feMerge><feMergeNode in="o2"/><feMergeNode in="o1"/></feMerge></filter>`;
  const haloState = new Map();
  function renderHalo(img, els) {
    const key = els.map((e) => e.id).join(",") + "|" + raster.x.toFixed(1) + raster.w.toFixed(1);
    if (haloState.get(img) === key) return;
    haloState.set(img, key);
    if (img.dataset.url) { URL.revokeObjectURL(img.dataset.url); delete img.dataset.url; }
    if (!els.length) { img.hidden = true; return; }
    const { w, h } = size(), d = dpr();
    const body = els.map((e) => e.outerHTML).join("");
    const svgText = `<svg xmlns="${NS}" width="${Math.round(w * d)}" height="${Math.round(h * d)}" viewBox="${raster.x} ${raster.y} ${raster.w} ${raster.h}" preserveAspectRatio="none"><style>*{fill:#000;stroke:none}</style><defs>${HALO_FILTER}</defs><g filter="url(#h)">${body}</g></svg>`;
    const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
    img.dataset.url = url;
    img.onload = () => { if (img.dataset.url === url) img.hidden = false; };
    img.src = url;
  }
  let selEls = [], hoverEls = [];
  function refreshHalos() { renderHalo(haloImg, selEls); renderHalo(hoverImg, hoverEls); }
  const haloImg = document.getElementById("ly-halo"), hoverImg = document.getElementById("ly-halo-hover");

  // ---------- destaque
  const tagged = [...root.querySelectorAll("#L-ground [data-tag], #L-objects [data-tag], #L-dyn [data-tag]")];
  const flows = [...root.querySelectorAll(".flow")];
  let emStreams = null;
  function highlight(stop) {
    current = stop;
    const on = stop && stop.tags;
    root.dataset.sel = on ? stop.tags.join(" ") : "";
    root.classList.toggle("focus", !!on);
    // destaque SEM esmaecer: contorno verde + brilho lima atrás dos objetos
    // da etapa e borda animada no lote da zona. O resto do mapa fica intacto.
    // (elementos do chão, como rio e represa, não entram no contorno: ficariam preenchidos)
    const hl = on ? tagged.filter((el) => stop.tags.includes(el.dataset.tag) && !el.classList.contains("plotg") && !el.closest("#L-ground")) : [];
    selEls = hl; renderHalo(haloImg, selEls);
    document.getElementById("halo-plots").innerHTML = on ? PLOTS.filter((p) => stop.tags.includes(p.id)).map((p) => {
      const d = "M" + [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.d], [p.x, p.y + p.d]].map(([x, y]) => iso([x, y, 1.7]).map((v) => v.toFixed(1)).join(",")).join("L") + "Z";
      return `<path class="plot-hl" d="${d}"/><path class="plot-ants" d="${d}"/>`;
    }).join("") : "";
    refreshDash();
    const streams = stop && stop.streams && stop.streams !== "all" ? stop.streams : null;
    for (const g of flows) g.classList.toggle("em", !!streams && streams.includes(g.dataset.stream));
    emStreams = streams ? new Set(streams) : null;
    for (const p of root.querySelectorAll(".pin")) p.classList.toggle("on", !!stop && p.dataset.stop === stop.id);
  }
  const hidden = new Set();
  function toggleStream(k) {
    hidden.has(k) ? hidden.delete(k) : hidden.add(k);
    for (const g of flows) g.classList.toggle("off", hidden.has(g.dataset.stream));
    return !hidden.has(k);
  }

  // ---------- partículas (canvas) com trajetórias pré-amostradas
  // Cada caminho é amostrado uma vez (a cada 2 unidades); por quadro só se lê a tabela.
  const STEP = 2;
  const particles = [];
  const tables = {};
  for (const f of W.flows) {
    const path = document.getElementById(f.id);
    if (!path) continue;
    const len = path.getTotalLength();
    const n = Math.max(2, Math.ceil(len / STEP) + 1);
    const tab = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { const q = path.getPointAtLength(Math.min(len, i * STEP)); tab[i * 2] = q.x; tab[i * 2 + 1] = q.y; }
    tables[f.id] = { tab, n, len };
    const air = (f.stream === "eletricidade" && f.id.startsWith("w-")) || f.stream === "conhecimento";
    const count = Math.max(1, Math.round(len / (air ? 60 : 36)));
    for (let i = 0; i < count; i++) particles.push({ id: f.id, tab, n, L: len, d: (i / count) * len, stream: f.stream, air, color: STREAMS[f.stream].color, speed: f.stream === "eletricidade" ? 70 : f.stream === "conhecimento" ? 45 : 24 });
  }
  // correnteza do rio: traços brancos que deslizam (no canvas, sem repintar o SVG)
  root.querySelectorAll("#L-under .current").forEach((path, ci) => {
    const len = path.getTotalLength();
    const n = Math.max(2, Math.ceil(len / STEP) + 1);
    const tab = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { const q = path.getPointAtLength(Math.min(len, i * STEP)); tab[i * 2] = q.x; tab[i * 2 + 1] = q.y; }
    const count = Math.round(len / 34);
    for (let i = 0; i < count; i++) particles.push({ id: `cur${ci}`, tab, n, L: len, d: ((i + ci * 0.37) / count) * len, stream: "agua", air: false, color: "rgba(255,255,255,.8)", r: 0.9, noStroke: true, speed: 9 + (ci % 3) * 3 });
  });
  const drawers = [];
  let night = 0;
  const clockFns = [];
  const sprites = new Map();
  function sprite(color) {
    if (sprites.has(color)) return sprites.get(color);
    const c = document.createElement("canvas"); c.width = c.height = 32;
    const x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, color); g.addColorStop(0.25, color); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.globalAlpha = 1; x.fillRect(0, 0, 32, 32);
    sprites.set(color, c); return c;
  }
  let hotIds = null;
  const ctxs = canvases.map((c) => c.getContext("2d"));
  function drawParticles(dt) {
    const { w } = size(), d = dpr(), k = (w / raster.w) * d;
    for (const ctx of ctxs) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(k, 0, 0, k, -raster.x * k, -raster.y * k); }
    // agrupa por cor para poucas chamadas de desenho
    const groups = new Map();
    for (const p of particles) {
      if (hidden.has(p.stream)) continue;
      p.d = (p.d + dt * p.speed * (speedMul[p.stream] ?? 1)) % p.L;
      const i = Math.min(p.n - 1, Math.round(p.d / STEP));
      const big = (emStreams && emStreams.has(p.stream)) || (hotIds && hotIds.has(p.id));
      const key = `${p.air ? 1 : 0}|${p.color}|${big ? 1 : 0}`;
      let g = groups.get(key);
      if (!g) groups.set(key, (g = { ctx: ctxs[p.air ? 1 : 0], color: p.color, r: (p.r ?? (p.air ? 1.8 : 2.3)) * (big ? 1.4 : 1), stroke: !p.noStroke, pts: [] }));
      g.pts.push(p.tab[i * 2], p.tab[i * 2 + 1]);
    }
    for (const g of groups.values()) {
      const { ctx } = g;
      ctx.beginPath();
      for (let j = 0; j < g.pts.length; j += 2) { ctx.moveTo(g.pts[j] + g.r, g.pts[j + 1]); ctx.arc(g.pts[j], g.pts[j + 1], g.r, 0, Math.PI * 2); }
      ctx.fillStyle = g.color; ctx.fill();
      if (g.stroke) { ctx.lineWidth = 0.7; ctx.strokeStyle = "#fff"; ctx.stroke(); }
    }
    // à noite (canvas acima do véu noturno): faróis e brilho dos fluxos de energia,
    // com sprites pré-renderizados (drawImage é bem mais barato que arcos com blur)
    const nctx = ctxs[1];
    if (night > 0.05) {
      nctx.globalAlpha = 0.55 * night;
      for (const g of groups.values()) {
        if (!g.stroke) continue;
        const spr = sprite(g.color), R = g.r * 2.6;
        for (let j = 0; j < g.pts.length; j += 2) nctx.drawImage(spr, g.pts[j] - R, g.pts[j + 1] - R, R * 2, R * 2);
      }
      const head = sprite("#FFE7A0");
      for (const v of vehicles) {
        if (v.hx === undefined || (v.op ?? 1) < 0.05 || (v.safra && document.body.classList.contains("entressafra"))) continue;
        nctx.globalAlpha = 0.85 * night * (v.op ?? 1);
        const fx = v.hx + v.dx * 9, fy = v.hy + v.dy * 9 - 2.5;
        nctx.drawImage(head, fx + v.dx * 5 - 9, fy + v.dy * 5 - 9, 18, 18);
      }
      nctx.globalAlpha = 1;
    }
    for (const fn of drawers) fn(ctxs[0], ctxs[1], dt, performance.now() / 1000);
  }
  const vehicles = W.vehicles.map((v, i) => {
    const el = document.getElementById(v.id);
    const segs = []; let total = 0;
    for (let k = 0; k < v.pts.length - 1; k++) {
      const a = v.screen[k], b = v.screen[k + 1];
      const dx = v.pts[k + 1][0] - v.pts[k][0], dy = v.pts[k + 1][1] - v.pts[k][1];
      const head = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "px" : "nx") : dy > 0 ? "py" : "ny";
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push({ a, b, len, head, start: total }); total += len;
    }
    const variants = Object.fromEntries(["px", "nx", "py", "ny"].map((h) => [h, el.querySelector(`.veh-${h}`)]));
    const loop = v.pts[0][0] === v.pts[v.pts.length - 1][0] && v.pts[0][1] === v.pts[v.pts.length - 1][1];
    return { el, segs, total, variants, loop, safra: v.season === "safra", cur: null, off: i * 173, speed: v.speed ?? (v.kind === "car" ? 46 : 32) };
  });
  function place(v, d) {
    const s = v.segs.find((sg) => d <= sg.start + sg.len) || v.segs[v.segs.length - 1];
    const u = s.len ? (d - s.start) / s.len : 0;
    if (v.cur !== s.head) { if (v.cur) v.variants[v.cur].style.display = "none"; v.variants[s.head].style.display = ""; v.cur = s.head; }
    v.hx = s.a[0] + (s.b[0] - s.a[0]) * u; v.hy = s.a[1] + (s.b[1] - s.a[1]) * u;
    v.dx = (s.b[0] - s.a[0]) / (s.len || 1); v.dy = (s.b[1] - s.a[1]) / (s.len || 1);
    const tr = `translate(${v.hx.toFixed(1)} ${v.hy.toFixed(1)})`;
    if (tr !== v.tr) { v.el.setAttribute("transform", tr); v.tr = tr; }
  }
  // Tracejados animados (fluxos, correnteza, bordas) atualizados a 30 Hz por JS:
  // metade das repinturas de uma animação CSS a 60 Hz, mesma sensação de movimento.
  // (os tubos já mostram movimento pelas partículas; os tracejados deles ficam fixos)
  const DASH = [
    { sel: "#halo-plots .plot-ants", speed: 18 },
    { sel: "#L-life .mix", speed: 14 },
  ];
  let dashEls = null, lastDash = 0;
  function dashTick(t) {
    if (t - lastDash < 1 / 20) return;
    lastDash = t;
    if (!dashEls) dashEls = DASH.map((g) => ({ ...g, els: [...root.querySelectorAll(g.sel)] }));
    for (const g of dashEls) { const v = (-(t * g.speed) % 400).toFixed(1); for (const el of g.els) el.setAttribute("stroke-dashoffset", v); }
  }
  const refreshDash = () => { dashEls = null; };
  const frameFns = [];
  const speedMul = {};
  let lastT = 0;
  const perf = (window.__perf = { n: 0, ms: 0 });
  function tick(now) {
    const t0p = performance.now();
    if (tween) tween(now);
    const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0; lastT = now;
    if (!document.hidden) {
      for (const fn of frameFns) fn(now / 1000);
      if (!reduceMotion) {
        const t = now / 1000;
        dashTick(t);
        drawParticles(dt);
        for (const v of vehicles) {
          if (v.loop) { place(v, (t * v.speed + v.off) % v.total); continue; }
          const cycle = v.total + 70;
          const d = (t * v.speed + v.off) % cycle;
          place(v, Math.min(d, v.total));
          const op = d >= v.total ? 0 : Math.max(0, Math.min(1, d / 12, (v.total - d) / 12));
          if (Math.abs(op - (v.op ?? -1)) > 0.04 || op === 0 || op === 1) { if (op !== v.op) v.el.style.opacity = op.toFixed(2); v.op = op; }
        }
      }
    }
    perf.n++; perf.ms += performance.now() - t0p;
    requestAnimationFrame(tick);
  }
  sizeCanvases();
  if (reduceMotion) { drawParticles(0); for (const v of vehicles) place(v, v.total / 2); }
  requestAnimationFrame(tick);

  // ---------- passar o mouse: rótulo + contorno + fluxos conectados acendem
  const flowTags = Object.fromEntries(W.flows.map((f) => [f.id, f.tags || []]));
  const flowGroupsByTag = (tag) => W.flows.filter((f) => (f.tags || []).includes(tag)).map((f) => document.getElementById(f.id));
  let hoverTag = null;
  function hover(tag, { halo = true } = {}) {
    if (tag === hoverTag) return;
    hoverTag = tag;
    root.dataset.hover = tag || "";
    root.querySelectorAll(".core.hot").forEach((el) => el.classList.remove("hot"));
    hotIds = null;
    const els = tag && halo ? tagged.filter((el) => el.dataset.tag === tag && !el.classList.contains("plotg") && !el.closest("#L-ground")) : [];
    hoverEls = els;
    clearTimeout(hover.timer);
    hover.timer = setTimeout(() => renderHalo(hoverImg, hoverEls), els.length ? 40 : 0);
    if (!tag) return;
    const hot = flowGroupsByTag(tag).filter(Boolean);
    hot.forEach((el) => el.classList.add("hot"));
    hotIds = new Set(hot.map((el) => el.id));
  }

  // ---------- interação com pinos
  const activate = (el) => { const fn = () => onPick(el.dataset.stop); el.addEventListener("click", fn); el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); };
  root.querySelectorAll(".pin").forEach(activate);
  // clique numa zona destacável também abre a etapa correspondente
  const byTag = Object.fromEntries(stops.filter((s) => s.tags && !s.badge).map((s) => [s.tags[0], s.id]));
  root.addEventListener("click", (e) => {
    if (e.target.closest(".pin")) return;
    const g = e.target.closest("[data-tag]");
    if (g && byTag[g.dataset.tag]) onPick(byTag[g.dataset.tag]);
  });

  return {
    svg: root, root, iso,
    night: W.night,
    onFrame(fn) { frameFns.push(fn); },
    addDrawer(fn) { drawers.push(fn); },
    setNight(n) { night = n; },
    onClock(fn) { clockFns.push(fn); },
    emitClock(h) { for (const fn of clockFns) fn(h); },
    refreshDash,
    setSpeed(stream, m) { speedMul[stream] = m; },
    scale() { return pinScale; },
    hover,
    tagAt(target) { const g = target.closest && target.closest("[data-tag]"); return g ? g.dataset.tag : null; },
    setFollow(v) { follow = v; },
    setPadding(p) { viewPad = p; },
    frame,
    highlight,
    toggleStream,
    relayout() { sizeCanvases(); frame(current, 1); },
  };
}
