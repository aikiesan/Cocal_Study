// Destinos: a rede de gás do oeste paulista (Presidente Prudente, Pirapozinho
// e Narandiba) e os clientes do CO₂ verde. As cidades estão comprimidas e
// fora de escala: Presidente Prudente fica a cerca de 46 km em linha reta da
// usina (51 km de gasoduto). A disposição é esquemática.
import { box, cyl, gable, sawtooth, windows, door, stripe, band, dome, tower, house, tree, pathOf, groundRect, fence, sideText, zoneLabel } from "../kit.mjs";

export const HOME = { x: 1000, y: -128 };

export function buildDestinos(S) {
  // ---------- estação de entrega (city gate) da distribuidora
  S.floor(fence([[742, -150], [800, -150], [800, -88], [742, -88], [742, -150]], 3.6));
  S.add(box(750, -142, 26, 18, 0, 8, "wall") + stripe(750, -142, 26, 18, 0.5, 2.5, "brandband") + windows(750, -142, 26, 18, 3, 7, "y", 2, 1, "louvre"), [763, -133, 0], "citygate");
  S.add(cyl(788, -134, 2.4, 0, 9, "amber", { steps: 12 }) + cyl(788, -134, 3.6, 9, 2, "amber", { steps: 12 }) + cyl(788, -110, 2.4, 0, 6, "amber", { steps: 12 }) + box(752, -116, 22, 14, 0, 4, "steelDark"), [788, -122, 0], "citygate");

  // ---------- Narandiba (cidade pequena)
  const houses = [[386, -246], [410, -246], [434, -246], [458, -246], [386, -214], [410, -214], [458, -214], [386, -182], [434, -182], [458, -182], [386, -150], [410, -150]];
  for (const [x, y] of houses) S.add(house(x, y, { w: 16, d: 13, h: 7, ridge: (x + y) % 3 ? "x" : "y", solar: (x * 3 + y) % 5 === 0 }), [x + 8, y + 7, 0], "narandiba");
  S.add(gable(500, -236, 30, 46, 14, 7, "wall", "roofRed", "y") + box(510, -200, 10, 10, 0, 30, "wall") + box(509, -201, 12, 12, 30, 2, "roofGrey") + door(500, -236, 30, 46, "y", 10, 10, 9, "door"), [515, -213, 0], "narandiba");
  S.floor(zoneLabel("NARANDIBA", 386, -112, 8));

  // ---------- Pirapozinho
  const h2 = [[580, -256], [604, -256], [628, -256], [652, -256], [676, -256], [580, -224], [628, -224], [676, -224], [580, -192], [604, -192], [652, -192], [676, -192], [604, -160], [652, -160]];
  for (const [x, y] of h2) S.add(house(x, y, { w: 16, d: 13, h: 7, ridge: (x + y) % 4 ? "x" : "y", roof: (x + y) % 3 ? "roofRed" : "roofGrey" }), [x + 8, y + 7, 0], "pirapozinho");
  S.add(box(700, -250, 20, 26, 0, 22, "wallWarm") + windows(700, -250, 20, 26, 4, 20, "y", 2, 3) + box(698, -252, 24, 30, 22, 1.4, "roofGrey"), [710, -237, 0], "pirapozinho");
  S.floor(zoneLabel("PIRAPOZINHO", 580, -112, 8));

  // ---------- Presidente Prudente (51 km de gasoduto)
  const towers = [[870, -262, 28, 26, 54], [906, -262, 26, 24, 70], [940, -262, 30, 26, 46], [980, -262, 26, 26, 62], [1016, -262, 30, 26, 40], [1056, -262, 30, 30, 52], [870, -222, 26, 22, 36], [1056, -218, 30, 24, 34]];
  for (const [x, y, w, d, h] of towers) S.add(tower(x, y, w, d, h, { lit: 4, balcony: (x + h) % 2 === 0 }), [x + w / 2, y + d / 2, 0], "prudente");
  const h3 = [[912, -214], [936, -214], [960, -214], [984, -214], [1008, -214], [1032, -214], [912, -182], [936, -182], [984, -182], [1008, -182], [1032, -182], [1056, -182], [912, -150], [960, -150], [984, -150], [1032, -150], [1056, -150], [870, -182], [870, -150]];
  for (const [x, y] of h3) S.add(house(x, y, { w: 16, d: 13, h: 7, ridge: (x * 7 + y) % 3 ? "x" : "y", solar: (x + y) % 7 === 0 }), [x + 8, y + 7, 0], "prudente");
  // posto de GNV/biometano na entrada da cidade
  S.add(box(1000, -128, 40, 22, 9, 1.6, "petrol") + box(1004, -124, 2, 2, 0, 9, "steelDark") + box(1034, -124, 2, 2, 0, 9, "steelDark") + box(1014, -120, 4, 6, 0, 5, "cyan") + box(1024, -120, 4, 6, 0, 5, "cyan"), [1020, -117, 0], "prudente");
  S.add(box(1050, -132, 30, 20, 0, 8, "wall") + windows(1050, -132, 30, 20, 2, 7, "y", 3, 1, "win", 2), [1065, -122, 0], "prudente");
  S.floor(zoneLabel("PRESIDENTE PRUDENTE", 870, -112, 8));
  S.floor(zoneLabel("51 km · gasoduto", 772, -64, 6));

  // ---------- clientes do CO₂ verde (bebidas, alimentos, gases industriais)
  S.add(sawtooth(20, -262, 120, 64, 14, 5, "wall", "roofGreen") + stripe(20, -262, 120, 64, 0.5, 5, "storefront") + door(20, -262, 120, 64, "y", 70, 12, 8, "gate"), [80, -230, 0], "clientes");
  for (const x of [170, 200]) S.add(cyl(x, -236, 9, 0, 28, "wall", { steps: 28 }) + band(x, -236, 9, 10, "ln band gasband") + dome(x, -236, 9, 28, "wall", { squash: 0.5, bands: 0 }) + sideText("CO₂", [x - 4, -227.4], 16, "left", 4, "facelabel dark"), [x, -236, 0], "clientes");
  S.add(box(20, -176, 90, 40, 0, 10, "wallBlue") + windows(20, -176, 90, 40, 3, 8, "y", 7, 1, "win", 2), [65, -156, 0], "clientes");
  S.floor(groundRect(130, -180, 120, 40, "lot", 1.72));
  for (const [x, y] of [[250, -270], [250, -110], [16, -110], [130, -110]]) S.add(tree(x, y, 1.15), [x, y, 0]);
  for (const [x, y] of [[560, -100], [540, -260], [730, -200], [850, -100], [1090, -96]]) S.add(tree(x, y, 1.1), [x, y, 0]);
}
