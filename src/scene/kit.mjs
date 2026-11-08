// Primitivas isométricas da cena.
// Câmera, extrusão e sombreamento em 4 tons vêm do kit do Anatomy
// (src/vendor/iso-kit.mjs, MIT). Aqui ficam as peças "de construção":
// caixas, cilindros, cúpulas, galpões, janelas, árvores, postes etc.
import * as K from "../vendor/iso-kit.mjs";
import { MATERIALS, mix } from "./materials.mjs";

export const P = { origin: [0, 0], scale: 1 };
export const KS = K.cameraOf(P).k;
const R = (n) => Math.round(n * 10) / 10;
export const iso = (p) => K.iso(p, P);
export const depth = (p) => K.depthOf(p, P);
const VIEW = K.towardViewer(P);
const pt = (p) => { const [x, y] = iso(p); return `${R(x)},${R(y)}`; };
export const pathOf = (pts, closed = false) => "M" + pts.map(pt).join("L") + (closed ? "Z" : "");
export const circleRing = K.circleRing;

// ------------------------------------------------------------ cena
// Coleta camadas: "ground" (sempre ao fundo) e objetos ordenados por profundidade.
export function createScene() {
  const ground = [];
  const objs = [];
  const under = []; // chão animado (correnteza): camada dinâmica abaixo dos objetos
  const dyn = []; // objetos animados (vacas, gasômetro): camada dinâmica acima
  return {
    ground,
    objs,
    floor(svg) { ground.push(svg); },
    under(svg) { under.push(svg); },
    dyn(svg, at, tag) { dyn.push({ d: depth(at), svg, tag }); },
    add(svg, at, tag) { objs.push({ d: depth(at), svg, tag }); },
    addAt(svg, d, tag) { objs.push({ d, svg, tag }); },
    render() {
      objs.sort((a, b) => a.d - b.d);
      dyn.sort((a, b) => a.d - b.d);
      return {
        ground: ground.join(""),
        objects: objs.map((o, i) => (o.tag ? `<g data-tag="${o.tag}" id="ob${i}">${o.svg}</g>` : o.svg)).join(""),
        under: under.join(""),
        dyn: dyn.map((o, i) => (o.tag ? `<g data-tag="${o.tag}" id="dy${i}">${o.svg}</g>` : o.svg)).join(""),
      };
    },
  };
}

// ------------------------------------------------------------ sólidos
export function solidSvg(paths, mat, cls = "") {
  let s = `<g class="sd m-${mat} ${cls}"><path class="f" d="${paths.fill}"/>`;
  paths.shades.forEach((d, i) => { if (d) s += `<path class="s${i}" d="${d}"/>`; });
  s += `<path class="t" d="${paths.top}"/>`;
  if (paths.crease) s += `<path class="ln cr" d="${paths.crease}"/>`;
  s += `<path class="ln ol" d="${paths.outline}"/></g>`;
  return s;
}
export const slab = (plan, z, h, mat, cls, steps = 8) => solidSvg(K.slabOf(plan, z, h, P, steps), mat, cls);
// Contorno poligonal com cantos arredondados (serve para cantos côncavos, como o do L).
export function roundRing(pts, r, steps = 6) {
  const out = [];
  pts.forEach((b, i) => {
    const a = pts[(i + pts.length - 1) % pts.length], c = pts[(i + 1) % pts.length];
    const u = (p) => { const dx = p[0] - b[0], dy = p[1] - b[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
    const [ux, uy] = u(a), [vx, vy] = u(c);
    const p1 = [b[0] + ux * r, b[1] + uy * r], p2 = [b[0] + vx * r, b[1] + vy * r];
    for (let s = 0; s <= steps; s++) { const t = s / steps, m = 1 - t; out.push([m * m * p1[0] + 2 * m * t * b[0] + t * t * p2[0], m * m * p1[1] + 2 * m * t * b[1] + t * t * p2[1]]); }
  });
  return out;
}
// Laje com planta poligonal qualquer (não convexa), p.ex. a base em L.
export const slabRing = (ring, z, h, mat, cls) => solidSvg(K.extrude(ring, z, h, P, { convex: false }), mat, cls);
// ------------------------------------------------------------ sombras projetadas
// Luz vem da esquerda (lado -x/+y); a sombra cai para a direita (+x/-y).
// Cada sólido apoiado no chão registra sua sombra; world.mjs desenha todas
// numa única camada translúcida, para que sombras sobrepostas não escureçam.
const SHADOWS = [];
const SH = [0.62, -0.42];
export function castShadow(ring, h, z = 1.7) {
  if (h < 2) return;
  const pts = ring.concat(ring.map(([x, y]) => [x + SH[0] * h, y + SH[1] * h])).map(([x, y]) => iso([x, y, z]));
  const hh = hull(pts);
  SHADOWS.push(`M${hh.map(([x, y]) => `${R(x)},${R(y)}`).join("L")}Z`);
}
export function takeShadows() { const d = SHADOWS.join(""); SHADOWS.length = 0; return d; }
// Registro de pontos de luz para o ciclo dia/noite e para as cozinhas.
export const NIGHT = { windows: [], lamps: [], houses: [] };
export const box = (x, y, w, d, z, h, mat, o = {}) => {
  if (z <= 2 && !o.noShadow) castShadow([[x, y], [x + w, y], [x + w, y + d], [x, y + d]], h + z);
  return solidSvg(K.slabOf({ x, y, w, d, r: o.r ?? 0.6 }, z, h, P, o.steps ?? 2), mat, o.cls);
};
export const cyl = (cx, cy, r, z, h, mat, o = {}) => {
  if (z <= 2 && !o.noShadow && r > 1.5) castShadow(K.circleRing(cx, cy, r, 16), h + z + (o.extra ?? 0));
  return solidSvg(K.cylinder(cx, cy, r, z, h, P, o.steps ?? 36), mat, o.cls);
};
export const prism = (ring, z, h, mat, o = {}) => solidSvg(K.extrude(ring, z, h, P, { convex: o.convex ?? true }), mat, o.cls);

function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// Metade da circunferência voltada ao observador (para faixas em tanques).
export function frontArc(cx, cy, r, z, n = 48) {
  const a0 = Math.atan2(VIEW[1], VIEW[0]);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 - Math.PI / 2 + (i / n) * Math.PI;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]);
  }
  return pts;
}
export const band = (cx, cy, r, z, cls = "ln band") => `<path class="${cls}" d="${pathOf(frontArc(cx, cy, r, z))}"/>`;
// Escada vertical na face frontal de um tanque.
export function ladder(cx, cy, r, z0, z1, angle = Math.PI / 4) {
  const a = Math.atan2(VIEW[1], VIEW[0]) + angle;
  const p = (dr, z) => [cx + (r + 0.6) * Math.cos(a + dr), cy + (r + 0.6) * Math.sin(a + dr), z];
  let s = `<path class="ln ladder" d="${pathOf([p(-0.04, z0), p(-0.04, z1)])}M${pathOf([p(0.04, z0), p(0.04, z1)]).slice(1)}"/>`;
  for (let z = z0 + 2; z < z1; z += 2.4) s += `<path class="ln ladder" d="${pathOf([p(-0.04, z), p(0.04, z)])}"/>`;
  return s;
}
// Cúpula (hemisfério achatado). squash = altura / raio.
export function dome(cx, cy, r, z, mat, { squash = 1, bands = 2, cls = "" } = {}) {
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const phi = (i / 12) * Math.PI / 2;
    for (let j = 0; j < 48; j++) {
      const th = (j / 48) * Math.PI * 2;
      pts.push(iso([cx + r * Math.cos(phi) * Math.cos(th), cy + r * Math.cos(phi) * Math.sin(th), z + r * squash * Math.sin(phi)]));
    }
  }
  const h = hull(pts);
  const d = `M${h.map(([x, y]) => `${R(x)},${R(y)}`).join("L")}Z`;
  let s = `<g class="dome ${cls}"><path class="dm" fill="url(#g-${mat})" d="${d}"/>`;
  for (let b = 1; b <= bands; b++) {
    const phi = (b / (bands + 1)) * Math.PI / 2;
    s += `<path class="ln band m-${mat}" d="${pathOf(frontArc(cx, cy, r * Math.cos(phi), z + r * squash * Math.sin(phi)))}"/>`;
  }
  s += `<path class="ln ol m-${mat}" d="${d}"/></g>`;
  return s;
}
// Cone (telhado de silo, pilha): base circular -> ponta.
export function cone(cx, cy, r, z, h, mat) {
  const pts = circleRing(cx, cy, r, 40).map(([x, y]) => iso([x, y, z]));
  pts.push(iso([cx, cy, z + h]));
  const hh = hull(pts);
  const d = `M${hh.map(([x, y]) => `${R(x)},${R(y)}`).join("L")}Z`;
  return `<g class="dome"><path class="dm" fill="url(#g-${mat})" d="${d}"/><path class="ln ol m-${mat}" d="${d}"/></g>`;
}
export function sphere(c, r, mat, cls = "") {
  const [x, y] = iso(c);
  return `<circle class="sph m-${mat} ${cls}" cx="${R(x)}" cy="${R(y)}" r="${R(r * KS)}" fill="url(#g-${mat})"/>`;
}
// Galpão com telhado de duas águas. ridge: "x" ou "y".
export function gable(x, y, w, d, h, rh, wallMat, roofMat, ridge = "x", o = {}) {
  let s = o.noWalls ? "" : box(x, y, w, d, 0, h, wallMat);
  const ov = o.overhang ?? 1.2;
  const x0 = x - ov, x1 = x + w + ov, y0 = y - ov, y1 = y + d + ov;
  const top = h + rh;
  const roof = (pts, shade) => `<path class="rf m-${roofMat} ${shade}" d="${pathOf(pts, true)}"/>`;
  if (ridge === "x") {
    const ym = y + d / 2;
    s += roof([[x0, y0, h], [x1, y0, h], [x1, ym, top], [x0, ym, top]], "rt");
    s += `<path class="gb m-${wallMat}" d="${pathOf([[x + w, y, h], [x + w, y + d, h], [x + w, ym, top]], true)}"/>`;
    s += roof([[x0, ym, top], [x1, ym, top], [x1, y1, h], [x0, y1, h]], "rl");
    if (o.ridgeVent) s += box(x + 2, ym - 1.2, w - 4, 2.4, top - 0.4, 1.6, roofMat);
  } else {
    const xm = x + w / 2;
    s += roof([[x0, y0, h], [xm, y0, top], [xm, y1, top], [x0, y1, h]], "rt");
    s += `<path class="gb m-${wallMat}" d="${pathOf([[x, y + d, h], [x + w, y + d, h], [xm, y + d, top]], true)}"/>`;
    s += roof([[xm, y0, top], [x1, y0, h], [x1, y1, h], [xm, y1, top]], "rl");
  }
  return s;
}
// Telhado em shed (dente de serra) sobre um galpão; dentes ao longo de x.
export function sawtooth(x, y, w, d, h, n, wallMat, roofMat) {
  let s = box(x, y, w, d, 0, h, wallMat);
  const tw = w / n, rh = Math.min(8, tw * 0.45);
  for (let i = 0; i < n; i++) {
    const a = x + i * tw, b = a + tw;
    s += `<path class="rf m-${roofMat} rl" d="${pathOf([[a, y, h], [b, y, h + rh], [b, y + d, h + rh], [a, y + d, h]], true)}"/>`;
    s += `<path class="glz" d="${pathOf([[b, y, h], [b, y + d, h], [b, y + d, h + rh], [b, y, h + rh]], true)}"/>`;
    s += `<path class="gb m-${wallMat}" d="${pathOf([[a, y + d, h], [b, y + d, h], [b, y + d, h + rh]], true)}"/>`;
  }
  return s;
}
// Janelas em grade numa face vertical (+y ou +x).
export function windows(x, y, w, d, z0, z1, face, cols, rows, cls = "win", lit = 0) {
  let s = "";
  const gw = (face === "y" ? w : d) / cols;
  const gh = (z1 - z0) / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const a = c * gw + gw * 0.22, b = c * gw + gw * 0.78;
    const za = z0 + r * gh + gh * 0.26, zb = z0 + r * gh + gh * 0.8;
    const q = face === "y"
      ? [[x + a, y + d, za], [x + b, y + d, za], [x + b, y + d, zb], [x + a, y + d, zb]]
      : [[x + w, y + a, za], [x + w, y + b, za], [x + w, y + b, zb], [x + w, y + a, zb]];
    const on = lit && ((c * 7 + r * 13 + Math.round(x + y)) % 11) < lit ? " lit" : "";
    const qd = pathOf(q, true);
    s += `<path class="${cls}${on}" d="${qd}"/>`;
    // à noite, cerca de 40% das janelas acendem (sempre as mesmas)
    if (cls === "win" && ((c * 5 + r * 11 + Math.round(x * 3 + y)) % 20) < 11) NIGHT.windows.push(qd);
  }
  return s;
}
// Faixa horizontal (ex.: vitrine do térreo, frisos) nas duas faces visíveis.
export function stripe(x, y, w, d, z0, z1, cls = "storefront") {
  return `<path class="${cls}" d="${pathOf([[x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1]], true)}"/>` +
    `<path class="${cls} side" d="${pathOf([[x + w, y, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x + w, y, z1]], true)}"/>`;
}
export function door(x, y, w, d, face, at, dw = 3, dh = 5, cls = "door") {
  const q = face === "y"
    ? [[x + at, y + d, 0], [x + at + dw, y + d, 0], [x + at + dw, y + d, dh], [x + at, y + d, dh]]
    : [[x + w, y + at, 0], [x + w, y + at + dw, 0], [x + w, y + at + dw, dh], [x + w, y + at, dh]];
  return `<path class="${cls}" d="${pathOf(q, true)}"/>`;
}
// Prédio: bloco com térreo, janelas, platibanda e equipamentos no teto.
export function tower(x, y, w, d, h, o = {}) {
  const mat = o.mat ?? "wall";
  let s = box(x, y, w, d, 0, h, mat);
  s += stripe(x, y, w, d, 0.4, 4.4, o.ground ?? "storefront");
  s += windows(x, y, w, d, 6, h - 2, "y", Math.max(2, Math.round(w / 6)), Math.max(1, Math.round((h - 8) / 5.5)), "win", o.lit ?? 3);
  s += windows(x, y, w, d, 6, h - 2, "x", Math.max(2, Math.round(d / 6)), Math.max(1, Math.round((h - 8) / 5.5)), "win", o.lit ?? 3);
  // platibanda e teto
  s += box(x, y, w, d, h, 1.4, o.trim ?? "steel");
  s += box(x + 1.4, y + 1.4, w - 2.8, d - 2.8, h, 1.0, "roofTop");
  // caixa d'água e casa de máquinas
  s += box(x + w * 0.2, y + d * 0.2, 6, 6, h + 1, 5, "concrete");
  s += box(x + w * 0.2 + 0.6, y + d * 0.2 + 0.6, 4.8, 4.8, h + 6, 0.8, "steelDark");
  // condensadoras de ar-condicionado
  for (let i = 0; i < Math.min(3, Math.floor(w / 10)); i++) s += box(x + w - 6 - i * 5, y + d - 6, 3.4, 3, h + 1, 2, "steel");
  // painéis solares no teto
  if (o.solar) for (let i = 0; i < Math.floor((w - 16) / 7); i++) for (let j = 0; j < 2; j++) s += box(x + w * 0.2 + 9 + i * 7, y + 3 + j * 5, 6, 4, h + 1, 0.7, "solar", { noShadow: true });
  // varandas (faixas horizontais na fachada principal)
  if (o.balcony) for (let z = 10; z < h - 3; z += 5.5) s += box(x + 2, y + d, w - 4, 1.8, z, 0.6, "steel", { noShadow: true }) + `<path class="ln rail" d="${pathOf([[x + 2, y + d + 1.8, z + 2], [x + w - 2, y + d + 1.8, z + 2]])}"/>`;
  return s;
}
// Casa térrea com telhado, porta, janelas, muro e quintal.
export function house(x, y, o = {}) {
  NIGHT.houses.push([x, y, o.w ?? 16, o.d ?? 14, o.h ?? 8]);
  const w = o.w ?? 16, d = o.d ?? 14, h = o.h ?? 8;
  const ridge = o.ridge ?? "x";
  let s = "";
  s += `<path class="yard" d="${pathOf([[x - 3, y - 3, 1.7], [x + w + 3, y - 3, 1.7], [x + w + 3, y + d + 4, 1.7], [x - 3, y + d + 4, 1.7]], true)}"/>`;
  s += gable(x, y, w, d, h, 5.5, o.wall ?? "wall", o.roof ?? "roofRed", ridge);
  if (o.solar) s += `<path class="solarp" d="${pathOf(ridge === "x" ? [[x + 3, y + d * 0.62, h + 3.6], [x + 9, y + d * 0.62, h + 3.6], [x + 9, y + d * 0.9, h + 1.4], [x + 3, y + d * 0.9, h + 1.4]] : [[x + w * 0.62, y + 3, h + 3.6], [x + w * 0.9, y + 3, h + 1.4], [x + w * 0.9, y + 9, h + 1.4], [x + w * 0.62, y + 9, h + 3.6]], true)}"/>`;
  s += windows(x, y, w, d, 1.5, h - 1, "y", 2, 1, "win", 1) + door(x, y, w, d, "x", d * 0.55, 2.6, 5);
  s += windows(x, y, w, d, 1.5, h - 1, "x", 1, 1, "win");
  // muro baixo na frente
  s += `<path class="ln wall-line" d="${pathOf([[x - 3, y + d + 4, 3.2], [x + w + 3, y + d + 4, 3.2], [x + w + 3, y - 3, 3.2]])}"/>`;
  return s;
}
export const groundPoly = (pts, cls, z = 0) => `<path class="${cls}" d="${pathOf(pts.map(([x, y]) => [x, y, z]), true)}"/>`;
export const groundRect = (x, y, w, d, cls, z = 1.7) => groundPoly([[x, y], [x + w, y], [x + w, y + d], [x, y + d]], cls, z);
export const groundLine = (pts, cls, z = 0) => `<path class="${cls}" d="${pathOf(pts.map(([x, y, zz]) => [x, y, zz ?? z]))}"/>`;
export function groundText(text, x, y, size, cls = "gt", along = "x", z = 0.2) {
  return `<text class="${cls}" transform="${K.topMatrix([x, y], z, P, along)}" font-size="${size}">${text}</text>`;
}
export function sideText(text, at, z, face, size, cls = "facelogo") {
  return `<text class="${cls}" transform="${K.sideMatrix(at, z, P, face)}" font-size="${size}">${text}</text>`;
}
const LEAVES = ["leaf", "leafDark", "leafLight"];
export function tree(x, y, s = 1, mat) {
  const k = Math.abs(Math.round(x * 7 + y * 13)) % 3;
  const m = mat ?? LEAVES[k];
  castShadow(K.circleRing(x, y, 4.6 * s, 12), 12 * s);
  let t = cyl(x, y, 0.9 * s, 0, 5 * s, "trunk", { steps: 10, noShadow: true });
  t += sphere([x - 2.2 * s, y - 1.4 * s, 8.6 * s], 3.6 * s, LEAVES[(k + 1) % 3]);
  t += sphere([x, y, 9.4 * s], 4.8 * s, m);
  t += sphere([x + 1.8 * s, y + 2.2 * s, 8 * s], 3.2 * s, LEAVES[(k + 2) % 3]);
  return t;
}
export function pine(x, y, s = 1) {
  castShadow(K.circleRing(x, y, 4 * s, 10), 16 * s);
  return cyl(x, y, 0.8 * s, 0, 4 * s, "trunk", { steps: 8 }) + dome(x, y, 4.2 * s, 3 * s, "roofGreen", { squash: 3.2, bands: 0 });
}
export function streetLight(x, y, dir = [1, 0]) {
  NIGHT.lamps.push([x + dir[0] * 3, y + dir[1] * 3, 14.4]);
  return `<path class="ln pole" d="${pathOf([[x, y, 1.7], [x, y, 14], [x + dir[0] * 3, y + dir[1] * 3, 14.8]])}"/>` + sphere([x + dir[0] * 3, y + dir[1] * 3, 14.4], 0.9, "lamp");
}
// Cerca de alambrado ao longo de uma poligonal.
export function fence(pts, h = 4) {
  let s = `<path class="ln fence-top" d="${pathOf(pts.map(([x, y]) => [x, y, h]))}"/>`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 12));
    for (let k = 0; k <= n; k++) { const u = k / n; const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; s += `<path class="ln fence-post" d="${pathOf([[x, y, 1.7], [x, y, h]])}"/>`; }
  }
  return s;
}
// Rack de tubulação elevado com suportes em pórtico.
export function pipeRack(pts, z = 10, stream = "biogas") {
  let s = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 16));
    for (let k = 0; k <= n; k++) { const u = k / n; const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; s += `<path class="ln rack" d="${pathOf([[x, y, 1.7], [x, y, z]])}"/>`; }
  }
  return s;
}
// Silo com teto cônico (ração, grãos).
export function silo(x, y, r, h, mat = "steel") {
  return cyl(x, y, r, 0, h, mat, { steps: 24 }) + band(x, y, r, h * 0.33) + band(x, y, r, h * 0.66) + cone(x, y, r, h, r * 0.8, mat);
}
// Torre de transmissão em treliça.
export function pylon(x, y, top = 54) {
  let s = "";
  const legs = [[-4, -4], [4, -4], [4, 4], [-4, 4]];
  for (const [a, b] of legs) s += `<path class="ln tower" d="${pathOf([[x + a, y + b, 0], [x + a * 0.25, y + b * 0.25, top]])}"/>`;
  for (let z = 8; z < top - 4; z += 10) {
    const f = 1 - (z / top) * 0.75, g = 1 - ((z + 10) / top) * 0.75;
    s += `<path class="ln tower" d="${pathOf([[x - 4 * f, y - 4 * f, z], [x + 4 * g, y + 4 * g, z + 10]])}"/><path class="ln tower" d="${pathOf([[x + 4 * f, y - 4 * f, z], [x - 4 * g, y + 4 * g, z + 10]])}"/>`;
  }
  s += `<path class="ln tower" d="${pathOf([[x - 10, y + 10, top - 6], [x + 10, y - 10, top - 6]])}"/><path class="ln tower" d="${pathOf([[x - 7, y + 7, top - 14], [x + 7, y - 7, top - 14]])}"/>`;
  for (const k of [-10, 10]) s += `<path class="ln insul" d="${pathOf([[x + k, y - k, top - 6], [x + k, y - k, top - 8.5]])}"/>`;
  return s;
}
// Painel de texto pintado no chão de uma zona (nome do lugar).
export const zoneLabel = (text, x, y, size = 9) => groundText(text, x, y, size, "gt", "x", 1.75);

// Gradientes radiais para cúpulas, esferas e cones.
export function gradients() {
  const mats = ["wall", "steel", "lima", "roofGreen", "leaf", "leafDark", "leafLight", "cloud", "euca", "eucaDark", "ipeYellow", "ipePink", "log", "green", "grassDark", "straw", "bagasse", "digestate", "amber", "lamp", "concrete", "soil", "membrane", "membraneLight", "torta", "cane"];
  let g = "";
  for (const m of mats) {
    const c = MATERIALS[m];
    g += `<radialGradient id="g-${m}" cx="38%" cy="28%" r="78%"><stop offset="0" stop-color="${mix(c, "#ffffff", 0.55)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${mix(c, "#0b1d25", 0.3)}"/></radialGradient>`;
  }
  return g;
}
