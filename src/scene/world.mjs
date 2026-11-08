// Composição do diorama: base, lotes, ruas, zonas, fluxos e veículos.
import { createScene, slab, slabRing, roundRing, groundRect, groundLine, zoneLabel, pine, tree, iso, gradients, takeShadows, pathOf, box, NIGHT, streetLight } from "./kit.mjs";
import { BASE, BASE_RING, NOTCH, PLOTS, ROADS_X, ROADS_Y, ROAD_W } from "./layout.mjs";
import { buildCampo } from "./zones/campo.mjs";
import { buildBiogas } from "./zones/biogas.mjs";
import { buildMoenda } from "./zones/moenda.mjs";
import { buildDestinos } from "./zones/destinos.mjs";
import { buildFlows } from "./flows.mjs";
import { buildVehicles } from "./vehicles.mjs";

export { iso };

export function buildWorld() {
  const S = createScene();
  const B = BASE;

  takeShadows(); // zera o coletor
  NIGHT.windows.length = NIGHT.lamps.length = NIGHT.houses.length = 0;
  // base do diorama em L: camadas de solo visíveis nas laterais (efeito "terrário")
  S.floor(slabRing(roundRing(BASE_RING, 18), -26, 26, "base", "basebox"));
  const strata = [[-26, -17, "rock"], [-17, -7, "clay"], [-7, -1.5, "topsoil"]];
  const xr = B.x + B.w, yb = B.y + B.d;
  // faces voltadas para quem olha: leste (x máx.), sul do L (y máx.) e sul do braço norte (recorte)
  const faces = [
    [[xr, B.y + 18], [xr, yb - 2], ""],
    [[NOTCH.x + 18, yb], [xr - 2, yb], " s"],
    [[B.x + 18, NOTCH.y], [NOTCH.x - 18, NOTCH.y], " s"],
  ];
  for (const [z0, z1, cls] of strata) for (const [a, b, k] of faces)
    S.floor(`<path class="strata ${cls}${k}" d="${pathOf([[...a, z0], [...b, z0], [...b, z1], [...a, z1]], true)}"/>`);
  // raízes/pedras nas camadas
  for (let i = 0; i < 26; i++) {
    const u = (i * 37) % 100 / 100, z = -24 + ((i * 13) % 20);
    const p = i % 3 === 0 ? [B.x + 30 + u * (NOTCH.x - B.x - 60), NOTCH.y, z] : [NOTCH.x + 30 + u * (xr - NOTCH.x - 60), yb, z];
    const [cx, cy] = iso(p);
    S.floor(`<circle class="pebble" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(1 + (i % 3) * 0.6).toFixed(1)}"/>`);
  }
  const lawn = [[B.x + 4, B.y + 4], [xr - 4, B.y + 4], [xr - 4, yb - 4], [NOTCH.x + 4, yb - 4], [NOTCH.x + 4, NOTCH.y - 4], [B.x + 4, NOTCH.y - 4]];
  S.floor(slabRing(roundRing(lawn, 15), -0.01, 0.02, "grass", "lawn"));
  // lotes
  for (const p of PLOTS) S.floor(`<g data-tag="${p.id}" id="pl-${p.id}" class="plotg">${slab({ x: p.x, y: p.y, w: p.w, d: p.d, r: 6 }, 0, 1.6, p.mat, `plot plot-${p.id}`, 6)}</g>`);
  // ruas, calçadas e faixas
  const W = ROAD_W;
  for (const [y, x0, x1] of ROADS_X) S.floor(groundRect(x0, y - W / 2, x1 - x0, W, "road", 1.7));
  for (const [x, y0, y1] of ROADS_Y) S.floor(groundRect(x - W / 2, y0, W, y1 - y0, "road", 1.7));
  for (const [x, y0, y1] of ROADS_Y) S.floor(groundLine([[x, y0 + 4], [x, y1 - 4]], "lane", 1.8));
  for (const [y, x0, x1] of ROADS_X) if (x1 - x0 > 60) S.floor(groundLine([[x0 + 4, y], [x1 - 4, y]], "lane", 1.8));
  // nomes das zonas pintados no chão
  for (const p of PLOTS) if (p.label) S.floor(zoneLabel(p.label, p.x + 8, p.y + p.d - 5, p.d > 300 ? 11 : 8.5));

  // estacionamentos
  const parking = (x, y, w, d, n, cars = []) => {
    S.floor(groundRect(x, y, w, d, "lot", 1.72));
    for (let i = 1; i < n; i++) S.floor(groundLine([[x + (i * w) / n, y + 1], [x + (i * w) / n, y + d * 0.42]], "stall", 1.78) + groundLine([[x + (i * w) / n, y + d - 1], [x + (i * w) / n, y + d * 0.58]], "stall", 1.78));
    for (const [k, row, mat] of cars) S.add(box(x + (k + 0.5) * (w / n) - 2.2, y + (row ? d - 9.5 : 1.5), 4.4, 8, 1.7, 3, mat, { r: 1 }) + box(x + (k + 0.5) * (w / n) - 2, y + (row ? d - 7.6 : 3.4), 4, 4.2, 4.7, 1.8, "glass", { r: 0.8, noShadow: true }), [x + (k + 0.5) * (w / n), y + (row ? d - 5 : 5), 0]);
  };
  parking(704, 862, 90, 24, 9, [[1, 0, "wall"], [2, 1, "petrol"], [5, 0, "red"], [7, 1, "steel"]]);
  parking(640, 402, 50, 22, 5, [[0, 0, "wall"], [3, 1, "urban"]]);

  buildCampo(S);
  buildBiogas(S);
  buildMoenda(S);
  buildDestinos(S);

  // iluminação nas estradas internas (acende à noite)
  for (let y = 20; y < 940; y += 70) S.add(streetLight(292, y, [1, 0]), [292, y, 0]);
  for (let x = 340; x < 1100; x += 72) S.add(streetLight(x, 478, [0, -1]), [x, 478, 0]);
  for (let y = 520; y < 920; y += 70) S.add(streetLight(832, y, [1, 0]), [832, y, 0]);

  // vegetação de borda e quebra-ventos
  for (const [x, y] of [[-22, 300], [-20, 40], [-22, -200], [-24, 486], [120, 486], [240, 486], [1112, 300], [1112, 760], [1112, 40], [1110, 880], [420, 944], [600, 944], [1112, -200], [320, 944]]) S.add(pine(x, y, 1.3), [x, y, 0]);
  for (const [x, y] of [[316, 200], [316, 700], [316, 60], [776, 140], [776, 360], [316, 400], [316, 860], [856, 760], [856, 880]]) S.add(tree(x, y, 1.25), [x, y, 0]);

  // sombras projetadas: uma camada, logo acima do chão
  S.floor(`<path class="shadow" d="${takeShadows()}"/>`);
  const flows = buildFlows();
  const vehicles = buildVehicles();
  takeShadows(); // descarta sombras dos veículos (eles se movem)
  const scene = S.render();
  // nuvens ao fundo, atrás do diorama
  // nuvens como elementos HTML compostos pela GPU (sem repintar o SVG)
  const clouds = [[-700, 40, 1], [-250, -120, 0.8], [520, -140, 1.1], [860, 120, 0.9], [-820, 420, 0.7], [880, 600, 0.8]].map(([x, y, k], i) =>
    `<div class="hcloud c${i % 3}" style="left:${x}px;top:${y}px;--s:${k}"><i></i><i></i><i></i><i></i></div>`).join("");

  const corners = [...BASE_RING.map(([x, y]) => [x, y, 0]), [B.x, NOTCH.y, -26], [NOTCH.x, B.y + B.d, -26], [B.x + B.w, B.y + B.d, -26], [B.x, B.y, 70]].map(iso);
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const bounds = { x: Math.min(...xs) - 10, y: Math.min(...ys) - 20, w: Math.max(...xs) - Math.min(...xs) + 20, h: Math.max(...ys) - Math.min(...ys) + 30 };

  return {
    bounds,
    defs: gradients(),
    layers: { sky: clouds, ground: scene.ground, under: scene.under, dyn: scene.dyn, pipes: flows.pipes, cores: flows.cores, vehicles: vehicles.filter((v) => !v.top).map((v) => v.svg).join(""), vehiclesTop: vehicles.filter((v) => v.top).map((v) => v.svg).join(""), objects: scene.objects, overhead: flows.overhead },
    vehicles,
    flows: flows.ids,
    night: { windows: NIGHT.windows.join(""), lamps: NIGHT.lamps.slice(), houses: NIGHT.houses.slice() },
  };
}

// Caixa no chão (mundo) -> retângulo de tela, para o enquadramento do tour.
export function focusRect([x0, y0, x1, y1], zTop = 40) {
  const pts = [[x0, y0, 0], [x1, y0, 0], [x0, y1, 0], [x1, y1, 0], [x0, y0, zTop], [x1, y0, zTop]].map(iso);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
