// Relógio do diorama: ciclo dia/noite, demanda de gás, gasômetro que
// "respira" com o consumo, cozinhas acendendo e a safra da cana ao longo do ano.
//
// 1 dia = 60 s; a cada dia avança 1 mês (1 ano ≈ 12 min).
// Safra da cana no Centro-Sul: aproximadamente de abril a novembro.
import { SPOTS } from "../scene/layout.mjs";
const DAY_S_DEFAULT = 60;
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SAFRA = (m) => m >= 3 && m <= 10;
const PICO = (m) => m >= 5 && m <= 9;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// noite: 1 entre 20h e 5h, transições suaves no amanhecer e no entardecer
export const nightOf = (h) => 1 - smooth(5, 7, h) + smooth(17.5, 19.5, h);
// demanda de gás (0–1): base + picos do café da manhã e do jantar
export const demandOf = (h) => 0.25 + 0.35 * Math.exp(-((h - 7) ** 2) / 2) + 0.75 * Math.exp(-((h - 19.5) ** 2) / 3) + 0.3 * Math.exp(-((h - 12) ** 2) / 1.5);

const mixHex = (a, b, t) => { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };

export function createAmbient(stage, { night, onTick, daySeconds, startHour = 10, startMonth = 5 }) {
  const DAY_S = daySeconds > 0 ? daySeconds : DAY_S_DEFAULT;
  const { root, iso } = stage;
  const map = root.closest(".map");
  // camadas: véu noturno (só tinge o céu e a cena levemente) + luzes acima dele
  
  const lights = document.getElementById("L-lights");
  const lightsLayer = document.getElementById("ly-lights");
  const skyNight = document.getElementById("sky-night");
  const P = (p) => iso(p).map((v) => v.toFixed(1));
  // --- tudo o que brilha à noite é desenhado UMA vez; o ciclo só muda a opacidade
  const defs = `<defs>
    <radialGradient id="lg-lamp"><stop offset="0" stop-color="#FFD978" stop-opacity=".75"/><stop offset=".45" stop-color="#FFC24D" stop-opacity=".28"/><stop offset="1" stop-color="#FFC24D" stop-opacity="0"/></radialGradient>
    <radialGradient id="lg-flood"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset=".5" stop-color="#FFE7A8" stop-opacity=".18"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient>
    <radialGradient id="lg-flare"><stop offset="0" stop-color="#FFC24D" stop-opacity=".9"/><stop offset=".35" stop-color="#E69F00" stop-opacity=".45"/><stop offset="1" stop-color="#D55E00" stop-opacity="0"/></radialGradient>
    <radialGradient id="lg-green"><stop offset="0" stop-color="#B6E03B" stop-opacity=".6"/><stop offset="1" stop-color="#009E73" stop-opacity="0"/></radialGradient>
    <filter id="lg-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>`;
  // postes: poça de luz no chão + lâmpada
  const lamps = night.lamps.map(([x, y]) => {
    const [gx, gy] = P([x, y, 1.8]), [lx, ly] = P([x, y, 14.4]);
    return `<ellipse cx="${gx}" cy="${gy}" rx="17" ry="8.5" fill="url(#lg-lamp)"/><circle cx="${lx}" cy="${ly}" r="4.5" fill="url(#lg-lamp)"/><circle class="lamp-core" cx="${lx}" cy="${ly}" r="1.3"/>`;
  }).join("");
  // refletores e locais iluminados (usina, city gate, posto, ETE, indústria, universidade, serraria)
  const floods = [[540, 200, 80], [690, 70, 50], [640, 270, 50], [520, 550, 70], [620, 560, 60], [980, 570, 55], [980, 780, 60], [900, 60, 50], [770, -120, 30], [960, -200, 60], [100, -220, 50], [430, 380, 40]]
    .map(([x, y, r]) => { const [cx, cy] = P([x, y, 2]); return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r / 2}" fill="url(#lg-flood)"/>`; }).join("");
  // bioenergia acesa: chama do flare, aro de LEDs verdes nos biodigestores, CHP e purificação
  const [fx, fy] = P([...SPOTS.flare, SPOTS.flareTop + 4]);
  let bio = `<circle cx="${fx}" cy="${fy}" r="30" fill="url(#lg-flare)"/>`;
  for (const [cx, cy] of SPOTS.vds) {
    const r = SPOTS.vdR + 0.5;
    for (let k = 0; k < 9; k++) { const a = Math.PI / 4 - 1.3 + (k / 8) * 2.6; const [lx, ly] = P([cx + r * Math.cos(a), cy + r * Math.sin(a), 24]); bio += `<circle class="led" cx="${lx}" cy="${ly}" r="1"/>`; }
    const [gx, gy] = P([cx, cy, 24]); bio += `<ellipse cx="${gx}" cy="${gy}" rx="34" ry="17" fill="url(#lg-green)" opacity=".35"/>`;
  }
  for (const p of [[558, 253, 14], [664, 267, 20], [588, 331, 10], [680, 332, 20], [636, 205, 20], [1020, -117, 8]]) { const [gx, gy] = P(p); bio += `<circle cx="${gx}" cy="${gy}" r="14" fill="url(#lg-green)"/>`; }
  // cozinhas: uma pequena chama azul na janela de cada casa
  const kitchens = night.houses.map(([x, y, w, d, h], i) => {
    const [sx, sy] = iso([x + w, y + d * 0.35, 3.2]);
    return `<g class="kitchen" data-i="${i}"><circle class="kglow" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4"/><path class="flame blue" d="M${sx.toFixed(1)},${(sy + 1).toFixed(1)} c-1.2,-1.6 -.8,-3.6 0,-5 c.8,1.6 1.2,3.4 0,5Z"/></g>`;
  }).join("");
  lights.innerHTML = defs + floods + lamps + `<path class="win-glow" d="${night.windows}" filter="url(#lg-blur)"/><path class="win-night" d="${night.windows}"/>` + bio + kitchens;
  const kEls = [...lights.querySelectorAll(".kitchen")];
  const order = kEls.map((_, i) => i).sort((a, b) => ((a * 7) % 11) - ((b * 7) % 11));

  const gh = root.querySelector(".gasholder");
  if (gh) { const [x, y] = iso([...SPOTS.dome, 2]); gh.style.transformOrigin = `${x}px ${y}px`; }
  

  let running = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let base = startHour * (DAY_S / 24) + startMonth * DAY_S; // padrão: 10h de junho
  let last = 0, clock = 0, lastMonth = -1;

  // a cada quadro: só opacidades de camadas (feitas pela GPU) e o gasômetro
  let lastN = -1;
  function smoothFrame(h, n) {
    if (Math.abs(n - lastN) > 0.002) {
      lastN = n;
      // camadas noturnas saem da composição de dia (não custam nada)
      const vis = n > 0.004;
      if (vis !== smoothFrame.vis) { smoothFrame.vis = vis; lightsLayer.style.display = skyNight.style.display = vis ? "" : "none"; }
      lightsLayer.style.opacity = n.toFixed(3);
      skyNight.style.opacity = (n * 0.96).toFixed(3);
      stage.setNight(n);
    }
    if (gh) {
      const level = 0.55 + 0.35 * Math.cos((2 * Math.PI * (h - 8)) / 24);
      gh.style.transform = `scale(${(0.97 + 0.05 * level).toFixed(4)}, ${(0.78 + 0.3 * level).toFixed(4)})`;
    }
  }
  function render(t, heavy = true) {
    const total = base + clock;
    const h = ((total / DAY_S) * 24) % 24;
    const m = Math.floor(total / DAY_S) % 12;
    const n = nightOf(h), dem = demandOf(h);
    if (!heavy) { smoothFrame(h, n); return; }
    smoothFrame(h, n);

    // cozinhas acesas proporcionais à demanda (mais à noite)
    const lit = Math.round(kEls.length * Math.max(0, (dem - 0.3) / 0.9));
    if (lit !== render.lit) { render.lit = lit; order.forEach((idx, k) => kEls[idx].classList.toggle("on", k < lit)); }
    // safra / entressafra
    if (m !== lastMonth) {
      lastMonth = m;
      document.body.classList.toggle("entressafra", !SAFRA(m));
      // a cana cresce na entressafra (dez → mar) e está alta na safra
      const grow = SAFRA(m) ? 1 : [0.3, 0.45, 0.6, 0.8][(m + 1) % 12] ?? 0.4;
      root.style.setProperty("--cane", grow);
    }
    stage.emitClock(h);
    onTick({ h, m, month: MONTHS[m], safra: SAFRA(m), pico: PICO(m), night: n, demand: dem, gasLevel: 0.55 + 0.35 * Math.cos((2 * Math.PI * (h - 8)) / 24), running });
  }

  stage.onFrame((t) => {
    const dt = last ? Math.min(0.1, t - last) : 0; last = t;
    if (running) clock += dt;
    // valores contínuos a cada quadro; o resto (relógio, cozinhas, safra) a cada 0,25 s
    if (!render.acc || t - render.acc > 0.25) { render.acc = t; render(t, true); } else render(t, false);
  });

  return {
    toggle() { running = !running; return running; },
    get running() { return running; },
  };
}
