// Vida ambiente do diorama: pássaros, avião, chegadas nos bunkers, corte de um
// digestor vertical, canhão de fertirrigação com digestato e manômetros.
import { DIGESTERS } from "../scene/zones/biogas.mjs";
import { HOME } from "../scene/zones/destinos.mjs";
import { SPOTS } from "../scene/layout.mjs";

export function addLife(stage) {
  const { iso } = stage;
  const layer = document.getElementById("L-life");
  let html = "", fg = "";

  // 1) pássaros cruzando o céu
  const flock = [[0, 0], [14, 6], [-12, 8], [26, 12], [6, 16]];
  const birdSvg = (list) => `<svg viewBox="-20 -10 60 40" width="60" height="40">${list.map(([x, y], i) => `<path class="bird" style="animation-delay:-${i * 0.13}s" d="M${x - 4},${y - 1} q2,-2.6 4,0 q2,-2.6 4,0"/>`).join("")}</svg>`;
  fg += `<div class="hbirds">${birdSvg(flock)}</div><div class="hbirds b2">${birdSvg(flock.slice(0, 3))}</div>`;

  // 2) ondas de "chegada" nos bunkers, na recepção da vinhaça e no posto da cidade
  const ripple = (p, cls) => { const [x, y] = iso(p); return `<ellipse class="ripple ${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="5"/>`; };
  html += ripple(SPOTS.bunkers, "r-rec") + ripple(SPOTS.bunkers, "r-rec d") + ripple([351, 404, 3], "r-rec") + ripple([HOME.x + 20, HOME.y + 10, 2], "r-casa") + ripple([HOME.x + 20, HOME.y + 10, 2], "r-casa d");

  // 3) corte do digestor vertical: aparece ao passar o mouse ou na etapa dos digestores
  const P2 = (p) => p.map((v) => v.toFixed(1)).join(",");
  const R = SPOTS.vdR;
  const cuts = DIGESTERS.map(([cx, cy], i) => {
    const a0 = Math.atan2(1, 1), span = 0.95;
    const arc = (z, r = R + 0.3, rev = false) => { const pts = []; for (let k = 0; k <= 24; k++) { const a = a0 - span + (2 * span * k) / 24; pts.push(iso([cx + r * Math.cos(a), cy + r * Math.sin(a), z])); } return rev ? pts.reverse() : pts; };
    const win = "M" + arc(2.5).concat(arc(21, R + 0.3, true)).map(P2).join("L") + "Z";
    const liq = "M" + arc(2.5).concat(arc(15, R + 0.3, true)).map(P2).join("L") + "Z";
    const surf = "M" + arc(15).map(P2).join("L");
    let bub = "";
    for (let k = 0; k < 10; k++) { const a = a0 - span * 0.8 + (1.6 * span * ((k * 37) % 10)) / 10; const [bx, by] = iso([cx + (R - 5) * Math.cos(a), cy + (R - 5) * Math.sin(a), 4]); bub += `<circle class="cbub" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(0.8 + (k % 3) * 0.4).toFixed(1)}" style="animation-delay:-${((k * 0.41) % 2.6).toFixed(2)}s"/>`; }
    return `<g class="cutaway"><clipPath id="cut-${i}"><path d="${win}"/></clipPath>
      <g clip-path="url(#cut-${i})"><path class="cut-bg" d="${win}"/><path class="cut-liq" d="${liq}"/><path class="cut-surf" d="${surf}"/>${bub}</g>
      <path class="cut-frame" d="${win}"/></g>`;
  }).join("");
  html += cuts;

  // 4) fertirrigação: canhão de digestato molhando o canavial
  const gun = SPOTS.sprinkler;
  { const [gx, gy] = iso(gun); html += `<g class="sprinkler"><circle class="reel" cx="${gx.toFixed(1)}" cy="${(gy + 2).toFixed(1)}" r="3.4"/><g id="drops"></g></g>`; }

  // 5) manômetros na purificação e nível do tanque de CO₂
  [[636, 286, 9], [644, 286, 9]].forEach(([x, y, z], i) => { const [gx, gy] = iso([x, y, z]); html += `<circle class="gauge-face" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="2.6"/><line class="gauge-needle" x1="${gx.toFixed(1)}" y1="${gy.toFixed(1)}" x2="${gx.toFixed(1)}" y2="${(gy - 2.2).toFixed(1)}" style="transform-origin:${gx.toFixed(1)}px ${gy.toFixed(1)}px;animation-delay:-${i * 1.3}s"/>`; });
  { const [lx, ly] = iso([667, 340.6, 6]); html += `<rect class="lvl-bg" x="${(lx - 1.5).toFixed(1)}" y="${(ly - 22).toFixed(1)}" width="3" height="22" rx="1"/><rect class="lvl" x="${(lx - 1.5).toFixed(1)}" y="${(ly - 22).toFixed(1)}" width="3" height="22" rx="1" style="transform-origin:${lx.toFixed(1)}px ${ly.toFixed(1)}px"/>`; }

  // 6) avião com rastro passando sobre o campo
  fg += `<div class="hplane"><svg viewBox="-160 -10 170 20" width="170" height="20"><path class="trail" d="M-150,0 L-8,0"/><path class="plane-body" d="M0,0 l-9,-1.2 l-2,-4 l-2,0 l1,4 l-5,.4 l-1.6,-2 l-1.4,0 l.8,2.6 l-.8,2.6 l1.4,0 l1.6,-2 l5,.4 l-1,4 l2,0 l2,-4 l9,-1.2z"/></svg></div>`;
  document.getElementById("ly-world-fg").innerHTML = fg;

  layer.innerHTML = html;
  stage.refreshDash();
  const drops = layer.querySelector("#drops");
  const DROPS = 26;
  drops.innerHTML = Array.from({ length: DROPS }, () => `<circle class="drop-dig" r="1.1"/>`).join("");
  const dEls = [...drops.children];
  let lastL = 0;
  stage.onFrame((t) => {
    if (t - lastL < 1 / 30) return; lastL = t;
    // jato do canhão: liga 14 s, desliga 10 s; varre o talhão
    const on = (t % 24) < 14;
    drops.style.opacity = on ? 1 : 0;
    if (!on) return;
    const sweep = Math.sin(t * 0.5) * 0.6;
    dEls.forEach((el, k) => {
      const u = ((t * 0.9 + k / DROPS) % 1);
      const dir = Math.PI + 0.35 + sweep + ((k % 5) - 2) * 0.05;
      const reach = 70;
      const x = gun[0] + Math.cos(dir) * reach * u, y = gun[1] + Math.sin(dir) * reach * u, z = 6 + 30 * u * (1 - u) * 1.6;
      const [sx, sy] = iso([x, y, z]);
      el.setAttribute("cx", sx.toFixed(1)); el.setAttribute("cy", sy.toFixed(1));
    });
  });
}
