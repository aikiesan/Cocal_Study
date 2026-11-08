// Materiais da cena. A cena é propositalmente sóbria (brancos, cinzas, verdes
// suaves) para que a cor forte fique reservada ao que carrega informação:
// os fluxos (biogás, biometano, CO₂...) e os setores de origem.
export const MATERIALS = {
  base: "#2B5263",
  grass: "#D3E6BE",
  grassDark: "#A9CF85",
  soil: "#CDB08C",
  plotAgro: "#E1EDCD",
  plotPec: "#ECE3D2",
  plotInd: "#E7E4DC",
  plotUrb: "#DDE8EE",
  plotUni: "#E4ECEF",
  plotForest: "#D5E5C0",
  euca: "#8DB86B",
  eucaDark: "#6E9E52",
  ipeYellow: "#F2C230",
  ipePink: "#D97BB0",
  log: "#B98C5E",
  sand: "#E8DDBF",
  boat: "#FFFFFF",
  plant: "#EEF2F3",
  city: "#EAEFF1",
  concrete: "#E3E8EA",
  wall: "#F7F7F4",
  wallWarm: "#F1E6D6",
  wallBlue: "#DCE7EC",
  wallSand: "#EADFC8",
  steel: "#D6DEE2",
  steelDark: "#9AAAB2",
  roofTop: "#C9D3D7",
  petrol: "#1E3E4C",
  green: "#00573A",
  leaf: "#6FAE45",
  leafDark: "#4E8C3A",
  leafLight: "#93C463",
  solar: "#2F4F6B",
  cloud: "#FFFFFF",
  lima: "#B6E03B",
  amber: "#D37402",
  ochre: "#A15500",
  trunk: "#8A6A4E",
  roofRed: "#C4775A",
  roofGrey: "#93A5AD",
  roofGreen: "#4B7F57",
  water: "#8CC3D9",
  manure: "#7A5230",
  digestate: "#6B4A2B",
  cane: "#82B84C",
  straw: "#E2C268",
  bagasse: "#D8B98A",
  cow: "#FAFAF7",
  cowBrown: "#8C5A3C",
  glass: "#BFE0EA",
  urban: "#166E97",
  red: "#C9483F",
  yellow: "#F2B705",
  lamp: "#FFF4C2",
  co2: "#8FA6B0",
  membrane: "#D9C7A0",
  membraneLight: "#EDE6D3",
  torta: "#5E4A3A",
  vinasse: "#5A3A22",
  canal: "#7B5636",
  emerald: "#1F9D55",
  cyan: "#0097B2",
  orange: "#E4572E",
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };

// Cada material vira um conjunto de variáveis CSS: topo, 4 tons laterais e aresta.
export function materialCss() {
  let css = "";
  for (const [name, c] of Object.entries(MATERIALS)) {
    css += `.m-${name}{--t:${mix(c, "#ffffff", 0.28)};--s3:${mix(c, "#ffffff", 0.08)};--s2:${c};--s1:${mix(c, "#0b1d25", 0.14)};--s0:${mix(c, "#0b1d25", 0.26)};--e:${mix(c, "#0f2530", 0.62)}}\n`;
  }
  return css;
}
