# Cocal Narandiba · biogás · CP2b

Um diorama isométrico animado da usina de biogás da **Cocal em Narandiba (SP)**, um estudo de caso didático. Ele mostra como a vinhaça e a torta de filtro da usina de açúcar e etanol viram biometano, eletricidade, CO₂ verde e biofertilizante, e como o digestato volta ao canavial.

Tudo foi montado a partir de **fontes públicas**: fornecedores, ANP, OpenStreetMap, CAR e imprensa. Cada número mostra sua classe de dado, e o que nenhuma fonte localiza aparece como **esquema**, com aviso.

Público: estudantes, público geral, empresas e decisores. Idioma: português. Funciona no desktop e no celular.

**No ar:** <https://aikiesan.github.io/Cocal_Study/>

## Como navegar

- **Visão geral (padrão).** O mapa fica parado. Toque num número ou numa zona: a etapa abre no painel e a zona ganha destaque, sem zoom.
- **Tour guiado.** 23 etapas em 4 capítulos (Origem dos resíduos → Dentro da usina → Destinos e retorno ao campo → Safra e dados), mais a abertura. Só aqui a câmera aproxima cada etapa. Use ‹ ›, as setas do teclado ou `Esc` para voltar à visão geral.
- **Uma etapa = uma mensagem + uma figura.** O título é a mensagem e a figura a prova. Detalhes ficam em “Saiba mais” e as referências em “Fontes”.
- **Projeto × Auditado\*.** O botão no alto troca os valores em todas as etapas: *Projeto* mostra os valores anunciados e nominais; *Auditado* mostra os valores RenovaBio da especificação do projeto, **não reverificados** em fonte pública.
- **Classes de dado.** Cada etapa traz selos: *confirmado*, *projeto*, *auditado*, *inferido* e *esquemático*. Números conflitantes ficam lado a lado, sem média nem ajuste.
- **Siga o carbono.** Uma partícula faz o ciclo curto do carbono: do ar à cana, à moenda, pela vinhaça e pelo canal até o biodigestor, pela cúpula, pela dessulfurização e pela purificação, pelo gasoduto até Presidente Prudente, e de volta ao ar.
- **Passe o mouse** sobre uma peça: ela ganha contorno, mostra o nome e acende as tubulações ligadas a ela. Toque na legenda para ocultar um fluxo.
- **Relógio da ANP.** Um dia passa em 60 s e um mês por dia. O contador usa a média mensal de biogás informada à ANP naquele mês (por exemplo, out/25: 25.414 m³/d, 49% da capacidade), e a velocidade dos fluxos acompanha o uso da capacidade. De maio a julho não há dado utilizável, e o contador avisa. A safra (abr–nov) liga e desliga a colheita.
- **Noite.** Janelas, postes, refletores, a chama do flare, faróis e o brilho dos fluxos de energia acendem com o pôr do sol.
- **Link direto para uma etapa:** `…/#digestores`, `…/#thiopaq`, `…/#anp` etc.

## O mapa

A base tem **forma de L**, como o complexo real: a faixa da usina de biogás corre até a usina de açúcar e etanol, que dobra num pátio. No diorama o L é ortogonal e as distâncias estão comprimidas.

| Zona | O que tem | Posição |
|---|---|---|
| Usina de biogás | 2 digestores verticais, 4 horizontais, bunkers e esteira de torta, cúpula, separação e lagoas | lida em imagem (gêmeo digital) |
| | THIOPAQ, motores (CHP), purificação, CO₂, compressão e flare | esquemática |
| Usina de açúcar e etanol | pátio de cana, moenda, caldeira, destilaria, tanques e armazém, canal de vinhaça | simplificada (OSM) |
| Subestação 138 kV · Lesaffre | saída de energia; vizinha que envia vinhaça desde jun/2026 | esquemática |
| Canaviais | colheita (oeste) e talhão com fertirrigação (leste) | ilustrativos |
| Rede de gás | estação de entrega, Narandiba, Pirapozinho e Presidente Prudente | comprimida, fora de escala |
| Parceiros e clientes do CO₂ | resíduos de terceiros e destino do CO₂ líquido | ilustrativos |

## Papel de parede e proteção de tela

Abra com `?tela` para ver só o diorama. Por exemplo, `?tela&dia=600` deixa um dia com 10 minutos. Veja [`docs/TELA.md`](docs/TELA.md).

## Rodar localmente

Não há build nem dependências.

```bash
python -m http.server 8000
```

Depois abra <http://localhost:8000>.

**Verificação automática** (Edge ou Chrome instalado, Node 22+): com o servidor rodando, `node tools/verificar.mjs http://localhost:8000/ capturas` percorre todas as etapas nos dois modos, roda “Siga o carbono”, registra erros do console e salva capturas (desktop, noite e celular).

## Estrutura

```
index.html
styles/            base (layout, marca) · scene (diorama) · panel · figures · life
src/
  main.mjs         liga tudo: modos, navegação, URL, modo de dados
  data/
    numeros.mjs    TODOS os números, com a classe de dado de cada um
    fontes.mjs     referências (links) citadas nas etapas
  content/
    paradas.mjs    as etapas: mensagem, figura, texto, destaque, classes
  scene/           o diorama
    kit.mjs        peças isométricas (caixas, tanques, cúpulas, galpões, base em L…)
    materials.mjs  materiais/cores da cena
    layout.mjs     planta geral: base em L, lotes, ruas, canal, pontos de efeito
    zones/         biogas.mjs · moenda.mjs (açúcar, subestação, Lesaffre)
                   campo.mjs (canaviais, parceiros) · destinos.mjs (rede de gás, CO₂)
    flows.mjs      tubulações, canal e linhas de energia
    vehicles.mjs   colhedora, caminhões, carretas-tanque, carros e ônibus
    world.mjs      compõe a cena
  ui/
    stage.mjs      câmera, animação, destaque, pinos, hover
    ambient.mjs    relógio: dia/noite, meses, safra, série da ANP
    life.mjs       vida ambiente (misturadores, fertirrigação, manômetros)
    journey.mjs    "Siga o carbono"
    panel.mjs      índice e páginas das etapas
    figures.mjs    figuras do painel (geradas a partir dos dados)
    palette.mjs    codificação de cores única
    icons.mjs      ícones de traço
  vendor/iso-kit.mjs  kit isométrico do projeto Anatomy (MIT)
tools/verificar.mjs   teste no navegador sem janela (erros + capturas)
docs/ARQUITETURA.md   como editar e os princípios das figuras
DATA.md               de onde vem cada número
```

## Desempenho

- Chão e objetos ficam em camadas estáticas, desenhadas uma vez. Fluxos, veículos e efeitos ficam em camadas leves.
- Partículas e faróis são desenhados num `<canvas>`. Nuvens e pássaros são HTML animado só com `transform`.
- A câmera do tour voa com `transform` sobre as camadas prontas e redesenha nítido ao chegar.
- Abra `…/?fps` para ver quadros por segundo.

## Publicação

O workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publica a cada push na `main` (Settings → Pages → Source: **GitHub Actions**).

## Créditos

O motor do diorama vem do [Ecossistema do Biogás · CP2b](https://github.com/aikiesan/Biogas_Ecosystem). A planta foi simplificada a partir do gêmeo digital [aikiesan/cocal_simulation](https://github.com/aikiesan/cocal_simulation). Mapa base: © colaboradores do OpenStreetMap (ODbL). Os números e suas fontes estão em [`DATA.md`](DATA.md).

Este é um material didático independente do CP2b, sem vínculo com a Cocal. As posições e os valores marcados como esquemáticos, inferidos ou auditados\* não devem ser usados como dado de operação.
