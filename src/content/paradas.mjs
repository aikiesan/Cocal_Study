// Etapas da história. Princípio: UMA FIGURA, UMA MENSAGEM.
// - message: a frase que a figura prova (título do painel)
// - figure:  especificação da figura (src/ui/figures.mjs)
// - text:    no máximo 2 frases curtas de apoio · more: detalhes recolhidos
// - dc:      classes de dado presentes na etapa
// - tags:    zonas destacadas no diorama · streams: fluxos em evidência
// - anchor:  posição do pino (mundo) · focus: enquadramento do tour
//
// buildStops(modo) monta as etapas no modo "projeto" (valores nominais e
// anunciados) ou "auditado" (valores RenovaBio da especificação do projeto,
// não reverificados). Valores conflitantes ficam lado a lado.
import { SUBSTRATOS as SB, LESAFFRE, DIGESTORES, THIOPAQ, SPLIT, CHP, BIOMETANO, CO2, GASODUTO, DIGESTATO, CI_ETANOL, CALDEIRA, SUBESTACAO, MOAGEM_CORPORATIVA, ANP, USO_SAFRA, USO_ENTRESSAFRA, INICIO_OPERACAO, CAMINHOES_BIOMETANO } from "../data/numeros.mjs";

const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const CHAPTERS = [
  { id: "origem", label: "Origem dos resíduos" },
  { id: "usina", label: "Dentro da usina de biogás" },
  { id: "destino", label: "Destinos e retorno ao campo" },
  { id: "dados", label: "Safra e dados" },
];

// valor de um substrato no modo escolhido
function sub(key, modo) {
  const s = SB[key], v = s[modo];
  return v == null ? { v: "—", off: true } : { v: fmt(v), off: false };
}

export function buildStops(modo = "projeto") {
  const AUD = modo === "auditado";
  const cls = AUD ? "auditado" : "projeto";
  const stops = [
    {
      id: "intro", chapter: null, tourOnly: true,
      kicker: "Cocal Narandiba (SP)",
      message: "Da cana ao gás: o que sobra da usina vira combustível.",
      figure: { type: "chain", steps: [{ icon: "leaf", label: "Canavial", tag: "cana" }, { icon: "factory", label: "Açúcar e etanol", tag: "moenda" }, { icon: "tank", label: "Biodigestores", tag: "horizontais" }, { icon: "pipe", label: "Biometano, energia, CO₂ e adubo", tag: "citygate" }] },
      text: [`A usina de biogás opera desde ${INICIO_OPERACAO}, a cerca de 1,3 km da usina de açúcar e etanol, no Oeste Paulista. Siga os resíduos do campo até as cidades e de volta à lavoura.`],
      more: ["As posições no mapa são simplificadas a partir de um gêmeo digital montado sobre imagens de satélite. Onde nenhuma fonte pública localiza um equipamento, ele aparece num lugar esquemático, e a etapa avisa."],
      sources: ["gemeo", "copersucar2021"], focus: "all", streams: "all", dc: ["confirmado", "esquematico"],
    },

    // ---------------- ORIGEM
    {
      id: "cana", chapter: "origem", kicker: "Canavial",
      message: "Tudo começa na cana: colhida de abril a novembro, moída na usina vizinha.",
      figure: { type: "chain", steps: [{ icon: "sprout", label: "Plantio e crescimento", tag: "cana" }, { icon: "truck", label: "Colheita e transporte", tag: "cana" }, { icon: "factory", label: "Moagem", tag: "moenda" }] },
      text: ["A colheita no Centro-Sul vai de abril a novembro. Na entressafra, a cana cresce e a moenda para, e com ela boa parte dos resíduos."],
      more: [`A moagem de Narandiba não é publicada separadamente. O número público é corporativo: ${MOAGEM_CORPORATIVA}.`, "No mapa, o relógio passa pelos meses: na entressafra, colhedoras e caminhões de cana somem."],
      tags: ["cana", "lavoura"], streams: [], anchor: [135, 200, 16], focus: [0, 0, 300, 470], sources: ["cocal3T24"], dc: ["confirmado", "esquematico"],
    },
    {
      id: "moenda", chapter: "origem", kicker: "Usina de açúcar e etanol",
      message: "A moagem rende açúcar e etanol, e três resíduos com destino certo.",
      figure: { type: "fork", input: { icon: "factory", label: "Cana moída" }, outs: [
        { icon: "flame", label: "Bagaço", note: "queima na caldeira: vapor e eletricidade", tag: "caldeira" },
        { icon: "drop", label: "Vinhaça", note: "sobra da destilação; vai ao biodigestor", tag: "vinhaca" },
        { icon: "waste", label: "Torta de filtro", note: "lodo da clarificação do caldo; vai ao biodigestor", tag: "torta" }] },
      text: ["Na maioria das usinas, a vinhaça vai direto para a fertirrigação. Aqui ela passa antes pelos biodigestores, e o que sai deles volta ao campo."],
      more: ["Produção de açúcar, de etanol, mix e volumes de vinhaça e torta não são publicados só para Narandiba. O OpenStreetMap chama o complexo de \"Usina Cocal Unidade Narandiba\"."],
      tags: ["moenda", "destilaria", "patio"], streams: ["vinhaca", "substrato"], anchor: [520, 560, 34], focus: [330, 500, 810, 920], sources: ["osm", "cocalRS2526"], dc: ["confirmado", "esquematico"],
    },
    {
      id: "caldeira", chapter: "origem", kicker: "Bagaço e caldeira",
      message: "O bagaço queima na caldeira e move a casa de força da usina.",
      figure: { type: "facts", rows: [
        { v: fmt(CALDEIRA.vaporKgH / 1000), u: "t/h de vapor", l: "vazão máxima nominal da caldeira a bagaço", cls: "projeto" },
        { v: `${CALDEIRA.tempC} °C`, u: "vapor superaquecido", l: `pressão publicada como ${CALDEIRA.pressoes}`, note: "os dois valores aparecem na mesma ficha e não são conciliados", cls: "projeto" },
        { v: `${fmt(CALDEIRA.eficienciaPci, 1)}%`, u: "PCI", l: "eficiência térmica de projeto", cls: "projeto" }] },
      text: ["São números de especificação do equipamento, não produção medida. A casa de força (\"Cocal-II Power Station\" no OpenStreetMap) entrega energia à subestação."],
      tags: ["caldeira"], streams: ["substrato", "eletricidade"], anchor: [607, 543, 60], focus: [560, 500, 810, 700], sources: ["hpb", "osm"], dc: ["projeto"],
    },
    {
      id: "vinhaca", chapter: "origem", kicker: "Vinhaça",
      message: "A vinhaça é o maior volume que entra nos biodigestores.",
      figure: { type: "facts", rows: [
        { v: fmt(SB.vinhaca.projeto), u: "m³/ano", l: "vinhaça anunciada em 2021", note: "plano; a base de tempo não é clara", cls: "projeto", off: AUD },
        { v: fmt(SB.vinhaca.auditado), u: "m³/ano", l: "vinhaça \"auditada\" (RenovaBio)", note: "da especificação do projeto, não reverificada", cls: "auditado", off: !AUD }] },
      text: ["Dois canais de vinhaça aparecem no OpenStreetMap entre a usina de açúcar e a de biogás. Como a vinhaça chega e é armazenada não é publicado: o canal e o tanque pulmão do mapa são esquemáticos."],
      more: ["Vinhaça é o líquido que sobra da destilação do etanol: cerca de 10 a 15 litros por litro de etanol, segundo a literatura, rico em potássio e em matéria orgânica que os microrganismos convertem em metano."],
      tags: ["vinhaca"], streams: ["vinhaca"], anchor: [378, 600, 20], focus: [330, 280, 500, 720], sources: ["copersucar2021", "spec", "osm"], dc: [cls, "esquematico"],
    },
    {
      id: "torta", chapter: "origem", kicker: "Torta de filtro",
      message: "A torta de filtro chega de caminhão e espera nos bunkers.",
      figure: { type: "facts", rows: [
        { v: fmt(SB.torta.projeto), u: "t/ano", l: "torta anunciada em 2021", note: "plano", cls: "projeto", off: AUD },
        { v: fmt(SB.torta.auditado, 0), u: "t/ano", l: "torta \"auditada\" (RenovaBio)", note: "da especificação do projeto, não reverificada", cls: "auditado", off: !AUD },
        { v: fmt(SB.palha.projeto), u: "t/ano", l: "palha (potencial de expansão em 2021)", note: SB.palha.nota, cls: "projeto", off: AUD }] },
      text: ["A torta é o lodo que sai do filtro rotativo na clarificação do caldo. Os bunkers de concreto ficam a nordeste da usina de biogás, e uma esteira inclinada leva o material até o vão entre os digestores verticais."],
      tags: ["torta", "bunkers", "palha"], streams: ["substrato"], anchor: [686, 70, 16], focus: [430, 0, 730, 700], sources: ["copersucar2021", "spec", "gemeo"], dc: [cls, "inferido"],
    },
    {
      id: "lesaffre", chapter: "origem", kicker: "Lesaffre (vizinha)",
      message: `Desde ${LESAFFRE.desde}, a vizinha Lesaffre também manda sua vinhaça.`,
      figure: { type: "merge", inputs: [{ icon: "factory", label: "Cocal", note: "vinhaça e torta" }, { icon: "factory", label: "Lesaffre", note: "vinhaça (volume não publicado)" }], output: { icon: "tank", label: "biodigestores", note: "mais resíduo tratado" } },
      text: ["O relatório de sustentabilidade 2025/26 da Cocal diz que a vinhaça da planta vizinha da Lesaffre passa a ser tratada nos biodigestores. O volume e o meio de transporte não são publicados."],
      more: ["No mapa, a Lesaffre e o caminhão-tanque são esquemáticos: não se sabe onde fica a planta em relação ao complexo nem se a vinhaça vem por caminhão ou por tubo."],
      tags: ["lesaffre"], streams: ["vinhaca"], anchor: [960, 780, 30], focus: [820, 640, 1110, 930], sources: ["cocalRS2526"], dc: ["confirmado", "esquematico"],
    },
    {
      id: "parceiros", chapter: "origem", kicker: "Resíduos de parceiros",
      message: AUD ? "A especificação lista esterco e cama de frango, mas Narandiba não os confirma." : "Resíduos orgânicos de parceiros completam a mistura.",
      figure: { type: "facts", rows: [
        { v: "s/ volume", u: "", l: "resíduos orgânicos de parceiros", note: "citados no relatório 2025/26, sem quantidade", cls: "confirmado" },
        { ...sub("esterco", modo), u: "t/ano", l: "esterco bovino", note: SB.esterco.nota, cls: "auditado" },
        { ...sub("camaAviaria", modo), u: "t/ano", l: "cama de frango", note: SB.camaAviaria.nota, cls: "auditado" }] },
      text: ["A imprensa diz que a Cocal leva esterco para manter os digestores no ano todo, mas sem confirmar se é em Narandiba ou em Paraguaçu Paulista. O galpão e o pátio de \"parceiros\" do mapa são ilustrativos."],
      tags: ["parceiros"], streams: ["substrato"], anchor: [872, 60, 22], focus: [780, 0, 1110, 220], sources: ["cocalRS2526", "spec"], dc: ["confirmado", "auditado", "esquematico"],
    },

    // ---------------- USINA
    {
      id: "digestores", chapter: "usina", kicker: "Seis biodigestores",
      message: `Dois verticais e quatro horizontais somam ${fmt(DIGESTORES.total)} m³.`,
      figure: { type: "facts", rows: [
        { v: `${DIGESTORES.verticais.n} × ${fmt(DIGESTORES.verticais.m3)}`, u: "m³", l: "digestores verticais de concreto, teto plano", tag: "verticais", cls: "confirmado" },
        { v: `${DIGESTORES.horizontais.n} × ${fmt(DIGESTORES.horizontais.m3)}`, u: "m³", l: "digestores horizontais com membrana", tag: "horizontais", cls: "confirmado" }],
        note: "Volumes do fornecedor (Geo); não se diz se são úteis ou geométricos. Nenhum fluxograma público confirma operação em série ou em paralelo." },
      text: ["Sem oxigênio, microrganismos decompõem a matéria orgânica em quatro fases (hidrólise, acidogênese, acetogênese e metanogênese) e liberam biogás: metano e CO₂."],
      more: ["Temperatura, tempo de retenção, carga orgânica e aquecimento não são publicados. A especificação fala em CSTR para os verticais e em fluxo pistonado ou lagoa coberta para os horizontais; as fontes públicas dizem só \"verticais\" e \"horizontais\".", "No gêmeo digital, os verticais medidos na imagem dariam cerca de 10.000 m³ brutos cada, acima dos 8.000 publicados. A diferença não foi resolvida."],
      tags: ["verticais", "horizontais"], streams: ["vinhaca", "substrato", "biogas"], anchor: [500, 120, 34], focus: [330, 0, 730, 260], sources: ["geo", "gemeo"], dc: ["confirmado", "inferido"],
    },
    {
      id: "cupula", chapter: "usina", kicker: "Cúpula",
      message: "O biogás se junta sob uma cúpula de membrana, provavelmente um gasômetro.",
      figure: { type: "composition", rows: [{ label: "Biogás", parts: [{ k: "ch4", v: 60, label: "CH₄ ≈ 52–72%" }, { k: "co2", v: 40, label: "CO₂" }] }], note: "Faixa típica da literatura; a composição do biogás de Narandiba não é publicada." },
      text: ["A cúpula aparece nas imagens e nas fotos do fornecedor, entre os digestores. Nenhuma fonte diz o que ela é nem qual sua capacidade: a função de gasômetro é inferida."],
      tags: ["cupula"], streams: ["biogas"], anchor: [560, 178, 24], focus: [480, 100, 680, 280], sources: ["gemeo", "geo"], dc: ["inferido"],
    },
    {
      id: "thiopaq", chapter: "usina", kicker: "Dessulfurização (THIOPAQ)",
      message: `Bactérias tiram o enxofre: de ${fmt(THIOPAQ.h2sEntrada)} para menos de ${THIOPAQ.h2sSaida} ppm de H₂S.`,
      figure: { type: "compare", unit: "ppmV de H₂S no biogás (Paques)", ratioLabel: "−99%", rows: [
        { label: "Entrada", v: THIOPAQ.h2sEntrada, tone: "h2s" }, { label: "Saída", v: THIOPAQ.h2sSaida, tone: "dessulf", prefix: "< " }] },
      text: [`O sistema da Paques trata ${fmt(THIOPAQ.nm3h)} Nm³/h de biogás e recupera de ${THIOPAQ.enxofreMin} a ${fmt(THIOPAQ.enxofreMax)} kg de enxofre por dia, que pode virar componente de fertilizante.`],
      more: ["São valores do fornecedor, sem período de medição nem método. A fonte não diz se 5.200 Nm³/h é vazão nominal, máxima, média ou medida.", "A posição do THIOPAQ no mapa é esquemática; no gêmeo digital há apenas candidatos na imagem."],
      tags: ["thiopaq"], streams: ["biogas", "dessulf"], anchor: [636, 205, 40], focus: [560, 140, 730, 300], sources: ["paques"], dc: ["confirmado", "esquematico"],
    },
    {
      id: "split", chapter: "usina", kicker: "Para onde vai o biogás",
      message: "O plano: quase metade vira eletricidade, a outra metade, biometano.",
      figure: { type: "sankey", input: "Biogás", outs: [{ k: "eletricidade", v: SPLIT.chp, label: "motores (CHP)" }, { k: "biometano", v: SPLIT.upgrading, label: "purificação" }], note: "Divisão de projeto (2021), não medida. Nada se publica sobre o flare." },
      text: [`O projeto anunciado em 2021 previa ${fmt(BIOMETANO.biogasProjetoNm3Ano / 1e6, 1)} milhões de Nm³ de biogás por ano. A divisão real entre motores, purificação e flare não é publicada.`],
      tags: ["chp", "upgrading", "flare"], streams: ["dessulf"], anchor: [600, 236, 20], focus: [480, 180, 730, 440], sources: ["copersucar2021"], dc: ["projeto"],
    },
    {
      id: "chp", chapter: "usina", kicker: "Motogeradores (CHP)",
      message: "Motores de 5 MW queimam biogás e exportam toda a energia.",
      figure: { type: "facts", rows: [
        { v: `${CHP.mw} MW`, u: "instalados", l: "potência elétrica dos motogeradores", cls: "confirmado" },
        { v: fmt(CHP.mwhProjeto), u: "MWh/ano", l: "exportação \"até\" anunciada em 2021", cls: "projeto", off: AUD },
        { v: fmt(CHP.mwhImprensa2022), u: "MWh/ano", l: "\"até\", em notícia de 2022", note: "escopos e datas diferentes; não conciliados", cls: "projeto", off: AUD },
        { v: fmt(CHP.kwhAuditado18m / 1e6, 1), u: "GWh em 18 meses", l: "energia comercializada \"auditada\"", note: "da especificação do projeto, não reverificada", cls: "auditado", off: !AUD }] },
      text: ["A Paques diz que a energia é exportada integralmente. No mapa, ela segue por linha aérea até a subestação de 138 kV da usina de açúcar; esse caminho é inferido."],
      tags: ["chp"], streams: ["dessulf", "eletricidade"], anchor: [558, 253, 30], focus: [480, 200, 760, 340], sources: ["paques", "copersucar2021", "novacana2022", "spec"], dc: ["confirmado", cls, "esquematico"],
    },
    {
      id: "upgrading", chapter: "usina", kicker: "Purificação (upgrading)",
      message: AUD ? "O biometano sai com 96,7% a 98,3% de metano." : "A purificação separa o CO₂ e entrega biometano.",
      figure: { type: "composition", arrow: "purificação", rows: [
        { label: "Biogás", parts: [{ k: "ch4", v: 60, label: "CH₄ ≈ 60%" }, { k: "co2", v: 40, label: "CO₂" }] },
        { label: "Biometano", parts: [{ k: "ch4", v: AUD ? 97.5 : 96, label: AUD ? "CH₄ 96,7–98,3%" : "CH₄ ≥ 90% (especificação ANP)" }, { k: "co2", v: AUD ? 2.5 : 4, label: "" }] }],
        note: AUD ? `Pureza e PCI (${fmt(BIOMETANO.pciAuditado[0], 2)}–${fmt(BIOMETANO.pciAuditado[1], 2)} MJ/Nm³) "auditados" da especificação do projeto, não reverificados.` : "Biogás com composição típica da literatura. A tecnologia de purificação de Narandiba não é publicada." },
      text: ["A ANP autoriza a usina a processar até 51.600 m³ de biogás por dia. A capacidade de biometano tem três números publicados, que não batem entre si (veja a etapa \"Números que não batem\")."],
      tags: ["upgrading"], streams: ["dessulf", "biometano", "co2"], anchor: [664, 267, 34], focus: [560, 200, 730, 380], sources: ["anp", "spec"], dc: AUD ? ["auditado", "esquematico"] : ["confirmado", "esquematico"],
    },
    {
      id: "co2", chapter: "usina", kicker: "CO₂ verde",
      message: `O CO₂ separado é liquefeito: até ${CO2.tDia} t por dia de CO₂ verde.`,
      figure: { type: "facts", rows: [
        { v: `${CO2.tDia} t/d`, u: "capacidade", l: "segundo a Geo", cls: "projeto" },
        { v: `${CO2.tDiaAlt} t/d`, u: "capacidade", l: "segundo a AgFeed (out. 2023)", cls: "projeto" },
        { v: fmt(CO2.tAno), u: "t/ano", l: `CO₂ verde, por ${CO2.empresa}`, note: "valor da especificação do projeto", cls: "projeto" }] },
      text: ["É CO₂ biogênico: veio do ar, capturado pela cana. Vira insumo para bebidas, alimentos e gases industriais, no lugar de CO₂ de origem fóssil."],
      more: ["Os clientes e o transporte (caminhões-tanque no mapa) são ilustrativos. A posição da liquefação também é esquemática."],
      tags: ["co2", "clientes"], streams: ["co2"], anchor: [680, 332, 40], focus: [600, 280, 740, 440], sources: ["geo", "agfeed", "spec"], dc: ["projeto", "esquematico"],
    },
    {
      id: "compressao", chapter: "usina", kicker: "Compressão",
      message: `Dois compressores de ${fmt(GASODUTO.m3hCada)} m³/h empurram o biometano para o gasoduto.`,
      figure: { type: "chain", steps: [{ icon: "gauge", label: "Medição e odorização", tag: "compressao" }, { icon: "pipe", label: `${GASODUTO.compressores} × ${fmt(GASODUTO.m3hCada)} m³/h`, tag: "compressao" }, { icon: "city", label: "Gasoduto", tag: "citygate" }] },
      text: ["Os compressores constam de boletim da ANP de 2023. Sua posição na usina, e a de um flare de segurança, não são publicadas: no mapa ficam em lugares esquemáticos."],
      tags: ["compressao", "flare"], streams: ["biometano"], anchor: [588, 331, 22], focus: [540, 280, 740, 440], sources: ["anp"], dc: ["confirmado", "esquematico"],
    },

    // ---------------- DESTINO
    {
      id: "gasoduto", chapter: "destino", kicker: "Gasoduto e cidades",
      message: `${GASODUTO.acoKm} km de gasoduto levam o biometano até Presidente Prudente.`,
      figure: { type: "chain", steps: [{ icon: "tank", label: "Usina", tag: "compressao" }, { icon: "pipe", label: `${GASODUTO.acoKm} km em aço`, tag: "citygate" }, { icon: "city", label: `${fmt(GASODUTO.peKm, 1)} km de rede urbana`, tag: "prudente" }, { icon: "house", label: "Casas, indústrias e postos", tag: "prudente" }] },
      text: [`A ${GASODUTO.distribuidora} distribui o gás em ${GASODUTO.cidades.join(", ")}. Em linha reta, Presidente Prudente fica a cerca de 46 km, ao norte-nordeste da usina.`],
      more: ["As extensões da rede vêm de pesquisa ainda não reverificada. No mapa, as cidades estão comprimidas e fora de escala.", `Há ainda ${CAMINHOES_BIOMETANO} caminhões movidos a biometano previstos para o transporte de vinhaça, divididos entre Narandiba e Paraguaçu Paulista.`],
      tags: ["citygate", "prudente", "pirapozinho", "narandiba"], streams: ["biometano"], anchor: [763, -133, 20], focus: [330, -300, 1110, 460], sources: ["anp", "novacana2026"], dc: ["confirmado", "esquematico"],
    },
    {
      id: "eletricidade", chapter: "destino", kicker: "Subestação 138 kV",
      message: "A energia do biogás e do bagaço sai pela subestação de 138 kV.",
      figure: { type: "chain", steps: [{ icon: "flame", label: "Motores do biogás", tag: "chp" }, { icon: "factory", label: "Casa de força (bagaço)", tag: "caldeira" }, { icon: "gauge", label: `Subestação ${SUBESTACAO.kv}`, tag: "subestacao" }, { icon: "city", label: "Rede elétrica (SIN)", tag: "subestacao" }] },
      text: ["O OpenStreetMap registra a subestação \"UTE Cocal 2\" junto à usina de açúcar. Que a energia do biogás passe por ela é uma inferência do mapa."],
      tags: ["subestacao"], streams: ["eletricidade"], anchor: [990, 560, 34], focus: [700, 200, 1130, 680], sources: ["osm", "paques"], dc: ["confirmado", "inferido"],
    },
    {
      id: "digestato", chapter: "destino", kicker: "Digestato e fertirrigação",
      message: "O que sai dos digestores volta ao canavial como biofertilizante.",
      figure: { type: "cycle", steps: [{ icon: "leaf", label: "Canavial" }, { icon: "factory", label: "Vinhaça e torta" }, { icon: "tank", label: "Biodigestor" }, { icon: "sprout", label: "Biofertilizante" }], chips: ["N", "P", "K"],
        kpis: [{ v: fmt(DIGESTATO.organageo), l: "t/ano de fertilizante sólido (Organageo)" }, { v: `${fmt(DIGESTATO.liquifertil / 1e6, 2)} mi`, l: "t/ano de fertilizante líquido (Liquifértil)" }, { v: "?", l: "talhões que recebem: não publicado" }],
        kpiNote: "Valores nominais da especificação do projeto, não reverificados." },
      text: ["A digestão consome carbono, mas preserva nitrogênio, fósforo e potássio. Separado em fração sólida e líquida, o digestato substitui adubo químico na lavoura."],
      more: ["Quais talhões recebem o digestato, como e quanto não é publicado. O talhão molhado e o canhão de fertirrigação do mapa são ilustrativos, assim como o tubo que leva às lagoas e ao campo."],
      tags: ["separacao", "lavoura"], streams: ["digestato"], anchor: [945, 330, 16], focus: [330, 200, 1110, 470], sources: ["spec", "gemeo"], dc: ["projeto", "esquematico"],
    },
    {
      id: "carbono", chapter: "destino", kicker: "Pegada de carbono do etanol",
      message: "Biogás, biofertilizante e frota a biometano derrubam a pegada do etanol.",
      figure: { type: "compare", unit: "gCO₂e por MJ de etanol (Datagro, via imprensa)", ratioLabel: `${fmt(CI_ETANOL.base, 2)} → ${fmt(CI_ETANOL.completo, 2)}`, rows: [
        { label: "Etanol, sem biogás", v: CI_ETANOL.base, tone: "neutral" }, { label: "Com biogás, biofertilizante e frota", v: CI_ETANOL.completo, tone: "biometano" }] },
      text: [`Com só o biogás, a intensidade cai para ${fmt(CI_ETANOL.biogas, 2)} gCO₂e/MJ. O valor de ${fmt(CI_ETANOL.completo, 2)} soma o biofertilizante e a frota a biometano.`],
      more: ["Fonte secundária: a notícia não diz se os valores são da unidade de Narandiba ou da empresa toda."],
      tags: ["cana", "lavoura", "horizontais"], streams: ["biometano", "digestato"], anchor: [130, 420, 60], focus: "all", sources: ["datagro"], dc: ["projeto"],
    },

    // ---------------- SAFRA E DADOS
    {
      id: "anp", chapter: "dados", kicker: "Uma safra de dados (ANP)",
      message: `A usina usou ${USO_SAFRA}% da capacidade na safra e ${USO_ENTRESSAFRA}% na entressafra.`,
      figure: { type: "monthly", unit: "% da capacidade de biogás (51.600 m³/d), média do mês · ANP", max: 60,
        rows: ANP.map((r) => { const m = Number(r.ym.slice(5)) - 1; return { k: r.ym, v: r.pct, l: MESES[m], y: r.ym.slice(0, 4), safra: m >= 3 && m <= 10 }; }) },
      text: ["São os volumes mensais que a usina informa à ANP. Antes de agosto de 2025, os valores informados (0 a 30 m³/d) não podem ser produção real: é uma lacuna de informe, não produção baixa."],
      more: ["Só há uma safra completa de dados, então isto não é um ano típico. No mapa, o relógio usa esta série: nos meses com dado, a velocidade dos fluxos acompanha o uso da capacidade; de maio a julho não há dado utilizável."],
      tags: ["usina"], streams: "all", anchor: [420, 280, 50], focus: [330, 0, 730, 440], sources: ["anp"], dc: ["confirmado"],
    },
    {
      id: "numeros", chapter: "dados", kicker: "Números que não batem",
      message: "Três capacidades de biometano publicadas, e nenhuma é a \"certa\".",
      figure: { type: "facts", rows: BIOMETANO.capacidade.map((c) => ({ v: fmt(c.v), u: c.u, l: c.fonte, cls: "confirmado" })).concat([{ v: fmt(BIOMETANO.projetoNm3Ano / 1e6, 1) + " mi", u: "Nm³/ano", l: "projeção de 2021", note: "não comparar direto com capacidades diárias", cls: "projeto" }]) },
      text: ["Cada fonte usa sua base, data e unidade. Aqui os números ficam lado a lado, sem média nem ajuste: conciliar exigiria dados que não são públicos."],
      more: ["O mesmo vale para a eletricidade (33,3 e 35 mil MWh/ano, em datas e escopos diferentes) e para a pressão da caldeira (67 kgf/cm² e 66 bar)."],
      tags: ["upgrading", "compressao"], streams: ["biometano"], anchor: [700, 300, 60], focus: [480, 180, 760, 460], sources: ["paques", "geo", "anp", "copersucar2021"], dc: ["confirmado", "projeto"],
    },
    {
      id: "modos", chapter: "dados", kicker: "Projeto × auditado",
      message: AUD ? "Modo auditado: os valores RenovaBio da especificação do projeto." : "Modo projeto: os valores anunciados e nominais.",
      figure: { type: "facts", rows: [
        { v: fmt(SB.vinhaca[modo] ?? 0), u: "m³/ano", l: "vinhaça", cls },
        { v: fmt(SB.torta[modo] ?? 0), u: "t/ano", l: "torta de filtro", cls },
        { ...sub("esterco", modo), u: "t/ano", l: "esterco bovino", note: "não confirmado para Narandiba", cls: "auditado" },
        { v: AUD ? `${fmt(CHP.kwhAuditado18m / 1e6, 1)} GWh` : `${fmt(CHP.mwhProjeto / 1000, 1)} GWh/ano`, u: AUD ? "em 18 meses" : "até", l: "eletricidade", cls }] },
      text: ["Use o botão Projeto/Auditado no alto da tela para trocar os valores em todas as etapas. Os auditados vêm da especificação do projeto e não foram encontrados em fonte pública."],
      tags: ["usina"], streams: "all", anchor: [380, 250, 70], focus: "all", sources: ["spec", "copersucar2021"], dc: [cls],
    },
    {
      id: "limites", chapter: "dados", kicker: "O que este mapa não sabe",
      message: "Onde as fontes param, o mapa vira esquema e avisa.",
      figure: { type: "twoCols", cols: [
        { title: "Lido em imagem", icon: "check", note: "digestores, bunkers, esteira, cúpula, lagoas, canais de vinhaça (OSM), subestação (OSM) e lote do CAR da usina", tag: "horizontais" },
        { title: "Sem posição pública", icon: "doc", note: "THIOPAQ, motores, purificação, CO₂, compressão, flare, separação, Lesaffre e talhões do digestato", tag: "thiopaq" }] },
      text: ["O complexo foi reconstruído num gêmeo digital em Blender a partir de imagens de satélite, OpenStreetMap e do Cadastro Ambiental Rural, que confirma um lote de 20 ha em volta da usina de biogás."],
      link: { href: "https://github.com/aikiesan/cocal_simulation", label: "Ver o gêmeo digital" },
      tags: ["usina"], streams: "all", anchor: [135, -170, 40], focus: "all", sources: ["gemeo", "sicar", "osm", "ecossistema"], dc: ["inferido", "esquematico"],
    },
  ];
  let k = 0;
  for (const s of stops) if (!s.tourOnly) s.n = ++k;
  return stops;
}
