# Fontes e classes dos números · Cocal Narandiba

Todos os números exibidos nas etapas vêm de [`src/data/numeros.mjs`](src/data/numeros.mjs), e as referências com links ficam em [`src/data/fontes.mjs`](src/data/fontes.mjs). A base de dados foi compilada no gêmeo digital [`aikiesan/cocal_simulation`](https://github.com/aikiesan/cocal_simulation) (`twin_config.py` e `data/operational/`).

Quando duas fontes publicam números diferentes para o mesmo item, **eles são mostrados lado a lado e não são conciliados**.

## Classes de dado

Cada etapa e cada linha de dados traz um selo com sua classe:

| Classe | O que significa |
|---|---|
| **Confirmado** | Publicado por fonte primária (fornecedor, autorização ou boletim da ANP, relatório da empresa, registro público). |
| **Projeto** | Capacidade nominal, meta ou projeção anunciada (p.ex. notas de 2021–2023), não medição operacional. |
| **Auditado\*** | Valor rotulado como “auditado RenovaBio” na especificação do projeto do gêmeo digital, **não reverificado** em fonte pública primária. |
| **Inferido** | Leitura de imagem de satélite ou dedução a partir da geometria e da infraestrutura vizinha. |
| **Esquemático** | Posição ou traçado ilustrativo quando nenhuma fonte pública localiza o equipamento, o tubo ou o talhão. |

O seletor **Projeto / Auditado\*** no topo da página alterna entre os valores nominais anunciados e os valores *Auditado\** da especificação.

---

## 1. Substratos (entradas)

| Substrato | Modo Projeto | Modo Auditado\* | Unidade | Observação / Fonte |
|---|---:|---:|---|---|
| Vinhaça | 1.500.000 | 1.904.648,07 | m³/ano | Copersucar (2021) / especificação do projeto |
| Torta de filtro | 135.000 | 188.114,75 | t/ano | Copersucar (2021) / especificação do projeto |
| Palha de cana | 10.000 | — | t/ano | Anunciada em 2021 como potencial de expansão; uso efetivo não comprovado |
| Esterco bovino | — | 6.018,36 | t/ano | Especificação; não confirmado em fonte pública para Narandiba (pode ser de Paraguaçu Paulista) |
| Cama de aviário | — | 3.484,79 | t/ano | Especificação; não confirmada para Narandiba |
| Vinhaça da Lesaffre | s/ volume | s/ volume | — | Relatório de Sustentabilidade Cocal 2025/26 (a partir de junho de 2026) |
| Resíduos orgânicos de parceiros | s/ volume | s/ volume | — | Relatório de Sustentabilidade Cocal 2025/26 |

---

## 2. Biodigestores e cúpula

- **Digestores verticais:** 2 × 8.000 m³ (concreto, teto plano).
- **Digestores horizontais:** 4 × 18.000 m³ (revestidos com membrana).
- **Volume total publicado:** 88.000 m³ (Geo bio gas&carbon). A fonte não especifica se os volumes são úteis ou geométricos. No gêmeo digital, a leitura externa dos tanques verticais sugere cerca de 10.000 m³ brutos cada.
- **Cúpula de membrana:** visível nas imagens entre os digestores; a função de gasômetro é **inferida** (nenhuma fonte publica sua capacidade).

---

## 3. Dessulfurização, cogeração, purificação e CO₂

- **THIOPAQ (Paques):** trata **5.200 Nm³/h** de biogás, reduzindo H₂S de **12.000 ppmV** para **< 80 ppmV** (−99%), com recuperação de **123 a 2.125 kg/d** de enxofre elementar.
- **Divisão do biogás (plano 2021):** 47% para motogeradores (CHP) e 53% para purificação (*upgrading*), sobre uma projeção de 33,5 milhões de Nm³/ano de biogás.
- **Motogeradores (CHP):** **5 MW** instalados (Paques). Exportação anunciada como “até 33.300 MWh/ano” (Copersucar, 2021) e “até 35.000 MWh/ano” (NovaCana, 2022). Na especificação (*Auditado\**): **42.512.830 kWh** comercializados em 18 meses.
- **Capacidade de biometano (três números publicados, mantidos lado a lado):**
  - **25.000 Nm³/d** — Paques / ARSESP
  - **26.000 Nm³/d** — Geo bio gas&carbon
  - **27.112 m³/d** — ANP (autorização, para 51.600 m³/d de biogás)
  - Projeção anual anunciada em 2021: **8,9 milhões de Nm³/ano**.
- **Qualidade do biometano (*Auditado\** na especificação):** pureza de **96,69% a 98,34% CH₄** e PCI de **32,46 a 35,02 MJ/Nm³**.
- **CO₂ verde (`Cocal CO₂ Gases Industriais Ltda`):** capacidade publicada como **50 t/d** (Geo), **48 t/d** (AgFeed, out. 2023) e **16.000 t/ano** (especificação).

---

## 4. Compressão, gasoduto, digestato e pegada de carbono

- **Compressão (ANP):** 2 compressores × **970 m³/h**.
- **Gasoduto e rede (`GasBrasiliano / Necta`):** **51 km** em aço e **14,5 km** em PE, atendendo **Presidente Prudente, Pirapozinho e Narandiba**.
- **Frota a biometano:** **44 caminhões** previstos para transporte de vinhaça, compartilhados entre Narandiba e Paraguaçu Paulista (NovaCana / CNN Brasil, out. 2026).
- **Digestato (especificação, valores nominais):** **58.440 t/ano** de composto sólido (*Organageo*) e **1.589.688 t/ano** de biofertilizante líquido (*Liquifértil*).
- **Intensidade de carbono do etanol (Datagro, via imprensa — fonte secundária):** **20,46 gCO₂e/MJ** (base sem biogás) → **15,01 gCO₂e/MJ** (com biogás) → **2,69 gCO₂e/MJ** (com biogás, biofertilizante e frota a biometano).

---

## 5. Usina de açúcar e etanol e subestação

Quase nenhum dado operacional é publicado separadamente para a unidade de Narandiba:
- **Moagem corporativa (2 unidades, safra 2023/24):** 8,6–8,7 milhões de toneladas de cana (Relatório 3T24).
- **Caldeira a bagaço (HPB):** **250 t/h** de vapor a **530 °C**, pressão publicada como **67 kgf/cm²(g) e 66 bar**, eficiência térmica de **86,2% PCI**.
- **Subestação (OSM `UTE Cocal 2`):** **138/13,8 kV**.

---

## 6. Série mensal da ANP (uma safra)

Biogás processado informado à ANP (média diária do mês e fração da capacidade autorizada de 51.600 m³/d). Antes de agosto de 2025, os volumes informados (0–30 m³/d) refletem lacuna de informe, não produção baixa.

| Mês | Biogás processado (m³/d) | Uso da capacidade (%) | Período |
|---|---:|---:|---|
| 2025-08 | 23.913 | 46% | Safra |
| 2025-09 | 21.817 | 42% | Safra |
| 2025-10 | 25.414 | 49% | Safra |
| 2025-11 | 23.390 | 45% | Safra |
| 2025-12 | 15.438 | 30% | Entressafra |
| 2026-01 | 16.464 | 32% | Entressafra |
| 2026-02 | 20.035 | 39% | Entressafra |
| 2026-03 | 18.810 | 36% | Entressafra |
| 2026-04 | 19.087 | 37% | Safra |

- **Média na safra (ago–nov 2025):** 46%.
- **Média na entressafra (dez 2025–abr 2026):** 35%.
