# Arquitetura e guia de edição

## Princípios das figuras e dos dados

1. **Uma figura, uma mensagem.** O título da etapa (`message`) é a frase que a figura prova. Escreva a mensagem antes de escolher a figura.
2. **Transparência sobre a origem de cada dado.** Cada número pertence a uma classe (`confirmado`, `projeto`, `auditado`, `inferido`, `esquematico`), e números conflitantes de fontes diferentes aparecem lado a lado, sem média nem ajuste.
3. **Cor só quando carrega informação.** A cena é sóbria (brancos, cinzas, verdes suaves). A cor forte fica reservada aos fluxos (`vinhaca`, `substrato`, `biogas`, `dessulf`, `biometano`, `co2`, `eletricidade`, `digestato`) em [`src/ui/palette.mjs`](../src/ui/palette.mjs), derivados da paleta Okabe-Ito.
4. **Mesma codificação em tudo.** O mapa, as figuras e a legenda usam `src/ui/palette.mjs`.
5. **Cortar o desnecessário.** Sem molduras, sem eixos redundantes e sem marcas de escala. O valor fica escrito na própria barra ou cartão.

## Como editar

| Quero… | Arquivo |
|---|---|
| mudar um número | `src/data/numeros.mjs` (as figuras e o contador se atualizam sozinhos) |
| mudar textos, a ordem, classes de dado ou o destaque de uma etapa | `src/content/paradas.mjs` |
| adicionar uma referência | `src/data/fontes.mjs`, e depois `sources: [...]` na etapa |
| mudar cores dos fluxos | `src/ui/palette.mjs` |
| mexer na base em L, nos lotes ou nas estradas | `src/scene/layout.mjs` |
| mexer num prédio ou equipamento | `src/scene/zones/*.mjs` (`biogas.mjs`, `moenda.mjs`, `campo.mjs`, `destinos.mjs`) |
| criar ou ajustar um tipo de figura | `src/ui/figures.mjs` (objeto `F`) |

### Campos de uma etapa (`paradas.mjs`)

- `message`: a mensagem (título).
- `figure`: `{ type, ... }`. Os tipos usados são: `chain`, `fork`, `merge`, `facts`, `composition`, `sankey`, `compare`, `cycle`, `monthly` e `twoCols`.
- `text`: 1 ou 2 frases de apoio.
- `more`: detalhes opcionais. `sources`: ids de `fontes.mjs`.
- `dc`: lista de classes de dado exibidas como selos no topo da etapa (`confirmado`, `projeto`, `auditado`, `inferido`, `esquematico`).
- `tags`: zonas do mapa a destacar. São os ids passados como 3º argumento de `S.add(...)` nas zonas.
- `streams`: fluxos em evidência.
- `anchor`: posição do pino no mundo.
- `focus`: área `[x0, y0, x1, y1]` que o tour enquadra (ou `"all"`).

## Cena e geometria em L

As coordenadas são de mundo: `+x` desce para a direita (leste), `+y` desce para a esquerda (sul) e `z` sobe. A base tem **forma de L** (`BASE_RING` e `NOTCH` em `src/scene/layout.mjs`), recortando o quadrante sudoeste (`x < 286, y > 492`) com `slabRing(roundRing(...))` em `src/scene/kit.mjs`.

`S.add(svg, ponto, tag)` insere um objeto. A ordem de pintura é calculada pela profundidade do ponto. Por isso, use o centro da base do objeto e mantenha os objetos sem sobreposição de planta.

O destaque de uma etapa funciona assim: um véu claro cobre o mapa, e os objetos com a `tag` da etapa são redesenhados acima dele (`<use>`). Na visão geral o quadro não se move; no tour guiado a câmera voa até `focus`.
