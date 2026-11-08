// "Siga o carbono": uma partícula percorre o ciclo curto do carbono na Cocal,
// do ar ao canavial, à moenda, à vinhaça, ao biodigestor, ao gasoduto, à
// cidade e de volta ao ar. Funciona no piloto automático contínuo (loop) ou
// controlado passo a passo.
import { STREAMS } from "./palette.mjs";
import { CANAL } from "../scene/layout.mjs";

const LEGS = [
  { tag: "cana", zone: "1 · Canavial (Fotossíntese)", mol: "CO₂", stream: "co2", text: "A cana captura CO₂ do ar enquanto cresce.", focus: [0, 0, 300, 470], pts: [[135, 150, 120], [135, 200, 14]] },
  { tag: "cana", zone: "2 · Colheita e Transporte", mol: "C org.", stream: "substrato", text: "Colhida, a cana vai de caminhão para a moenda.", focus: [0, 150, 480, 600], pts: [[135, 200, 14], [135, 330, 5], [300, 330, 5], [300, 476, 5], [400, 476, 5], [400, 540, 8]] },
  { tag: "moenda", zone: "3 · Moagem e Destilaria", mol: "C org.", stream: "vinhaca", text: "Da moagem e da destilação do etanol sobra a vinhaça.", focus: [330, 480, 720, 760], pts: [[400, 540, 8], [518, 547, 30], [414, 680, 18], [378, 666, 4]] },
  { tag: "vinhaca", zone: "4 · Canal de Vinhaça", mol: "Vinhaça", stream: "vinhaca", text: "Pelo canal, a vinhaça chega à usina de biogás.", focus: [320, 320, 520, 700], pts: [[378, 666, 4], ...CANAL.map(([x, y]) => [x, y, 3]), [351, 404, 3]] },
  { tag: "horizontais", zone: "5 · Biodigestores", mol: "CH₄ + CO₂", stream: "vinhaca", text: "No biodigestor, microrganismos transformam o carbono em metano (CH₄).", focus: [330, 20, 680, 420], pts: [[351, 404, 3], [351, 366, 3], [390, 330, 16], [342, 300, 3], [342, 160, 3], [415, 160, 10]] },
  { tag: "cupula", zone: "6 · Cúpula de Biogás", mol: "Biogás", stream: "biogas", text: "O biogás se junta sob a cúpula.", focus: [450, 100, 660, 260], pts: [[415, 160, 10], [490, 160, 3], [490, 178, 3], [560, 178, 20]] },
  { tag: "thiopaq", zone: "7 · Dessulfurização (THIOPAQ)", mol: "Biogás", stream: "biogas", text: "Bactérias retiram o enxofre (H₂S) do biogás.", focus: [530, 130, 710, 280], pts: [[560, 178, 20], [600, 178, 3], [600, 196, 3], [624, 196, 30]] },
  { tag: "upgrading", zone: "8 · Purificação (Upgrading)", mol: "CH₄ ≥ 96%", stream: "dessulf", text: "A purificação separa o CO₂: nasce o biometano.", focus: [560, 190, 740, 350], pts: [[624, 196, 30], [648, 232, 3], [680, 232, 3], [664, 267, 26]] },
  { tag: "compressao", zone: "9 · Compressão e Gasoduto", mol: "Biometano", stream: "biometano", text: "Comprimido, ele segue pelo gasoduto rumo às cidades.", focus: [540, -140, 860, 440], pts: [[664, 267, 26], [640, 302, 3], [600, 302, 3], [588, 331, 10], [604, 388, 3], [640, 388, 3], [640, 428, 3], [752, 428, 3], [752, -100, 3]] },
  { tag: "prudente", zone: "10 · Presidente Prudente", mol: "CH₄", stream: "biometano", text: "Em Presidente Prudente, abastece casas, indústrias e veículos.", focus: [720, -290, 1110, -40], pts: [[752, -100, 3], [1000, -100, 3], [1020, -117, 6]] },
  { tag: "prudente", zone: "11 · Combustão Limpa", mol: "CO₂", stream: "co2", text: "Ao queimar, o carbono volta ao ar como CO₂…", focus: [740, -290, 1110, -40], pts: [[1020, -117, 6], [1020, -117, 130]] },
  { tag: "cana", zone: "12 · Ciclo Curto do Carbono", mol: "CO₂ ↻", stream: "co2", text: "…e a cana o captura de novo. É o ciclo curto do carbono.", focus: "all", pts: [[1020, -117, 130], [600, 100, 210], [135, 150, 120]] },
];

export function createJourney(stage, { onStep, onState }) {
  const { iso } = stage;
  const layer = document.getElementById("L-journey");
  const SPEED = 105; // unidades de tela por segundo
  const PAUSE = 2.0; // segundos de leitura no fim de cada trecho

  // pré-calcula trechos em coordenadas de tela e tempo acumulado
  let accTime = 0;
  const legs = LEGS.map((l) => {
    const pts = l.pts.map(iso);
    const segs = []; let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push({ a: pts[i], b: pts[i + 1], len, start: total });
      total += len;
    }
    const dur = total / SPEED + PAUSE;
    const out = { ...l, segs, total, dur, startT: accTime, d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") };
    accTime += dur;
    return out;
  });
  const totalCycleDur = accTime;

  let running = false, paused = false, followCam = true;
  let elapsed = 0, lastT = 0, legIdx = -1;

  layer.innerHTML = `<path class="jtrail" id="jtrail"/><g id="jtok" class="jtok"><circle class="jglow" r="20"/><circle class="jcore" r="9.5"/><text class="jt" y="0.5">C</text></g>`;
  const tok = layer.querySelector("#jtok"), trail = layer.querySelector("#jtrail");
  layer.closest("svg").style.display = "none";

  const at = (leg, d) => {
    const s = leg.segs.find((g) => d <= g.start + g.len) || leg.segs[leg.segs.length - 1];
    const u = s.len ? Math.min(1, (d - s.start) / s.len) : 1;
    return [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u];
  };

  function applyLeg(i) {
    legIdx = i;
    const leg = legs[i];
    const c = STREAMS[leg.stream].color;
    tok.style.setProperty("--c", c);
    tok.querySelector(".jt").textContent = leg.stream === "co2" ? "CO₂" : leg.stream === "substrato" || leg.stream === "vinhaca" ? "C" : "CH₄";
    trail.setAttribute("d", leg.d);
    trail.style.setProperty("--c", c);
    stage.hover(leg.tag, { halo: true });
    if (followCam) {
      stage.setFollow(true);
      stage.frame(leg.focus === "all" ? null : { focus: leg.focus }, 950);
    }
    onStep?.({ leg, index: i, total: legs.length, color: c, paused, followCam });
  }

  stage.onFrame((t) => {
    if (!running) return;
    const dt = lastT ? Math.min(0.1, t - lastT) : 0;
    lastT = t;
    if (!paused) elapsed = (elapsed + dt) % totalCycleDur;

    let i = legs.findIndex((l) => elapsed < l.startT + l.dur);
    if (i < 0) i = legs.length - 1;
    const leg = legs[i];
    if (i !== legIdx) applyLeg(i);

    const localE = Math.max(0, elapsed - leg.startT);
    const [x, y] = at(leg, Math.min(leg.total, localE * SPEED));
    const k = stage.scale();
    tok.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})`);
  });

  function start() {
    running = true; paused = false; legIdx = -1; elapsed = 0; lastT = performance.now() / 1000;
    layer.closest("svg").style.display = "";
    onState?.(true);
  }
  function stop() {
    if (!running) return;
    running = false; paused = false;
    layer.closest("svg").style.display = "none";
    stage.hover(null);
    onStep?.(null);
    onState?.(false);
  }
  function goTo(idx) {
    if (!running) start();
    const target = ((idx % legs.length) + legs.length) % legs.length;
    elapsed = legs[target].startT + 0.001;
    applyLeg(target);
  }
  function togglePause() {
    if (!running) return false;
    paused = !paused;
    if (legIdx >= 0) onStep?.({ leg: legs[legIdx], index: legIdx, total: legs.length, color: STREAMS[legs[legIdx].stream].color, paused, followCam });
    return paused;
  }
  function toggleFollow() {
    followCam = !followCam;
    if (running && legIdx >= 0) {
      if (followCam) {
        stage.setFollow(true);
        const leg = legs[legIdx];
        stage.frame(leg.focus === "all" ? null : { focus: leg.focus }, 850);
      } else {
        stage.setFollow(false);
        stage.resetView(800);
      }
      onStep?.({ leg: legs[legIdx], index: legIdx, total: legs.length, color: STREAMS[legs[legIdx].stream].color, paused, followCam });
    }
    return followCam;
  }

  return {
    start,
    stop,
    goTo,
    next() { goTo((legIdx + 1) % legs.length); },
    prev() { goTo((legIdx - 1 + legs.length) % legs.length); },
    togglePause,
    toggleFollow,
    get running() { return running; },
    get paused() { return paused; },
    get followCam() { return followCam; },
  };
}
