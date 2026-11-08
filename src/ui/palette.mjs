// Codificação de cores ÚNICA para o diorama e todas as figuras.
// Os nomes seguem as cores de tubulação do gêmeo digital (Substrato ocre,
// Biogás âmbar, Dessulfurizado amarelo, Biometano ciano, CO₂ esmeralda,
// Eletricidade laranja, Digestato verde-escuro), com tons ajustados para
// leitura sobre fundo claro.
export const STREAMS = {
  vinhaca: { label: "Vinhaça", color: "#7A4A2A" },
  substrato: { label: "Torta, palha e resíduos", color: "#B7791F" },
  biogas: { label: "Biogás bruto", color: "#F0A202" },
  dessulf: { label: "Biogás dessulfurizado", color: "#D9C400" },
  biometano: { label: "Biometano", color: "#0097B2" },
  co2: { label: "CO₂ verde", color: "#1F9D55" },
  eletricidade: { label: "Eletricidade", color: "#E4572E" },
  digestato: { label: "Digestato", color: "#1B5E20" },
};
export const SECTORS = {
  agricola: { label: "Agrícola", color: "#5CA032" },
  industria: { label: "Indústria", color: "#54666E" },
};
export const NEUTRAL = "#C9D2D6";
export const INK = "#1E3E4C";
export const MUTED = "#54666E";
export const CERT = {};
// classes de dado (mesmas do gêmeo digital): cor e rótulo curto
export const DATA_CLASS = {
  confirmado: { label: "Confirmado", color: "#1E6E4E" },
  auditado: { label: "Auditado*", color: "#6A3FA0" },
  projeto: { label: "Projeto", color: "#B26B00" },
  inferido: { label: "Inferido", color: "#7D8C93" },
  esquematico: { label: "Esquemático", color: "#9AAAB2" },
};
// cores por chave usada nas figuras
export const KEY = {
  ch4: STREAMS.biometano.color, co2: STREAMS.co2.color, eletricidade: STREAMS.eletricidade.color,
  biogas: STREAMS.biogas.color, perdas: NEUTRAL, biometano: STREAMS.biometano.color, neutral: NEUTRAL,
  good: STREAMS.co2.color, bad: STREAMS.eletricidade.color, vinhaca: STREAMS.vinhaca.color,
  substrato: STREAMS.substrato.color, digestato: STREAMS.digestato.color, h2s: "#C9A400",
};
export const toneColor = (t) => SECTORS[t]?.color ?? STREAMS[t]?.color ?? KEY[t] ?? NEUTRAL;
