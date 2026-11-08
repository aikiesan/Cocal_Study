// Figuras do painel: uma figura, uma mensagem.
// Sem molduras, sem eixos redundantes; cor só quando carrega informação,
// sempre com a mesma codificação do diorama (src/ui/palette.mjs).
import { icon } from "./icons.mjs";
import { STREAMS, SECTORS, NEUTRAL, INK, MUTED, CERT, KEY, toneColor, DATA_CLASS } from "./palette.mjs";

const W = 340;
const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const svg = (h, body, label) => `<svg class="fig" viewBox="0 0 ${W} ${h}" role="img" aria-label="${label || ""}">${body}</svg>`;
const shadeOf = (hex, k) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return `rgb(${c.map((v) => Math.round(v + (255 - v) * k * 0.22)).join(",")})`; };
const arrow = (x1, y1, x2, y2, cls = "arr") => `<path class="${cls}" d="M${x1},${y1} L${x2},${y2}" marker-end="url(#ah)"/>`;
const DEFS = `<defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="${MUTED}"/></marker></defs>`;
const SETOR_TAG = { agricola: "agro", pecuaria: "pec", urbano: "urb", industria: "ind" };
const node = (ic, x, y, r = 22, color, cls = "", tag) => `<g class="node ${cls}"${tag ? ` data-tag="${tag}"` : ""}><circle cx="${x}" cy="${y}" r="${r}" fill="${color ? color : "#F4F7F8"}" ${color ? `fill-opacity=".14" stroke="${color}"` : `stroke="#E2E8EB"`}/>${icon(ic, x, y, r * 1.05, color ? "ic" : "ic")}</g>`;
const label = (t, x, y, cls = "fl", anchor = "middle") => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;
function wrap(t, x, y, max = 14, cls = "fn", lh = 12) {
  const words = String(t).split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim());
  return lines.map((l, i) => label(l, x, y + i * lh, cls)).join("");
}

export const dcBadge = (k) => DATA_CLASS[k] ? `<span class="dc" style="--dc:${DATA_CLASS[k].color}">${DATA_CLASS[k].label}</span>` : "";
const F = {
  // lista de valores publicados, cada um com sua classe de dado
  facts({ rows, note }) {
    return `<div class="facts">${rows.map((r) => `<div class="fact${r.off ? " dim" : ""}"${r.tag ? ` data-tag="${r.tag}"` : ""}><div class="fact-v">${r.v}<small>${r.u ?? ""}</small></div><div class="fact-l">${r.l}${r.note ? `<em>${r.note}</em>` : ""}</div>${dcBadge(r.cls)}</div>`).join("")}</div>` + (note ? `<div class="fignote">${note}</div>` : "");
  },
  // colunas mensais (série da ANP); `hl` = mês em destaque
  monthly({ rows, max = 100, unit, hl }) {
    const n = rows.length, gw = W / n, H = 104, y0 = 18;
    let b = "", lastYear = "";
    rows.forEach((r, i) => {
      const h = (r.v / max) * H, x = i * gw + gw * 0.18, w = gw * 0.64;
      const on = hl === r.k;
      b += `<rect class="col${r.safra ? " safra" : ""}${on ? " on" : ""}" data-k="${r.k}" x="${x.toFixed(1)}" y="${(y0 + H - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="2"/>`;
      b += label(`${r.v}`, x + w / 2, y0 + H - h - 4, "fv");
      b += label(r.l, x + w / 2, y0 + H + 14, "fn");
      if (r.y !== lastYear) { lastYear = r.y; b += `<path class="refline" d="M${(i * gw).toFixed(1)},${y0 + H + 20} v8"/>` + label(r.y, i * gw + 4, y0 + H + 30, "fn strong", "start"); }
    });
    const ly = y0 + H + 46;
    b += `<rect class="col safra" x="0" y="${ly - 8}" width="9" height="9" rx="2"/>` + label("safra", 13, ly, "fn", "start") + `<rect class="col" x="58" y="${ly - 8}" width="9" height="9" rx="2"/>` + label("entressafra", 71, ly, "fn", "start");
    b += label(unit, 0, ly + 18, "fu", "start");
    return svg(ly + 24, b, unit);
  },
  chain({ steps }) {
    const n = steps.length, gap = W / n;
    let b = DEFS;
    steps.forEach((s, i) => {
      const x = gap * (i + 0.5);
      b += node(s.icon, x, 34, 22, i === n - 1 ? STREAMS.biometano.color : null, `pop d${i}`, s.tag);
      b += wrap(s.label, x, 76, 13, "fl", 13);
      if (i < n - 1) b += arrow(x + 26, 34, x + gap - 30, 34, "arr flowing");
    });
    return svg(100, b, steps.map((s) => s.label).join(" → "));
  },
  share({ parts, unit }) {
    let x = 0, b = "";
    const total = parts.reduce((a, p) => a + p.v, 0);
    const y = 46, h = 30;
    parts.forEach((p, i) => {
      const w = (p.v / total) * W;
      const c = p.tone === "neutral" ? NEUTRAL : shadeOf(toneColor(p.tone), p.shade || 0);
      b += `<rect class="grow d${i}" ${p.tone === "agricola" ? 'data-tag="agro"' : ""} x="${x}" y="${y}" width="${Math.max(0, w - 1.5)}" height="${h}" fill="${c}" rx="2"/>`;
      if (w > 34) b += label(`${fmt(p.v, 0)}%`, x + w / 2, y + h / 2 + 4, `fv ${p.tone === "neutral" ? "" : "on"}`);
      b += wrap(p.label, x + w / 2, y + h + 16, 10, "fn");
      x += w;
    });
    const cana = parts.filter((p) => p.tone === "agricola").reduce((a, p) => a + p.v, 0);
    const cw = (cana / total) * W;
    b += `<path class="brace" d="M1,${y - 8} V${y - 14} H${cw - 2} V${y - 8}"/>` + label(`Cana-de-açúcar: ${fmt(cana, 1)}%`, cw / 2, y - 20, "fk");
    b += label(unit, W / 2, y + h + 50, "fu");
    return svg(140, b, `Participação: cana ${fmt(cana, 1)}%`);
  },
  bars({ rows, highlight = [], cap = 100, unit }) {
    const lx = 112, bw = W - lx - 44, rh = 19;
    let b = "";
    rows.forEach((r, i) => {
      const y = 8 + i * rh;
      const on = highlight.includes(r.setor);
      const c = on ? SECTORS[r.setor].color : NEUTRAL;
      const w = (Math.min(r.m3, cap) / cap) * bw;
      b += `<g class="row" data-tag="${SETOR_TAG[r.setor]}"><rect class="hit" x="0" y="${y}" width="${W}" height="${rh}"/>`;
      b += label(r.nome, lx - 8, y + 11, `fn ${on ? "strong" : ""}`, "end");
      b += `<rect class="grow d${i}" x="${lx}" y="${y + 2}" width="${Math.max(1.5, w)}" height="${rh - 6}" rx="2" fill="${c}"/>`;
      if (r.m3 > cap) b += `<path class="brk" d="M${lx + w - 14},${y + 1} l5,${rh - 4} M${lx + w - 9},${y + 1} l5,${rh - 4}"/>`;
      b += label(fmt(r.m3), lx + w + 5, y + 11, "fv", "start") + "</g>";
    });
    const yl = 8 + rows.length * rh + 14;
    let lx2 = 0;
    for (const k of highlight) { b += `<rect x="${lx2}" y="${yl - 8}" width="10" height="10" rx="2" fill="${SECTORS[k].color}"/>` + label(SECTORS[k].label, lx2 + 14, yl + 1, "fn", "start"); lx2 += 84; }
    b += label(unit, 0, yl + 20, "fu", "start");
    return svg(yl + 26, b, unit);
  },
  beforeAfter({ before, after }) {
    let b = DEFS;
    [before, after].forEach((row, r) => {
      const y = 30 + r * 74;
      b += label(row.title, 0, y - 18, `fk ${r ? "good" : "bad"}`, "start");
      row.steps.forEach((s, i) => {
        const x = 40 + i * 110;
        const c = s.tone ? KEY[s.tone] : null;
        b += node(s.icon, x, y + 10, 18, c, `pop d${i + r * 3}`);
        if (s.label) b += label(s.label, x + 24, y + 14, `fl ${s.tone || ""}`, "start");
        if (i < row.steps.length - 1) b += arrow(x + 22, y + 10, x + 110 - 24, y + 10, "arr flowing");
      });
    });
    return svg(150, b, `${before.title} versus ${after.title}`);
  },
  merge({ inputs, output }) {
    let b = DEFS;
    inputs.forEach((s, i) => {
      const y = 28 + i * 64;
      b += node(s.icon, 34, y, 20, null, `pop d${i}`) + label(s.label, 62, y - 2, "fl", "start") + label(s.note, 62, y + 12, "fn", "start");
      b += `<path class="arr flowing" d="M150,${y} C200,${y} 200,60 236,60" marker-end="url(#ah)"/>`;
    });
    b += node(output.icon, 266, 60, 26, STREAMS.biometano.color, "pop d3") + label(output.label, 266, 104, "fl") + label(output.note, 266, 118, "fn");
    return svg(128, b, `${inputs.map((i) => i.label).join(" + ")} = ${output.label}`);
  },
  stages({ steps, chips }) {
    const n = steps.length, gw = W / n;
    let b = DEFS;
    const c0 = STREAMS.substrato.color, c1 = STREAMS.biometano.color;
    const lerp = (t) => { const a = [1, 3, 5].map((i) => parseInt(c0.slice(i, i + 2), 16)), z = [1, 3, 5].map((i) => parseInt(c1.slice(i, i + 2), 16)); return `rgb(${a.map((v, k) => Math.round(v + (z[k] - v) * t)).join(",")})`; };
    steps.forEach((s, i) => {
      const x = i * gw + 4, bw = gw - 22;
      b += `<rect class="pop d${i}" x="${x}" y="10" width="${bw}" height="34" rx="9" fill="${lerp(i / (n - 1))}"/>` + label(String(i + 1), x + bw / 2, 32, "fbig on");
      b += label(s, x + bw / 2, 60, "fn strong");
      if (i < n - 1) b += arrow(x + bw + 3, 27, x + gw + 1, 27, "arr");
    });
    b += label("matéria orgânica →", 4, 78, "fn", "start") + label("→ metano (CH₄)", W, 78, "fn", "end");
    chips.forEach((c, i) => { const x = 8 + i * 112; b += `<rect x="${x}" y="92" width="104" height="24" rx="12" class="chipbg"/>` + label(c, x + 52, 108, "fl"); });
    return svg(124, b, steps.join(" → "));
  },
  composition({ rows, arrow: via, note }) {
    let b = DEFS;
    const lx = 78, bw = W - lx;
    rows.forEach((r, i) => {
      const y = 12 + i * 66;
      b += label(r.label, 0, y + 20, "fk", "start");
      let x = lx;
      r.parts.forEach((p, j) => {
        const w = (p.v / 100) * bw;
        b += `<rect class="grow d${i * 2 + j}" x="${x}" y="${y}" width="${Math.max(0, w - 1.5)}" height="30" rx="2" fill="${KEY[p.k]}"/>`;
        if (w > 40) b += label(p.label ?? `${p.k === "ch4" ? "CH₄" : "CO₂"} ${p.v}%`, x + w / 2, y + 20, "fv on");
        x += w;
      });
      if (via && i < rows.length - 1) b += arrow(lx + bw * 0.3, y + 36, lx + bw * 0.3, y + 60, "arr flowing") + label(via, lx + bw * 0.3 + 8, y + 52, "fn", "start");
    });
    const h = 12 + rows.length * 66;
    if (note) b += label(note, 0, h - 14, "fu", "start");
    return svg(h, b, rows.map((r) => r.label).join(", "));
  },
  sankey({ input, outs, note }) {
    const total = outs.reduce((a, o) => a + o.v, 0), H = 120, x0 = 60, x1 = 210;
    let b = label(`${input} = 100%`, 0, 12, "fl", "start") + `<rect x="0" y="22" width="18" height="${H}" rx="3" fill="${STREAMS.biogas.color}"/>`;
    let yl = 22, yr = 18;
    outs.forEach((o, i) => {
      const h = (o.v / total) * H;
      const c = KEY[o.k];
      b += `<path class="band pop d${i}" d="M18,${yl} C${x0 + 60},${yl} ${x1 - 60},${yr} ${x1},${yr} L${x1},${yr + h} C${x1 - 60},${yr + h} ${x0 + 60},${yl + h} 18,${yl + h} Z" fill="${c}" fill-opacity=".85"/>`;
      b += label(o.txt ?? `${o.v}%`, x1 + 8, yr + h / 2 + 2, "fv", "start") + label(o.label, x1 + 58, yr + h / 2 + 2, "fl", "start");
      yl += h; yr += h + 7;
    });
    if (note) b += label(note, 0, H + 50, "fu", "start");
    return svg(H + 58, b, outs.map((o) => `${o.label} ${o.v}%`).join(", "));
  },
  fork({ input, outs }) {
    const gap = outs.length > 2 ? 54 : 68, top = 26, mid = top + ((outs.length - 1) * gap) / 2;
    let b = DEFS + node(input.icon, 34, mid, 24, null, "pop d0") + wrap(input.label, 34, mid + 40, 12, "fl");
    outs.forEach((o, i) => {
      const y = top + i * gap;
      b += `<path class="arr flowing" d="M62,${mid} C100,${mid} 100,${y} 140,${y}" marker-end="url(#ah)"/>`;
      b += node(o.icon, 166, y, 20, STREAMS.biometano.color, `pop d${i + 1}`, o.tag) + label(o.label, 194, y - 2, "fl strong", "start") + wrap(o.note, 194, y + 13, 24, "fn start", 12).replaceAll('text-anchor="middle"', 'text-anchor="start"');
    });
    return svg(top + (outs.length - 1) * gap + 50, b, `${input.label}: ${outs.map((o) => o.label).join(", ")}`);
  },
  cycle({ steps, chips, kpis, kpiNote }) {
    const cx = W / 2, cy = 92, r = 64;
    let b = DEFS + `<circle class="ring flowing" cx="${cx}" cy="${cy}" r="${r}"/>`;
    steps.forEach((s, i) => {
      const a = -Math.PI / 2 + (i / steps.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      b += node(s.icon, x, y, 19, i === steps.length - 1 ? STREAMS.digestato.color : null, `pop d${i}`);
      const lx = x + (Math.cos(a) >= 0.3 ? 26 : Math.cos(a) <= -0.3 ? -26 : 0), ly = y + (Math.abs(Math.cos(a)) < 0.3 ? (Math.sin(a) < 0 ? -26 : 34) : 4);
      b += label(s.label, lx, ly, "fl", Math.cos(a) >= 0.3 ? "start" : Math.cos(a) <= -0.3 ? "end" : "middle");
    });
    chips.forEach((c, i) => { b += `<circle cx="${cx - 24 + i * 24}" cy="${cy}" r="10" fill="${STREAMS.digestato.color}"/>` + label(c, cx - 24 + i * 24, cy + 4, "fv on"); });
    let html = svg(190, b, steps.map((s) => s.label).join(" → "));
    if (kpis) html += `<div class="kpis">${kpis.map((k) => `<div class="kpi" style="--k:${STREAMS.digestato.color}"><div class="kv">${k.v}</div><div class="kl">${k.l}</div></div>`).join("")}</div>` + (kpiNote ? `<div class="fignote">${kpiNote}</div>` : "");
    return html;
  },
  flowCert({ steps, kpis, color }) {
    const c = CERT[color];
    const n = steps.length, gw = W / n;
    let b = DEFS;
    steps.forEach((s, i) => {
      const x = gw * (i + 0.5);
      b += node(s.icon, x, 26, 20, i === 1 ? c : null, `pop d${i}`, s.tag);
      const nl = Math.ceil(s.label.length / 11);
      b += wrap(s.label, x, 62, 11, "fl", 12);
      if (s.note) b += wrap(s.note, x, 62 + 12 * nl + 2, 14, "fn", 11);
      if (i < n - 1) b += arrow(x + 24, 26, x + gw - 26, 26, "arr flowing");
    });
    let html = svg(132, b, steps.map((s) => s.label).join(" → "));
    html += `<div class="kpis">${kpis.map((k) => `<div class="kpi" style="--k:${c}"><div class="kv">${k.v}</div><div class="kl">${k.l}</div>${k.gauge ? gauge(k.gauge, c) : ""}${k.sub ? `<div class="ks">${k.sub}</div>` : ""}</div>`).join("")}</div>`;
    return html;
  },
  twoCols({ cols, steps = [], markets = [] }) {
    let html = `<div class="cols">${cols.map((c) => `<div class="col"${c.tag ? ` data-tag="${c.tag}"` : ""}><svg viewBox="0 0 48 48" class="colic">${icon(c.icon, 24, 24, 34, "ic")}</svg><div class="ct">${c.title}</div><div class="cn">${c.note}</div></div>`).join("")}</div>`;
    let b = DEFS; const gw = W / steps.length;
    steps.forEach((s, i) => { const x = gw * (i + 0.5); b += `<circle class="pop d${i}" cx="${x}" cy="14" r="8" fill="${i === steps.length - 1 ? CERT.carbono : NEUTRAL}"/>` + label(String(i + 1), x, 18, "fv on") + wrap(s, x, 40, 13, "fn", 11); if (i < steps.length - 1) b += arrow(x + 11, 14, x + gw - 12, 14, "arr flowing"); });
    if (steps.length) html += svg(64, b, steps.join(" → "));
    if (markets.length) html += `<div class="markets">${markets.map((m) => `<span>${m}</span>`).join("")}</div>`;
    return html;
  },
  hub({ center, nodes, outputs }) {
    const cx = W / 2, cy = 34, gw = W / nodes.length;
    let b = "";
    nodes.forEach((n, i) => {
      const x = gw * (i + 0.5), y = 112;
      b += `<path class="link flowing" d="M${cx},${cy} Q${(cx + x) / 2},${y - 10} ${x},${y - 20}" stroke="${STREAMS.conhecimento.color}"/>`;
      b += node(n.icon, x, y, 19, null, `pop d${i + 1}`) + wrap(n.label, x, y + 34, 15, "fl", 12);
    });
    b += `<circle class="pop d0" cx="${cx}" cy="${cy}" r="28" fill="${STREAMS.conhecimento.color}"/>` + label(center, cx, cy + 5, "fbig on");
    let html = svg(176, b, `${center} conecta ${nodes.map((n) => n.label).join(", ")}`);
    html += `<div class="markets">${outputs.map((m) => `<span>${m}</span>`).join("")}</div>`;
    return html;
  },
  compare({ rows, unit, ratioLabel }) {
    const lx = 0, bw = W - 60, max = Math.max(...rows.map((r) => r.hi ?? r.v));
    let b = "";
    rows.forEach((r, i) => {
      const y = 24 + i * 58;
      const w = Math.max(3, (r.v / max) * bw);
      b += label(r.label, 0, y - 6, "fl", "start");
      b += `<rect class="grow d${i}" x="${lx}" y="${y}" width="${w}" height="24" rx="3" fill="${toneColor(r.tone)}"/>`;
      if (r.lo) b += `<path class="whisk" d="M${(r.lo / max) * bw},${y + 12} H${(r.hi / max) * bw} M${(r.lo / max) * bw},${y + 6} v12 M${(r.hi / max) * bw},${y + 6} v12"/>`;
      b += label((r.prefix ?? "") + fmt(r.v, r.v >= 20 ? 0 : 1).replace(/,0$/, ""), w + 6 + (r.hi ? ((r.hi - r.v) / max) * bw : 0), y + 17, "fbig", "start");
    });
    const big = ratioLabel ?? `≈ ${Math.round(rows[0].v / rows[1].v)}×`;
    b += label(big, bw * 0.5, 146, "fhuge") + label(unit, W, 166, "fu", "end");
    return svg(172, b, `${rows[0].label}: ${fmt(rows[0].v, 1)}; ${rows[1].label}: ${fmt(rows[1].v, 1)}`);
  },
};

function gauge({ v, legal, max }, c) {
  const p = (x) => `${(x / max) * 100}%`;
  return `<div class="gauge"><div class="gfill" style="width:${p(v)};background:${c}"></div><div class="gmark" style="left:${p(legal)}" title="meta legal: ${legal}%"></div></div><div class="gaxis"><span>0%</span><span>lei: ${legal}%</span><span>${max}%</span></div>`;
}

export function renderFigure(spec) {
  const f = F[spec.type];
  return f ? `<figure class="figure fig-${spec.type}">${f(spec)}</figure>` : "";
}
