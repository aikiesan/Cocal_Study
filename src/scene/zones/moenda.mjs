// Usina de açúcar e etanol (sudeste do complexo), subestação, Lesaffre e o
// canal de vinhaça. Pouco é publicado só para Narandiba: a moagem, a produção
// e o volume de vinhaça não são públicos. As torres de resfriamento, a
// subestação e o parque de tanques têm etiqueta no OpenStreetMap; o resto da
// disposição é esquemático.
import { box, cyl, prism, dome, cone, gable, sawtooth, windows, door, stripe, band, ladder, tree, pathOf, circleRing, groundRect, groundLine, fence, sideText, pylon } from "../kit.mjs";
import { CANAL, SPOTS } from "../layout.mjs";

export const PYLONS = [[745, 236], [745, 490], [852, 556]];
export const PYLON_TOP = 46;

export function buildMoenda(S) {
  S.floor(fence([[336, 506], [804, 506], [804, 914], [336, 914], [336, 506]], 4));

  // ---------- canal de vinhaça até a usina de biogás (esquemático)
  S.floor(groundLine(CANAL, "canal-bank", 1.72) + groundLine(CANAL, "canal", 1.76));

  // ---------- pátio de cana (hilo) com ponte rolante
  S.add(box(342, 512, 110, 96, 0, 1.4, "concrete", { noShadow: true }), [397, 560, 0], "patio");
  S.add(prism([[350, 522], [420, 522], [420, 560], [350, 560]], 1.4, 6, "cane") + prism([[356, 528], [414, 528], [414, 554], [356, 554]], 7.4, 3, "cane"), [385, 541, 0], "patio");
  S.add(box(346, 576, 2, 2, 0, 18, "steelDark") + box(446, 576, 2, 2, 0, 18, "steelDark") + box(346, 576, 102, 3, 18, 2, "steelDark") + box(396, 574, 8, 7, 14, 4, "amber"), [397, 578, 0], "patio");
  // mesa alimentadora até a moenda
  S.add(box(452, 540, 12, 20, 0, 8, "steelDark"), [458, 550, 0], "patio");

  // ---------- moenda, caldeira (HPB, 250 t/h de vapor) e casa de força
  S.add(box(466, 514, 104, 66, 0, 26, "wall") + stripe(466, 514, 104, 66, 0.5, 6, "storefront") + windows(466, 514, 104, 66, 8, 24, "y", 10, 2) + windows(466, 514, 104, 66, 8, 24, "x", 6, 2) + box(464, 512, 108, 70, 26, 2, "roofGrey") + sideText("MOENDA", [474, 580], 16, "left", 6, "facelabel"), [518, 547, 0], "moenda");
  S.add(box(584, 514, 46, 58, 0, 50, "steelDark") + box(586, 516, 42, 54, 50, 3, "steel") + windows(584, 514, 46, 58, 6, 46, "x", 4, 6, "louvre") + sideText("CALDEIRA", [588, 572], 30, "left", 4, "facelabel"), [607, 543, 0], "caldeira");
  for (const [x, y, top] of SPOTS.boilerStacks) S.add(cyl(x, y, 4.2, 53, top - 53, "steel", { steps: 16 }) + band(x, y, 4.2, top - 4, "ln band red-band"), [x, y, 0], "caldeira");
  S.add(box(642, 514, 62, 46, 0, 20, "wall") + windows(642, 514, 62, 46, 4, 18, "y", 6, 2) + box(640, 512, 66, 50, 20, 1.6, "roofGrey") + sideText("ENERGIA", [648, 560], 8, "left", 5, "facelabel"), [673, 537, 0], "caldeira");
  // torres de resfriamento (OSM)
  for (let i = 0; i < 3; i++) S.add(box(718 + i * 28, 516, 26, 30, 0, 16, "wallBlue") + windows(718 + i * 28, 516, 26, 30, 2, 13, "y", 2, 2, "louvre") + cyl(731 + i * 28, 531, 9, 16, 4, "steel", { steps: 24 }), [731 + i * 28, 531, 0], "caldeira");

  // ---------- bagaço: esteira até a caldeira e pilha
  S.add(`<path class="ln conveyor" d="${pathOf([[540, 580, 22], [588, 620, 14]])}"/><path class="ln conveyor" d="${pathOf([[546, 578, 22], [594, 618, 14]])}"/>`, [566, 600, 24], "caldeira");
  S.add(prism(circleRing(626, 640, 36, 36), 0, 6, "bagasse") + prism(circleRing(626, 640, 26, 32), 6, 6, "bagasse") + dome(626, 640, 16, 12, "bagasse", { squash: 0.6, bands: 0 }), [626, 640, 0], "caldeira");

  // ---------- destilaria: dornas de fermentação e colunas
  for (let i = 0; i < 4; i++) S.add(cyl(690 + (i % 2) * 26, 604 + Math.floor(i / 2) * 26, 11, 0, 18, "steel", { steps: 28 }) + band(690 + (i % 2) * 26, 604 + Math.floor(i / 2) * 26, 11, 9) + dome(690 + (i % 2) * 26, 604 + Math.floor(i / 2) * 26, 11, 18, "steel", { squash: 0.2, bands: 0 }), [690 + (i % 2) * 26, 604 + Math.floor(i / 2) * 26, 0], "destilaria");
  for (let i = 0; i < 3; i++) S.add(cyl(758 + i * 12, 610, 3.6, 0, 46 - i * 6, "steel", { steps: 14 }) + band(758 + i * 12, 610, 3.6, 20) + band(758 + i * 12, 610, 3.6, 34 - i * 6), [758 + i * 12, 610, 0], "destilaria");
  S.add(box(744, 628, 48, 34, 0, 12, "wall") + windows(744, 628, 48, 34, 3, 10, "y", 4, 1, "louvre") + box(742, 626, 52, 38, 12, 1.4, "roofGrey"), [768, 645, 0], "destilaria");

  // ---------- vinhaça: tanques de saída (início do canal)
  for (const x of [378, 414]) S.add(cyl(x, 680, 15, 0, 16, "steel", { steps: 40 }) + band(x, 680, 15, 6) + band(x, 680, 15, 11) + ladder(x, 680, 15, 0, 16) + sideText("VINHAÇA", [x - 8, 694], 8, "left", 3.2, "facelabel dark"), [x, 680, 0], "vinhaca");

  // ---------- torta de filtro: filtro rotativo e pilha de carregamento
  S.add(box(446, 618, 52, 30, 0, 14, "wall") + windows(446, 618, 52, 30, 3, 12, "y", 4, 1, "louvre") + box(444, 616, 56, 34, 14, 1.4, "roofGrey") + sideText("FILTRO", [452, 648], 4, "left", 4, "facelabel dark"), [472, 633, 0], "torta");
  S.add(box(452, 664, 46, 30, 0, 1.2, "concrete", { noShadow: true }) + box(458, 668, 34, 22, 1.2, 4, "torta", { r: 5 }) + box(464, 672, 22, 14, 5.2, 2.6, "torta", { r: 5 }), [475, 679, 0], "torta");

  // ---------- parque de tanques de etanol (OSM: 5 tanques)
  S.floor(groundRect(510, 716, 160, 104, "bund", 1.74));
  for (const [x, y, r] of [[534, 742, 16], [574, 742, 16], [614, 742, 16], [550, 790, 18], [640, 794, 20]]) S.add(cyl(x, y, r, 0, 18, "wall", { steps: 40 }) + band(x, y, r, 9) + dome(x, y, r, 18, "wall", { squash: 0.12, bands: 0 }) + ladder(x, y, r, 0, 18), [x, y, 0], "etanol");
  S.add(sideText("ETANOL", [626, 812], 14, "left", 4, "facelabel dark"), [640, 812, 0], "etanol");

  // ---------- armazém de açúcar, escritório e estacionamento
  S.add(gable(690, 712, 104, 64, 14, 8, "wall", "roofGrey", "x") + door(690, 712, 104, 64, "y", 40, 14, 10, "gate") + windows(690, 712, 104, 64, 4, 12, "x", 4, 1, "win") + sideText("AÇÚCAR", [700, 776], 6, "left", 6, "facelabel"), [742, 744, 0], "acucar");
  S.add(box(700, 820, 90, 34, 0, 12, "wallBlue") + windows(700, 820, 90, 34, 3, 10, "y", 8, 1, "win", 3) + windows(700, 820, 90, 34, 3, 10, "x", 3, 1, "win", 2) + box(698, 818, 94, 38, 12, 1.4, "petrol"), [745, 837, 0], "moenda");
  for (const [x, y] of [[350, 900], [420, 900], [490, 900], [560, 900], [630, 900], [350, 760], [350, 820], [796, 690], [796, 880]]) S.add(tree(x, y, 1.1), [x, y, 0]);

  // ---------- subestação 138/13,8 kV (OSM: "Subestação UTE Cocal 2")
  S.floor(fence([[878, 508], [1094, 508], [1094, 644], [878, 644], [878, 508]], 4));
  S.floor(groundRect(884, 514, 204, 124, "gravel", 1.74));
  for (let i = 0; i < 3; i++) {
    const x = 916 + i * 52;
    S.add(box(x, 540, 26, 20, 0, 12, "steelDark") + box(x + 2, 560, 22, 3, 2, 9, "steel") + cyl(x + 6, 546, 1.2, 12, 8, "wall", { steps: 8 }) + cyl(x + 13, 546, 1.2, 12, 8, "wall", { steps: 8 }) + cyl(x + 20, 546, 1.2, 12, 8, "wall", { steps: 8 }), [x + 13, 550, 0], "subestacao");
  }
  for (const y of [590, 620]) S.add(`<path class="ln tower" d="${pathOf([[900, y, 1.7], [900, y, 26], [1080, y, 26], [1080, y, 1.7]])}"/>` + [940, 990, 1040].map((x) => `<path class="ln insul" d="${pathOf([[x, y, 26], [x, y, 22]])}"/>`).join(""), [990, y, 0], "subestacao");
  for (const [x, y] of PYLONS) S.add(pylon(x, y, PYLON_TOP), [x, y, 0], "subestacao");
  S.add(pylon(1112, 600, PYLON_TOP), [1112, 600, 0], "subestacao");

  // ---------- Lesaffre (vizinha; posição esquemática)
  S.floor(fence([[878, 688], [1094, 688], [1094, 914], [878, 914], [878, 688]], 4));
  S.add(sawtooth(896, 700, 120, 60, 14, 5, "wall", "roofGrey") + stripe(896, 700, 120, 60, 0.5, 5, "storefront") + door(896, 700, 120, 60, "y", 70, 10, 7, "gate"), [956, 730, 0], "lesaffre");
  for (let i = 0; i < 6; i++) { const x = 908 + (i % 3) * 30, y = 792 + Math.floor(i / 3) * 34; S.add(cyl(x, y, 11, 0, 26, "steel", { steps: 28 }) + band(x, y, 11, 9) + band(x, y, 11, 18) + dome(x, y, 11, 26, "steel", { squash: 0.3, bands: 0 }), [x, y, 0], "lesaffre"); }
  S.add(cyl(1050, 800, 14, 0, 14, "steel", { steps: 36 }) + band(1050, 800, 14, 7) + sideText("VINHAÇA", [1042, 813], 6, "left", 3.2, "facelabel dark"), [1050, 800, 0], "lesaffre");
  S.add(box(1022, 840, 60, 50, 0, 10, "wallBlue") + windows(1022, 840, 60, 50, 3, 8, "y", 5, 1, "win", 2), [1052, 865, 0], "lesaffre");
  for (const [x, y] of [[1086, 700], [1086, 760], [890, 900], [960, 900]]) S.add(tree(x, y, 1.1), [x, y, 0]);
}

export { cone };
