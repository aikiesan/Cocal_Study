// Painel lateral: índice das etapas (visão geral) e página de cada etapa.
import { renderFigure, dcBadge } from "./figures.mjs";
import { STREAMS } from "./palette.mjs";
import { FONTES } from "../data/fontes.mjs";

export function renderIndex(stops, chapters) {
  const groups = chapters.map((c) => {
    const items = stops.filter((s) => s.chapter === c.id).map((s) => `<li><button type="button" class="idx" data-go="${s.id}"><span class="num ${s.badge ? "hex" : ""}">${s.badge ? s.badge.tag : s.n}</span><span><b>${s.kicker}</b><small>${s.message}</small></span></button></li>`).join("");
    return `<section class="chapter"><h3>${c.label}</h3><ol>${items}</ol></section>`;
  }).join("");
  return `<div class="home">
    <p class="eyebrow">Estudo de caso · CP2b</p>
    <h2>Como a Cocal Narandiba transforma resíduos da cana em biometano, energia, CO₂ e adubo.</h2>
    <p class="lede">Toque num número no mapa ou escolha uma etapa abaixo. Cada etapa traz uma mensagem, uma figura e a classe de cada número: <b>confirmado</b>, <b>projeto</b>, <b>auditado*</b> ou <b>inferido</b>.</p>
    <p class="lede small">Diorama esquemático feito a partir de fontes públicas e de um gêmeo digital montado sobre imagens de satélite. Não é material da empresa. *Valores "auditados" vêm da especificação do projeto e não foram reverificados.</p>
    <button type="button" class="cta-tour" data-tour>▶ Começar o tour guiado</button>
    ${groups}
  </div>`;
}

export function renderStop(stop, { index, total, inTour }) {
  const streams = stop.streams && stop.streams !== "all" ? `<div class="tags">${stop.streams.map((k) => `<span class="tag"><i style="background:${STREAMS[k].color}"></i>${STREAMS[k].label}</span>`).join("")}</div>` : "";
  const more = stop.more ? `<details class="more"><summary>Saiba mais</summary>${stop.more.map((p) => `<p>${p}</p>`).join("")}</details>` : "";
  const src = stop.sources ? `<details class="sources"><summary>Fontes</summary><ul>${stop.sources.map((id) => FONTES[id]).filter(Boolean).map((f) => (f.u ? `<li><a href="${f.u}" target="_blank" rel="noopener">${f.t}</a></li>` : `<li>${f.t}</li>`)).join("")}</ul></details>` : "";
  const back = inTour ? "" : `<button type="button" class="back" data-home>‹ Todas as etapas</button>`;
  return `${back}
    <div class="kicker">${stop.n ? `<span class="num ${stop.badge ? "hex" : ""}">${stop.badge ? stop.badge.tag : stop.n}</span>` : ""}${stop.kicker}${inTour ? `<span class="count">${index + 1}/${total}</span>` : ""}</div>
    <h2>${stop.message}</h2>
    ${stop.dc ? `<div class="dcs">${stop.dc.map(dcBadge).join("")}</div>` : ""}
    ${renderFigure(stop.figure)}
    ${stop.text.map((p) => `<p>${p}</p>`).join("")}
    ${streams}
    ${stop.link ? `<a class="cta" href="${stop.link.href}" target="_blank" rel="noopener">${stop.link.label}</a>` : ""}
    ${more}${src}`;
}

export function renderLegend() {
  return `<div class="legend-title">Fluxos <small>toque para ocultar</small></div><div class="chips">${Object.entries(STREAMS).map(([k, s]) => `<button type="button" class="chip" data-stream="${k}" aria-pressed="true"><i style="background:${s.color}"></i>${s.label}</button>`).join("")}</div>`;
}
