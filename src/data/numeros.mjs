// Números da Cocal Narandiba usados nas etapas. Cada valor guarda sua classe:
//   confirmado  · publicado por fonte primária (fornecedor, ANP, registro)
//   auditado    · valor "auditado RenovaBio" da especificação do projeto,
//                 NÃO reverificado em fonte pública
//   projeto     · plano ou capacidade anunciada, não medição
//   inferido    · leitura de imagem ou dedução nossa
// Valores conflitantes ficam lado a lado; NÃO são conciliados.
// Origem: twin_config.py e data/operational do gêmeo aikiesan/cocal_simulation.

export const INICIO_OPERACAO = "julho de 2022";

// ---------- substratos (t ou m³ por ano)
export const SUBSTRATOS = {
  vinhaca: { projeto: 1500000, auditado: 1904648.07, u: "m³/ano", fonte: ["copersucar2021", "spec"] },
  torta: { projeto: 135000, auditado: 188114.75, u: "t/ano", fonte: ["copersucar2021", "spec"] },
  palha: { projeto: 10000, auditado: null, u: "t/ano", nota: "anunciada em 2021 como potencial de expansão; uso efetivo não comprovado", fonte: ["copersucar2021"] },
  esterco: { projeto: null, auditado: 6018.36, u: "t/ano", nota: "não confirmado para Narandiba; pode ser da outra unidade da Cocal", fonte: ["spec"] },
  camaAviaria: { projeto: null, auditado: 3484.79, u: "t/ano", nota: "não confirmada para Narandiba", fonte: ["spec"] },
};
export const LESAFFRE = { desde: "junho de 2026", volume: null };

// ---------- digestores (Geo; não se sabe se o volume é útil ou geométrico)
export const DIGESTORES = { verticais: { n: 2, m3: 8000 }, horizontais: { n: 4, m3: 18000 }, total: 88000 };

// ---------- tratamento e destino do biogás
export const THIOPAQ = { nm3h: 5200, h2sEntrada: 12000, h2sSaida: 80, enxofreMin: 123, enxofreMax: 2125 };
export const SPLIT = { chp: 47, upgrading: 53 }; // plano de 2021, não medição
export const CHP = { mw: 5, mwhProjeto: 33300, mwhImprensa2022: 35000, kwhAuditado18m: 42512830 };
export const BIOMETANO = {
  capacidade: [ // capacidades publicadas, mantidas lado a lado
    { v: 25000, u: "Nm³/d", fonte: "Paques / ARSESP" },
    { v: 26000, u: "Nm³/d", fonte: "Geo" },
    { v: 27112, u: "m³/d", fonte: "ANP (autorização)" },
  ],
  biogasAnpM3d: 51600,
  projetoNm3Ano: 8900000,
  biogasProjetoNm3Ano: 33500000,
  purezaAuditada: [96.69, 98.34],
  pciAuditado: [32.46, 35.02],
};
export const CO2 = { tDia: 50, tDiaAlt: 48, tAno: 16000, empresa: "Cocal CO₂ Gases Industriais Ltda" };
export const GASODUTO = { compressores: 2, m3hCada: 970, acoKm: 51, peKm: 14.5, distribuidora: "GasBrasiliano (Necta)", cidades: ["Presidente Prudente", "Pirapozinho", "Narandiba"] };
export const DIGESTATO = { organageo: 58440, liquifertil: 1589688 };
export const CAMINHOES_BIOMETANO = 44; // previstos, compartilhados com Paraguaçu Paulista
export const CI_ETANOL = { base: 20.46, biogas: 15.01, completo: 2.69 }; // gCO₂e/MJ, Datagro via imprensa

// ---------- usina de açúcar e etanol (quase nada é publicado só para Narandiba)
export const CALDEIRA = { vaporKgH: 250000, tempC: 530, pressoes: "67 kgf/cm²(g) e 66 bar", eficienciaPci: 86.2 };
export const SUBESTACAO = { kv: "138/13,8 kV" };
export const MOAGEM_CORPORATIVA = "8,6–8,7 milhões de t (as duas unidades, safra 2023/24)";

// ---------- série mensal da ANP: biogás processado (m³/d) e uso da capacidade
// Antes de agosto de 2025 os volumes informados (0–30 m³/d) não são reais:
// lacuna de informe, não produção baixa. Uma safra só; não é um ano típico.
export const ANP = [
  { ym: "2025-08", m3d: 23913, pct: 46 },
  { ym: "2025-09", m3d: 21817, pct: 42 },
  { ym: "2025-10", m3d: 25414, pct: 49 },
  { ym: "2025-11", m3d: 23390, pct: 45 },
  { ym: "2025-12", m3d: 15438, pct: 30 },
  { ym: "2026-01", m3d: 16464, pct: 32 },
  { ym: "2026-02", m3d: 20035, pct: 39 },
  { ym: "2026-03", m3d: 18810, pct: 36 },
  { ym: "2026-04", m3d: 19087, pct: 37 },
];
// mês do relógio (0 = janeiro) -> registro da ANP daquele mês, se houver
export const anpDoMes = (m) => ANP.find((r) => Number(r.ym.slice(5)) - 1 === m) ?? null;
export const USO_SAFRA = 46; // média ago–nov 2025
export const USO_ENTRESSAFRA = 35; // média dez 2025–abr 2026
