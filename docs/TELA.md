# Papel de parede e proteção de tela

## 1. Modo tela (sem painéis e sem contador)

Abra o site com `?tela` no fim do endereço:

```
https://aikiesan.github.io/Cocal_Study/?tela
```

| Parâmetro | O que faz | Exemplo |
|---|---|---|
| `tela` | Mostra só o diorama, em tela cheia, sem cabeçalho, painel, contador nem pinos | `?tela` |
| `passeio` | A câmera passeia devagar pelas etapas a cada 14 s e volta à visão geral | `?tela&passeio` |
| `dia` | Duração de um dia, em segundos (o padrão é 60) | `?tela&dia=600` |
| `hora` | Hora inicial | `?tela&hora=19` |

**Recomendado para papel de parede:** `?tela&dia=600`. Assim um dia dura 10 minutos e a transição é bem lenta.

O cursor some depois de 2 s parado.

## 2. Usar como papel de parede animado

| Sistema | Aplicativo (gratuito) | Como fazer |
|---|---|---|
| Windows | **Lively Wallpaper** (Microsoft Store) | *Add Wallpaper* → cole a URL com `?tela&dia=600`. |
| macOS | **Plash** (App Store) | *Add Website* → cole a URL. |
| Linux (GNOME/KDE) | Extensões de papel de parede web | Use a mesma URL. |

Esses aplicativos costumam pausar a animação quando há uma janela em tela cheia, o que poupa bateria.

## 3. Usar como proteção de tela

| Sistema | Aplicativo | Como fazer |
|---|---|---|
| Windows | **Lively Wallpaper** → *Screensaver* | Use a mesma URL. |
| macOS | **WebViewScreenSaver** (GitHub) | Cole a URL com `?tela&passeio`. |
