// "Siga o carbono": uma partícula percorre o ciclo curto do carbono na Cocal,
// do ar ao canavial, à moenda, à vinhaça, ao biodigestor, ao gasoduto, à
// cidade e de volta ao ar. O quadro não se move; a zona de cada trecho ganha contorno.
import { STREAMS } from "./palette.mjs";
import { CANAL } from "../scene/layout.mjs";

const LEGS = [
  { tag: "cana", stream: "co2", text: "A cana captura CO₂ do ar enquanto cresce.", pts: [[135, 150, 120], [135, 200, 14]] },
  { tag: "cana", stream: "substrato", text: "Colhida, a cana vai de caminhão para a moenda.", pts: [[135, 200, 14], [135, 330, 5], [300, 330, 5], [300, 476, 5], [400, 476, 5], [400, 540, 8]] },
  { tag: "moenda", stream: "vinhaca", text: "Da moagem e da destilação do etanol sobra a vinhaça.", pts: [[400, 540, 8], [518, 547, 30], [414, 680, 18], [378, 666, 4]] },
  { tag: "vinhaca", stream: "vinhaca", text: "Pelo canal, a vinhaça chega à usina de biogás.", pts: [[378, 666, 4], ...CANAL.map(([x, y]) => [x, y, 3]), [351, 404, 3]] },
  { tag: "horizontais", stream: "vinhaca", text: "No biodigestor, microrganismos transformam o carbono em metano (CH₄).", pts: [[351, 404, 3], [351, 366, 3], [390, 330, 16], [342, 300, 3], [342, 160, 3], [415, 160, 10]] },
  { tag: "cupula", stream: "biogas", text: "O biogás se junta sob a cúpula.", pts: [[415, 160, 10], [490, 160, 3], [490, 178, 3], [560, 178, 20]] },
  { tag: "thiopaq", stream: "biogas", text: "Bactérias retiram o enxofre (H₂S) do biogás.", pts: [[560, 178, 20], [600, 178, 3], [600, 196, 3], [624, 196, 30]] },
  { tag: "upgrading", stream: "dessulf", text: "A purificação separa o CO₂: nasce o biometano.", pts: [[624, 196, 30], [648, 232, 3], [680, 232, 3], [664, 267, 26]] },
  { tag: "compressao", stream: "biometano", text: "Comprimido, ele segue pelo gasoduto rumo às cidades.", pts: [[664, 267, 26], [640, 302, 3], [600, 302, 3], [588, 331, 10], [604, 388, 3], [640, 388, 3], [640, 428, 3], [752, 428, 3], [752, -100, 3]] },
  { tag: "prudente", stream: "biometano", text: "Em Presidente Prudente, abastece casas, indústrias e veículos.", pts: [[752, -100, 3], [1000, -100, 3], [1020, -117, 6]] },
  { tag: "prudente", stream: "co2", text: "Ao queimar, o carbono volta ao ar como CO₂…", pts: [[1020, -117, 6], [1020, -117, 130]] },
  { tag: "cana", stream: "co2", text: "…e a cana o captura de novo. É o ciclo curto do carbono.", pts: [[1020, -117, 130], [600, 100, 210], [135, 150, 120]] },
];

export function createJourney(stage, { caption, onState }) {
  const { iso } = stage;
  const layer = document.getElementById("L-journey");
  // pré-calcula trechos em coordenadas de tela
  const legs = LEGS.map((l) => {
    const pts = l.pts.map(iso);
    const segs = []; let total = 0;
    for (let i = 0; i < pts.length - 1; i++) { const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push({ a: pts[i], b: pts[i + 1], len, start: total }); total += len; }
    return { ...l, segs, total, d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") };
  });
  const SPEED = 110; // unidades de tela por segundo
  const PAUSE = 1.6; // segundos parado no fim de cada trecho
  let running = false, t0 = 0, legIdx = -1;

  layer.innerHTML = `<path class="jtrail" id="jtrail"/><g id="jtok" class="jtok"><circle class="jglow" r="20"/><circle class="jcore" r="9"/><text class="jt" y="0.5">C</text></g>`;
  const tok = layer.querySelector("#jtok"), trail = layer.querySelector("#jtrail");
  layer.closest("svg").style.display = "none";

  const at = (leg, d) => {
    const s = leg.segs.find((g) => d <= g.start + g.len) || leg.segs[leg.segs.length - 1];
    const u = s.len ? Math.min(1, (d - s.start) / s.len) : 1;
    return [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u];
  };

  stage.onFrame((t) => {
    if (!running) return;
    let e = t - t0, i = 0;
    while (i < legs.length && e > legs[i].total / SPEED + PAUSE) { e -= legs[i].total / SPEED + PAUSE; i++; }
    if (i >= legs.length) { stop(); return; }
    const leg = legs[i];
    if (i !== legIdx) {
      legIdx = i;
      const c = STREAMS[leg.stream].color;
      tok.style.setProperty("--c", c);
      tok.querySelector(".jt").textContent = leg.stream === "co2" ? "CO₂" : leg.stream === "substrato" || leg.stream === "vinhaca" ? "C" : "CH₄";
      trail.setAttribute("d", leg.d); trail.style.setProperty("--c", c);
      caption(leg.text, i, legs.length);
      stage.hover(leg.tag, { halo: false });
    }
    const [x, y] = at(leg, Math.min(leg.total, e * SPEED));
    const k = stage.scale();
    tok.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})`);
  });

  function start() { running = true; legIdx = -1; t0 = performance.now() / 1000; layer.closest("svg").style.display = ""; onState(true); }
  function stop() { running = false; layer.closest("svg").style.display = "none"; stage.hover(null); caption(null); onState(false); }
  return { start, stop, get running() { return running; } };
}
