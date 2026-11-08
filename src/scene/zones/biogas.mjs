// Usina de biogás e biometano (noroeste do complexo).
// Digestores, bunkers, esteira e cúpula seguem a disposição lida em imagem no
// gêmeo digital, simplificada. THIOPAQ, motores, purificação, CO₂, compressão
// e flare existem (fontes públicas), mas sua posição não é publicada: aqui
// ficam em lugares esquemáticos.
import { box, cyl, prism, dome, cone, slab, windows, door, band, ladder, tree, pathOf, circleRing, groundRect, fence, sideText, depth } from "../kit.mjs";
import { SPOTS } from "../layout.mjs";

const liquid = (cx, cy, r, z, cls) => `<path class="liquid ${cls}" d="${pathOf(circleRing(cx, cy, r, 64).map(([a, b]) => [a, b, z]), true)}"/>`;
export const DIGESTERS = SPOTS.vds;

export function buildBiogas(S) {
  S.floor(fence([[336, 280], [336, 6], [724, 6], [724, 434], [336, 434], [336, 316]], 4));
  S.floor(groundRect(304, 290, 26, 12, "weigh", 1.8));

  // ---------- 4 digestores horizontais: talude de terra + membrana (≈ 18.000 m³ cada)
  const [hw, hd] = SPOTS.hdSize;
  SPOTS.hds.forEach(([x, y], i) => {
    let s = box(x, y, hw, hd, 0, 3, "soil", { r: 3 });
    s += slab({ x: x + 3, y: y + 3, w: hw - 6, d: hd - 6, r: 8 }, 3, 2.6, "membrane", "", 6);
    s += slab({ x: x + 9, y: y + 8, w: hw - 18, d: hd - 16, r: 9 }, 5.6, 2.4, "membrane", "", 6);
    s += slab({ x: x + 18, y: y + 13, w: hw - 36, d: hd - 26, r: 7 }, 8, 1.6, "membrane", "", 6);
    s += sideText(`HD ${i + 1}`, [x + 4, y + hd], 1.2, "left", 5, "facelabel dark");
    S.add(s, [x + hw / 2, y + hd / 2, 0], "horizontais");
  });

  // ---------- 2 digestores verticais de concreto, teto plano radial (8.000 m³ cada)
  const R = SPOTS.vdR;
  DIGESTERS.forEach(([x, y]) => {
    let s = cyl(x, y, R, 0, 24, "concrete", { steps: 64 });
    for (const z of [8, 16]) s += band(x, y, R, z);
    s += ladder(x, y, R, 0, 24, -0.6);
    s += cyl(x, y, R + 0.6, 24, 1, "steelDark", { steps: 64 });
    s += cone(x, y, R, 25, 2.6, "concrete");
    s += cyl(x, y, 3, 27, 2.4, "steelDark", { steps: 14 }) + cyl(x + 10, y - 6, 1.2, 25, 7, "petrol", { steps: 8 });
    S.add(s, [x, y, 0], "verticais");
  });

  // ---------- recepção: bunkers de torta de filtro, moegas e esteira inclinada
  S.add(box(650, 14, 72, 118, 0, 1.2, "concrete", { noShadow: true }), [686, 70, 0], "bunkers");
  for (let i = 0; i < 4; i++) {
    const y = 18 + i * 28;
    S.add(box(656, y + 4, 60, 18, 1.2, 3.6, "torta", { r: 4 }) + box(664, y + 7, 44, 12, 4.8, 2, "torta", { r: 5 }), [686, y + 13, 0], "bunkers");
  }
  for (let i = 0; i <= 4; i++) S.add(box(650, 14 + i * 28, 72, 2.4, 1.2, 6, "concrete"), [686, 15 + i * 28, 0], "bunkers");
  S.add(box(724 - 2.4, 14, 2.4, 114, 1.2, 6, "concrete"), [723, 70, 0], "bunkers");
  // moegas verdes de alimentação
  S.add(box(616, 132, 30, 18, 0, 4, "steelDark") + [0, 1, 2].map((k) => box(618 + k * 9.4, 134, 8, 14, 4, 9, "green", { r: 1 })).join(""), [631, 141, 0], "bunkers");
  // esteira inclinada até o vão entre os verticais (corrigida no gêmeo a partir de fotos)
  const cv = [[628, 134, 13], [580, 80, 27]];
  S.add(`<path class="ln conveyor" d="${pathOf(cv.map(([x, y, z]) => [x - 1.6, y + 1.6, z]))}"/><path class="ln conveyor" d="${pathOf(cv.map(([x, y, z]) => [x + 1.6, y - 1.6, z]))}"/>` +
    [0.3, 0.6].map((u) => { const x = 628 + (580 - 628) * u, y = 134 + (80 - 134) * u, z = 13 + 14 * u; return `<path class="ln rack" d="${pathOf([[x, y, 0], [x, y, z]])}"/>`; }).join(""), [604, 107, 30], "bunkers");

  // ---------- recepção da vinhaça (fim do canal) e tanque pulmão
  S.add(box(334, 384, 34, 40, 0, 2.4, "concrete") + groundRect(337, 387, 28, 34, "liquid vinasse", 2.2), [351, 404, 0], "vinhaca");
  S.add(cyl(390, 300, 20, 0, 16, "steel", { steps: 48 }) + band(390, 300, 20, 6) + band(390, 300, 20, 11) + ladder(390, 300, 20, 0, 16) + dome(390, 300, 20, 16, "steel", { squash: 0.15, bands: 0 }) + sideText("VINHAÇA", [380, 319], 9, "left", 3.6, "facelabel dark"), [390, 300, 0], "vinhaca");
  S.add(box(370, 352, 16, 12, 0, 6, "steelDark") + box(388, 352, 10, 12, 0, 4, "steel"), [380, 358, 0], "vinhaca");

  // ---------- cúpula (gasômetro? função inferida) e THIOPAQ
  const [dx, dy] = SPOTS.dome;
  S.add(cyl(dx, dy, 23, 0, 2, "concrete", { steps: 64 }), [dx, dy, 0], "cupula");
  S.dyn(dome(dx, dy, 22, 2, "membraneLight", { squash: 0.5, bands: 3, cls: "gasholder" }), [dx, dy, 0], "cupula");
  S.add(cyl(624, 196, 6, 0, 34, "steel", { steps: 20 }) + band(624, 196, 6, 12) + band(624, 196, 6, 24) + cyl(624, 196, 6.6, 34, 1.6, "petrol", { steps: 20 }) + ladder(624, 196, 6, 0, 34), [624, 196, 0], "thiopaq");
  S.add(cyl(648, 210, 10, 0, 20, "wall", { steps: 32 }) + band(648, 210, 10, 10) + dome(648, 210, 10, 20, "wall", { squash: 0.2, bands: 0 }) + sideText("THIOPAQ", [640, 219], 8, "left", 3.2, "facelabel dark"), [648, 210, 0], "thiopaq");
  S.add(box(664, 186, 22, 16, 0, 8, "wallBlue") + windows(664, 186, 22, 16, 2, 7, "y", 2, 1, "louvre"), [675, 194, 0], "thiopaq");

  // ---------- cogeração: dois contêineres de motogeradores (5 MW)
  for (let i = 0; i < 2; i++) {
    const x = 516 + i * 44;
    S.add(box(x, 244, 40, 18, 0, 13, "green") + windows(x, 244, 40, 18, 3, 11, "y", 5, 1, "louvre") + door(x, 244, 40, 18, "x", 6, 3, 7) + box(x + 4, 246, 26, 14, 13, 1.6, "steelDark") + cyl(x + 20, 253, 2, 13, 17, "steelDark", { steps: 10 }), [x + 20, 253, 0], "chp");
  }
  S.add(sideText("CHP 5 MW", [520, 262], 4, "left", 4.4, "facelabel"), [540, 262, 0], "chp");
  S.add(box(604, 250, 10, 12, 0, 10, "steel") + `<path class="ln insul" d="${pathOf([[609, 256, 10], [609, 256, 15]])}"/>`, [609, 256, 0], "chp");

  // ---------- purificação (upgrading)
  S.add(box(626, 244, 76, 46, 0, 2.4, "concrete"), [664, 267, 0], "upgrading");
  S.add(box(630, 248, 24, 38, 2.4, 12, "wall") + windows(630, 248, 24, 38, 4, 13, "y", 2, 1, "louvre") + windows(630, 248, 24, 38, 4, 13, "x", 3, 1, "louvre") + sideText("UPGRADING", [632, 286], 12, "left", 2.6, "facelabel dark"), [642, 267, 2], "upgrading");
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) S.add(cyl(664 + i * 11, 256 + j * 18, 3.6, 2.4, 26, "steel", { steps: 16 }) + band(664 + i * 11, 256 + j * 18, 3.6, 12) + cyl(664 + i * 11, 256 + j * 18, 3.9, 28.4, 1.4, "petrol", { steps: 16 }), [664 + i * 11, 256 + j * 18, 2], "upgrading");

  // ---------- CO₂ verde: liquefação e tanques
  S.add(box(646, 352, 70, 14, 0, 8, "steelDark") + windows(646, 352, 70, 14, 2, 7, "y", 5, 1, "louvre"), [681, 359, 0], "co2");
  for (const x of [662, 692]) S.add(cyl(x, 332, 9, 0, 30, "wall", { steps: 28 }) + band(x, 332, 9, 10, "ln band gasband") + dome(x, 332, 9, 30, "wall", { squash: 0.5, bands: 0 }) + sideText("CO₂", [x - 4, 340.6], 18, "left", 4, "facelabel dark"), [x, 332, 0], "co2");

  // ---------- compressão (2 × 970 m³/h) e saída do gasoduto
  S.add(box(566, 318, 44, 26, 0, 10, "wall") + windows(566, 318, 44, 26, 3, 8, "y", 4, 1, "louvre") + box(564, 316, 48, 30, 10, 1.4, "petrol") + sideText("COMPRESSÃO", [570, 344], 2.4, "left", 3, "facelabel dark"), [588, 331, 0], "compressao");
  S.add(cyl(620, 388, 2.6, 0, 10, "amber", { steps: 12 }) + cyl(620, 388, 3.8, 10, 2.4, "amber", { steps: 12 }) + box(612, 380, 18, 16, 0, 1.2, "concrete", { noShadow: true }), [620, 388, 0], "compressao");

  // ---------- separação sólido-líquido e lagoas de digestato
  S.add(box(436, 300, 30, 18, 0, 4, "steelDark") + cyl(450, 309, 6, 4, 10, "steel", { steps: 20 }) + box(460, 304, 12, 10, 4, 7, "steel"), [452, 309, 0], "separacao");
  S.add(box(474, 300, 36, 26, 0, 2.6, "concrete") + prism(circleRing(492, 313, 11, 24), 2.6, 3.4, "digestate") + dome(492, 313, 8, 6, "digestate", { squash: 0.6, bands: 0 }), [492, 313, 0], "separacao");
  for (const [x, y] of [[452, 394], [508, 404]]) S.add(cyl(x, y, 21, 0, 5, "concrete", { steps: 56 }) + liquid(x, y, 19, 4.6, "dig"), [x, y, 0], "separacao");

  // ---------- sala de controle e flare
  S.add(box(530, 382, 34, 22, 0, 10, "wallBlue") + windows(530, 382, 34, 22, 3, 8, "y", 4, 1, "win", 2) + door(530, 382, 34, 22, "x", 8, 3, 6) + box(528, 380, 38, 26, 10, 1.4, "petrol"), [547, 393, 0], "usina");
  const [fx, fy] = SPOTS.flare;
  S.add(box(fx - 9, fy - 9, 18, 18, 0, 1.4, "concrete") + cyl(fx, fy, 3.6, 1.4, 4, "steelDark", { steps: 14 }) + cyl(fx, fy, 2.2, 5, SPOTS.flareTop - 8, "steelDark", { steps: 14 }) + band(fx, fy, 2.2, 20) + cyl(fx, fy, 3.2, SPOTS.flareTop - 3, 3, "petrol", { steps: 14 }), [fx, fy, 0], "flare");

  for (const [x, y] of [[344, 250], [344, 270], [716, 150], [716, 230], [490, 426], [580, 426], [716, 300], [420, 426]]) S.add(tree(x, y, 1.1), [x, y, 0]);
}

export { depth };
