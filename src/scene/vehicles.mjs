// Veículos animados: colheita, caminhões de cana, torta, resíduos de parceiros,
// vinhaça da Lesaffre, digestato e CO₂. Rotas ilustrativas.
import { box, iso, depth } from "./kit.mjs";

export const ROUTES = [
  // colheita no canavial oeste (safra)
  { id: "h-colhedora", season: "safra", kind: "harvester", cargo: "lima", speed: 9, top: true, pts: [[16, 318], [252, 318], [252, 312], [16, 312], [16, 318]] },
  { id: "t-transbordo", season: "safra", kind: "tractor", cargo: "cane", speed: 9, top: true, pts: [[22, 330], [246, 330], [246, 324], [22, 324], [22, 330]] },
  // cana do campo para o pátio da usina (safra)
  { id: "t-cana1", season: "safra", kind: "truck", cargo: "cane", pts: [[266, 330], [300, 330], [300, 476], [400, 476], [400, 506]] },
  { id: "t-cana2", season: "safra", kind: "truck", cargo: "cane", pts: [[1100, 336], [760, 336], [760, 464], [420, 464], [420, 506]] },
  { id: "t-cana3", season: "safra", kind: "truck", cargo: "cane", pts: [[266, 410], [300, 410], [300, 476], [380, 476], [380, 506]] },
  // torta de filtro: da usina de açúcar aos bunkers (safra)
  { id: "t-torta", season: "safra", kind: "truck", cargo: "torta", pts: [[475, 664], [475, 470], [760, 470], [760, 60], [724, 60]] },
  // resíduos orgânicos de parceiros para os bunkers
  { id: "t-parc", kind: "truck", cargo: "manure", pts: [[940, 106], [940, 210], [760, 210], [760, 100], [724, 100]] },
  // vinhaça da Lesaffre (a partir de jun/2026; modal de transporte não publicado)
  { id: "t-lesaffre", kind: "tanker", cargo: "vinasse", pts: [[1036, 800], [1036, 670], [840, 670], [840, 476], [300, 476], [300, 320], [334, 320]] },
  // digestato para o canavial a leste
  { id: "t-dig", kind: "tanker", cargo: "digestate", pts: [[334, 316], [300, 316], [300, 464], [760, 464], [760, 412], [800, 412]] },
  // CO₂ líquido para os clientes
  { id: "t-co2", kind: "tanker", cargo: "wall", pts: [[734, 330], [760, 330], [760, -30], [300, -30], [300, -160], [262, -160]] },
  // movimento nas estradas
  { id: "c-1", kind: "car", cargo: "steelDark", pts: [[1130, -30], [300, -30], [300, 940]] },
  { id: "c-2", kind: "car", cargo: "red", pts: [[300, 940], [300, 476], [840, 476], [840, 940]] },
  { id: "c-3", kind: "car", cargo: "wall", speed: 30, pts: [[840, 940], [840, 476], [1130, 476]] },
  { id: "t-bus", kind: "bus", cargo: "cyan", pts: [[1130, -30], [760, -30], [760, 476], [840, 476], [840, 860]] },
];

// Peças em coordenadas locais: u ao longo do sentido, v lateral.
const SHAPES = {
  truck: (c) => [[-15, -1, -3.6, 3.6, 1.6, 9, c], [-15, 6, -3, 3, 0, 1.8, "petrol"], [0, 6, -3.4, 3.4, 1.6, 8, "wall"], [3.6, 6.05, -3, 3, 4.2, 7.4, "glass"]],
  tanker: (c) => [[-15, -1, -3.4, 3.4, 2, 8.6, c], [-15, 6, -3, 3, 0, 1.8, "petrol"], [0, 6, -3.4, 3.4, 1.6, 8, "wall"], [3.6, 6.05, -3, 3, 4.2, 7.4, "glass"]],
  bus: (c) => [[-14, 8, -3.6, 3.6, 1.6, 10, c], [-14, 8, -3.6, 3.6, 0, 1.8, "petrol"], [7.8, 8.05, -3, 3, 4.5, 9, "glass"]],
  harvester: (c) => [[-8, 6, -4.6, 4.6, 1.6, 8, c], [-10, -8, -6, 6, 1.6, 3.4, "petrol"], [0, 5, -3, 3, 8, 13, "glass"], [-4, -2, 1, 3, 8, 15, "steelDark"]],
  tractor: (c) => [[-16, -3, -3.6, 3.6, 2, 8, c], [-2, 5, -2.6, 2.6, 1.6, 5.4, "green"], [-1, 2, -2.2, 2.2, 5.4, 9, "glass"]],
  car: (c) => [[-4, 4, -2.2, 2.2, 0.6, 3.4, c], [-2.4, 2, -2, 2, 3.4, 5.4, "glass"], [-2.2, 1.8, -2.1, 2.1, 5.4, 5.8, c]],
};

function shape(kind, cargo, h) {
  const map = (u, v) => h === "px" ? [u, v] : h === "nx" ? [-u, -v] : h === "py" ? [-v, u] : [v, -u];
  const out = SHAPES[kind](cargo).map(([u0, u1, v0, v1, z0, z1, m]) => {
    const a = map(u0, v0), b = map(u1, v1);
    const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(a[0] - b[0]), d = Math.abs(a[1] - b[1]);
    return { d: depth([x + w / 2, y + d / 2, z0]), s: box(x, y, w, d, z0, z1 - z0, m, { r: kind === "car" ? 1 : 0.8 }) };
  });
  out.sort((p, q) => p.d - q.d);
  return out.map((p) => p.s).join("");
}

export function buildVehicles() {
  return ROUTES.map((r) => {
    const variants = ["px", "nx", "py", "ny"].map((h) => `<g class="veh-${h}" style="display:none">${shape(r.kind, r.cargo, h)}</g>`).join("");
    return { ...r, svg: `<g class="vehicle ${r.kind}${r.season === "safra" ? " safra" : ""}" id="${r.id}">${variants}</g>`, screen: r.pts.map(([x, y]) => iso([x, y, 1.7])) };
  });
}
