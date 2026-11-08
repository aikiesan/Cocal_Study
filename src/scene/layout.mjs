// Planta geral do diorama (coordenadas de mundo: +x = leste, +y = sul, z para cima;
// 1 unidade ≈ 1 px na visão geral). O norte fica no alto, à esquerda da tela.
//
// A disposição segue o complexo real de forma simplificada: a usina de biogás
// fica a noroeste e a usina de açúcar e etanol a sudeste, cerca de 1,3 km
// adiante (gêmeo digital aikiesan/cocal_simulation). As distâncias estão
// comprimidas e as posições dentro de cada zona são esquemáticas.
//
// A base não é quadrada: o complexo real tem forma de L (a faixa da usina de
// biogás corre até a usina de açúcar, que dobra num pátio para o sul). Aqui o
// L é ortogonal: falta o canto sudoeste, abaixo da estrada principal.
export const BASE = { x: -40, y: -300, w: 1170, d: 1260 };
export const NOTCH = { x: 286, y: 492 }; // canto sudoeste recortado: x < 286 e y > 492
// Contorno da base (sentido horário, em planta).
export const BASE_RING = [
  [BASE.x, BASE.y], [BASE.x + BASE.w, BASE.y], [BASE.x + BASE.w, BASE.y + BASE.d],
  [NOTCH.x, BASE.y + BASE.d], [NOTCH.x, NOTCH.y], [BASE.x, NOTCH.y],
];

// Lotes de cada zona. id = etiqueta usada para destacar objetos.
export const PLOTS = [
  { id: "clientes", x: 0, y: -282, w: 270, d: 222, mat: "plotInd", label: "CLIENTES DO CO₂" },
  { id: "cidades", x: 330, y: -282, w: 770, d: 222, mat: "city", label: "REDE DE GÁS · OESTE PAULISTA" },
  { id: "cana", x: 0, y: 0, w: 270, d: 440, mat: "plotAgro", label: "CANAVIAL" },
  { id: "usina", x: 330, y: 0, w: 400, d: 440, mat: "plant", label: "USINA DE BIOGÁS E BIOMETANO" },
  { id: "parceiros", x: 790, y: 0, w: 310, d: 200, mat: "plotPec", label: "PARCEIROS" },
  { id: "lavoura", x: 790, y: 230, w: 310, d: 210, mat: "plotAgro", label: "CANAVIAL · FERTIRRIGAÇÃO" },
  { id: "moenda", x: 330, y: 500, w: 480, d: 420, mat: "plotInd", label: "USINA DE AÇÚCAR E ETANOL" },
  { id: "subestacao", x: 870, y: 500, w: 230, d: 150, mat: "city", label: "SUBESTAÇÃO 138 kV" },
  { id: "lesaffre", x: 870, y: 680, w: 230, d: 240, mat: "plotInd", label: "LESAFFRE (VIZINHA)" },
];

export const ROAD_W = 14;
// Ruas ao longo de x: [y, x0, x1]  e ao longo de y: [x, y0, y1]
export const ROADS_X = [
  [470, -20, 1130],
  [-30, 300, 1130],
];
export const ROADS_Y = [
  [300, -60, 950],
  [760, -30, 470],
  [840, 470, 950],
];

// Canal de vinhaça (o OpenStreetMap mapeia dois canais "Vinhaça" no complexo).
// O traçado aqui é esquemático: do tanque da usina até a lagoa de recepção.
export const CANAL = [[378, 650], [378, 520], [346, 520], [346, 384]];

// Pontos usados pelos efeitos, pela noite e pela vida ambiente.
export const SPOTS = {
  flare: [712, 412],
  flareTop: 40,
  dome: [560, 178],
  vds: [[548, 74], [612, 74]],
  vdR: 24,
  hds: [[350, 30], [350, 84], [350, 138], [350, 192]], // canto noroeste de cada digestor horizontal
  hdSize: [130, 44],
  chpStack: [[536, 253, 30], [580, 253, 30]],
  boilerStacks: [[596, 532, 74], [612, 532, 66]],
  substation: [960, 560, 24],
  sprinkler: [990, 380, 6],
  bunkers: [690, 60, 6],
  city: [960, -180],
};
