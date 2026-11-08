// Fluxos de matéria e energia: tubos no chão, canal de vinhaça, esteiras e
// linhas aéreas. Não há fluxograma (P&ID) público da usina: os traçados são
// esquemáticos e mostram o caminho lógico, não a tubulação real.
import { pathOf } from "./kit.mjs";
import { CANAL } from "./layout.mjs";
import { PYLONS, PYLON_TOP } from "./zones/moenda.mjs";

const Z = 2;
// tags = zonas a que o trecho pertence (para destaque nas etapas)
export const PIPES = [
  // vinhaça: canal da usina de açúcar até a recepção, tanque pulmão e digestores
  { id: "f-canal", tags: ["vinhaca", "moenda"], stream: "vinhaca", pts: CANAL.map(([x, y]) => [x, y, 1.9]) },
  { id: "f-vin1", tags: ["vinhaca"], stream: "vinhaca", pts: [[351, 384], [351, 366], [370, 366]] },
  { id: "f-vin2", tags: ["vinhaca"], stream: "vinhaca", pts: [[390, 352], [390, 322]] },
  { id: "f-vin3", tags: ["vinhaca", "horizontais"], stream: "vinhaca", pts: [[370, 300], [342, 300], [342, 52], [350, 52]] },
  { id: "f-vin4", tags: ["vinhaca", "horizontais"], stream: "vinhaca", pts: [[342, 106], [350, 106]] },
  { id: "f-vin5", tags: ["vinhaca", "horizontais"], stream: "vinhaca", pts: [[342, 160], [350, 160]] },
  { id: "f-vin6", tags: ["vinhaca", "horizontais"], stream: "vinhaca", pts: [[342, 214], [350, 214]] },
  { id: "f-vin7", tags: ["vinhaca", "verticais"], stream: "vinhaca", pts: [[410, 300], [500, 300], [500, 74], [524, 74]] },
  // torta de filtro: esteira dos bunkers até os verticais
  { id: "f-torta", tags: ["bunkers", "verticais"], stream: "substrato", pts: [[628, 134, 13], [580, 80, 27]] },
  // bagaço: esteira da moenda até a pilha e a caldeira
  { id: "f-bagaco", tags: ["caldeira", "moenda"], stream: "substrato", pts: [[543, 579, 22], [591, 619, 14]] },
  { id: "f-bagaco2", tags: ["caldeira"], stream: "substrato", pts: [[612, 612, 6], [607, 574, 10]] },
  // biogás bruto: digestores -> cúpula
  { id: "f-bg1", tags: ["horizontais", "cupula"], stream: "biogas", pts: [[480, 214], [490, 214], [490, 178], [538, 178]] },
  { id: "f-bg2", tags: ["horizontais", "cupula"], stream: "biogas", pts: [[480, 52], [490, 52], [490, 178]] },
  { id: "f-bg3", tags: ["horizontais"], stream: "biogas", pts: [[480, 106], [490, 106]] },
  { id: "f-bg4", tags: ["horizontais"], stream: "biogas", pts: [[480, 160], [490, 160]] },
  { id: "f-bg5", tags: ["verticais", "cupula"], stream: "biogas", pts: [[548, 98], [548, 156]] },
  { id: "f-bg6", tags: ["verticais", "cupula"], stream: "biogas", pts: [[612, 98], [612, 112], [570, 112], [570, 158]] },
  { id: "f-bg7", tags: ["cupula", "thiopaq"], stream: "biogas", pts: [[582, 178], [600, 178], [600, 196], [618, 196]] },
  // biogás dessulfurizado: THIOPAQ -> motores, purificação e flare
  { id: "f-ds1", tags: ["thiopaq", "chp"], stream: "dessulf", pts: [[648, 220], [648, 232], [556, 232], [556, 244]] },
  { id: "f-ds2", tags: ["thiopaq", "upgrading"], stream: "dessulf", pts: [[648, 232], [680, 232], [680, 244]] },
  { id: "f-ds3", tags: ["thiopaq", "flare"], stream: "dessulf", pts: [[680, 232], [718, 232], [718, 404]] },
  // biometano: purificação -> compressão -> gasoduto -> cidades
  { id: "f-bm1", tags: ["upgrading", "compressao"], stream: "biometano", pts: [[640, 290], [640, 302], [600, 302], [600, 318]] },
  { id: "f-bm2", tags: ["compressao"], stream: "biometano", pts: [[604, 344], [604, 388], [616, 388]] },
  { id: "f-gas", tags: ["compressao", "gasoduto", "citygate"], stream: "biometano", pts: [[624, 388], [640, 388], [640, 428], [752, 428], [752, -88]] },
  { id: "f-rede1", tags: ["citygate", "gasoduto", "narandiba", "pirapozinho"], stream: "biometano", pts: [[742, -100], [380, -100]] },
  { id: "f-rede2", tags: ["citygate", "narandiba"], stream: "biometano", pts: [[470, -100], [470, -136]] },
  { id: "f-rede3", tags: ["citygate", "pirapozinho"], stream: "biometano", pts: [[640, -100], [640, -146]] },
  { id: "f-rede4", tags: ["citygate", "gasoduto", "prudente"], stream: "biometano", pts: [[800, -100], [1000, -100], [1000, -106]] },
  { id: "f-rede5", tags: ["citygate", "prudente"], stream: "biometano", pts: [[900, -100], [900, -136]] },
  // CO₂: purificação -> liquefação e tanques
  { id: "f-co2", tags: ["upgrading", "co2"], stream: "co2", pts: [[690, 290], [690, 304], [706, 304], [706, 323]] },
  // digestato: digestores -> separação -> lagoas -> canavial (traçado esquemático)
  { id: "f-dig1", tags: ["horizontais", "separacao"], stream: "digestato", pts: [[440, 236], [440, 300]] },
  { id: "f-dig2", tags: ["separacao"], stream: "digestato", pts: [[452, 318], [452, 373]] },
  { id: "f-dig3", tags: ["separacao"], stream: "digestato", pts: [[492, 326], [492, 360], [508, 360], [508, 383]] },
  { id: "f-dig4", tags: ["separacao", "lavoura"], stream: "digestato", pts: [[431, 410], [431, 452], [776, 452], [776, 400], [800, 400]] },
];

function arc(a, b, lift, n = 24) {
  const pts = [];
  for (let t = 0; t <= n; t++) { const u = t / n; pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u + Math.sin(Math.PI * u) * lift]); }
  return pts;
}

export function buildFlows() {
  // base branca do tubo (camada estática) e núcleo colorido animado (camada dinâmica)
  const ds = PIPES.map((f) => ({ f, d: pathOf(f.pts.map((p) => [p[0], p[1], p[2] ?? Z])) }));
  const pipes = ds.map(({ f, d }) => `<g class="flow s-${f.stream}" data-stream="${f.stream}"><path class="pipe" d="${d}"/></g>`).join("");
  const cores = ds.map(({ f, d }) => `<g class="flow s-${f.stream}" data-stream="${f.stream}"><path class="core" id="${f.id}" d="${d}"/></g>`).join("");

  // linhas aéreas: motores do biogás -> torres -> subestação -> rede (SIN)
  const top = PYLON_TOP - 6;
  const wire = [[609, 256, 15], ...PYLONS.map(([x, y]) => [x, y, top]), [900, 590, 26]];
  const overhead = [];
  for (let i = 0; i < wire.length - 1; i++) overhead.push({ id: `w-${i}`, tags: ["chp", "subestacao"], stream: "eletricidade", d: pathOf(arc(wire[i], wire[i + 1], -6, 12)) });
  // casa de força da usina de açúcar (bagaço) -> subestação
  overhead.push({ id: "w-moenda", tags: ["caldeira", "subestacao"], stream: "eletricidade", d: pathOf(arc([704, 537, 20], [852, 556, top], -5, 12)) });
  // subestação -> rede
  overhead.push({ id: "w-sin", tags: ["subestacao"], stream: "eletricidade", d: pathOf(arc([1080, 600, 26], [1112, 600, top], -2, 8)) + pathOf(arc([1112, 600, top], [1150, 600, top - 4], -2, 8)).replace("M", "L") });

  const lines = (list, cls) => `<g class="flow s-${list[0].stream} ${cls}" data-stream="${list[0].stream}">${list.map((w) => `<path class="core" id="${w.id}" d="${w.d}"/>`).join("")}</g>`;
  return {
    pipes,
    cores,
    overhead: lines(overhead, "overhead"),
    ids: PIPES.concat(overhead).map(({ id, stream, tags }) => ({ id, stream, tags })),
  };
}
