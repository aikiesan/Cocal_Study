// Canaviais e parceiros. A colheita e os talhões são ilustrativos: não se
// publica quais talhões recebem o digestato nem como a palha é recolhida.
import { box, gable, windows, door, tree, pathOf, groundRect, fence, cyl, band } from "../kit.mjs";

// Linhas de cana ao longo de x; `cut` = linhas já colhidas (só palha no chão).
function canavial(S, tag, x, y, w, d, { cutFrom = 1, wet = 0 } = {}) {
  S.floor(groundRect(x, y, w, d, "field"));
  const n = Math.floor((d - 8) / 12);
  for (let i = 0; i < n; i++) {
    const yy = y + 6 + i * 12;
    const cut = i >= Math.floor(n * cutFrom);
    if (cut) S.floor(groundRect(x + 4, yy, w - 8, 5, wet && i < Math.floor(n * cutFrom) + wet ? "strawrow wet" : "strawrow", 1.75));
    else S.add(`<g class="canerow">` + box(x + 4, yy, w - 8, 5, 1.6, 7 + (i % 3), "cane", { r: 2, steps: 3 }) + `</g>`, [x + w / 2, yy + 2.5, 0], tag);
  }
}

export function buildCampo(S) {
  // ---------- canavial a oeste (colheita em andamento)
  canavial(S, "cana", 10, 10, 250, 420, { cutFrom: 0.72 });
  // fardos de palha à beira da estrada (o uso da palha no biodigestor não é comprovado)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) S.add(box(238 + j * 13, 374 + i * 16, 11, 13, 1.6, i === 0 ? 11 : 6, "straw") + `<path class="ln twine" d="${pathOf([[243.5 + j * 13, 374 + i * 16, i === 0 ? 12.6 : 7.6], [243.5 + j * 13, 387 + i * 16, i === 0 ? 12.6 : 7.6]])}"/>`, [244 + j * 13, 380 + i * 16, 0], "palha");

  // ---------- canavial a leste, que recebe digestato (fertirrigação; talhão ilustrativo)
  canavial(S, "lavoura", 800, 240, 236, 190, { cutFrom: 0.35, wet: 9 });
  // carretel do canhão de fertirrigação e mangueira até o fim da adutora de digestato
  S.add(cyl(990, 380, 5, 1.6, 6, "steelDark", { steps: 16 }) + box(984, 386, 12, 6, 1.6, 2, "petrol"), [990, 383, 0], "lavoura");
  S.floor(`<path class="hose" d="${pathOf([[990, 380, 1.8], [990, 400, 1.8], [800, 400, 1.8]])}"/>`);
  S.add(gable(1046, 250, 40, 30, 9, 5, "wallWarm", "roofRed", "y") + door(1046, 250, 40, 30, "y", 12, 14, 7, "gate"), [1066, 265, 0], "lavoura");

  // ---------- parceiros: resíduos orgânicos de terceiros (sem volume publicado)
  S.add(gable(812, 24, 120, 44, 11, 6, "wall", "roofGreen", "x", { ridgeVent: true }) + windows(812, 24, 120, 44, 2, 8, "y", 10, 1, "louvre") + door(812, 24, 120, 44, "x", 14, 12, 8, "gate"), [872, 46, 0], "parceiros");
  S.add(gable(812, 88, 120, 30, 9, 5, "wall", "roofGrey", "x", { ridgeVent: true }) + windows(812, 88, 120, 30, 2, 7, "y", 10, 1, "louvre"), [872, 103, 0], "parceiros");
  S.add(box(960, 30, 110, 70, 0, 1.4, "concrete", { noShadow: true }) + [0, 1, 2].map((k) => box(966 + k * 34, 40, 28, 50, 1.4, 4, "manure", { r: 6 }) + box(972 + k * 34, 48, 16, 34, 5.4, 2, "manure", { r: 6 })).join(""), [1015, 65, 0], "parceiros");
  S.add(cyl(1050, 150, 12, 0, 14, "steel", { steps: 32 }) + band(1050, 150, 12, 7), [1050, 150, 0], "parceiros");
  S.floor(fence([[804, 12], [1094, 12], [1094, 192], [804, 192], [804, 12]], 3.6));
  for (const [x, y] of [[960, 150], [990, 170], [820, 170], [880, 170]]) S.add(tree(x, y, 1.1), [x, y, 0]);
}
