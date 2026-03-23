# 🃏 Elementos — Snapshot Completo
> Arquivo ativo: `elementos_v4.html`  
> Data: versão final estável com regras corrigidas

---

## 📁 Histórico de arquivos

| Arquivo | Status | O que era |
|---|---|---|
| `elemental_battle_5.html` | arquivo original do usuário | versão inicial com HP 6 vidas |
| `elemental_battle_6.html` | descartado | redesign Valorant, HP 3 corações, drag básico |
| `elementos_v1.html` | descartado | primeiro redesign "carta protagonista", estilo Magic |
| `elementos_v2.html` | descartado | layout 2+3, drag touch/mouse, vitral, flip PPR |
| `elementos_v3.html` | descartado | energia 15pts, portrait, animações cinemáticas |
| `elementos_v3_fixed.html` | descartado | bug `beats` undefined corrigido |
| **`elementos_v4.html`** | **✅ ATIVO** | rewrite completo sem tela de passe, PPR inline, 50/50 layout |

---

## 🎮 Regras do jogo

### Objetivo
Destruir todas as cartas do deck adversário. Carta com energia = 0 está eliminada. Quem ficar sem cartas perde.

### Estrutura de uma rodada

```
J1 arrasta carta → arena (dz1 acende)
  ↓ drop
PPR J1 abre (bottom sheet) → escolhe golpe → confirma
  ↓ sem tela de passe — J2 vê a tela direto
J2 arrasta carta → arena (dz2 acende)
  ↓ drop
PPR J2 abre → escolhe golpe → confirma
  ↓
Botão ⚡ Revelar aparece flutuando na arena
  ↓ toque
Sequência cinemática de combate
  ↓ toque em qualquer lugar (ou 3.5s)
Nova rodada — J1 começa
```

### Cálculo de dano

```
1. PPR decide o atacante:
   - Pedra vence Tesoura
   - Papel vence Pedra
   - Tesoura vence Papel
   - EMPATE PPR → sorteio aleatório decide (50/50) — nunca fica sem atacante

2. Bônus elemental:
   - Se o elemento da sua carta vence o elemento adversário → +2 ATK

3. Fórmula de dano:
   dano = max(1, ATK_atacante + bonus_elemental - DEF_defensor)
   ↑ mínimo garantido de 1 — defesa não pode bloquear completamente

4. A carta defensora perde energia igual ao dano recebido
5. Se energia ≤ 0 → carta morta, sai do deck
```

### Vantagens elementais

| Elemento | Vence contra | Perde para |
|---|---|---|
| 🔥 Fogo | Ar, Terra | Água, Elétrico |
| 💧 Água | Fogo, Terra | Elétrico, Terra (não — Terra vence Água) |
| 🌍 Terra | Elétrico, Água | Fogo, Ar |
| 🌪️ Ar | Fogo, Elétrico | Água, Terra |
| ⚡ Elétrico | Água, Ar | Terra, Fogo |

---

## 📊 Balanceamento das cartas

### Stats base (ATK + DEF = sempre 15)

| Elemento | ATK | DEF | Perfil |
|---|---|---|---|
| 🔥 Fogo | 8 | 7 | Equilibrado |
| 💧 Água | 5 | 10 | Tanque |
| 🌍 Terra | 4 | 11 | Muralha |
| 🌪️ Ar | 9 | 6 | Agressivo |
| ⚡ Elétrico | 12 | 3 | Glass cannon |

### Variantes (aleatórias por partida, mesma soma total)

| Sufixo | Δ ATK | Δ DEF | Efeito |
|---|---|---|---|
| Sentinela | −2 | +2 | Mais resistente |
| Guerreiro | 0 | 0 | Base |
| Assaltante | +2 | −2 | Mais agressivo |

> Exemplo: Elétrico Sentinela → ATK 10, DEF 5 (ainda soma 15)

### PPR

| Escolha | Vence | Perde para |
|---|---|---|
| 🪨 Pedra | ✂️ Tesoura | 📜 Papel |
| 📜 Papel | 🪨 Pedra | ✂️ Tesoura |
| ✂️ Tesoura | 📜 Papel | 🪨 Pedra |
| Empate | — | sorteio 50/50 |

---

## 🎬 Sequência cinemática do Reveal

```
t=0ms      cartas reveladas na arena (energia cheia ainda — visual)
t=380ms    carta vencedora executa smashFwd: avança em direção à perdedora
t=650ms    flash branco na arena + hitShake na perdedora + vibração [26,8,14]
t=900ms    números de dano flutuam (tamanho ∝ dano: 12px a 58px)
t=1150ms   barras de energia drenam com curva RPG (cubic-bezier .55,0,.45,1)
           energia real aplicada nas cartas aqui
t=2000ms   HUD atualiza, "⚔ J1/J2 venceu" aparece no centro
t=2700ms   carta viva: clone voa de volta ao deck (retToHand)
           carta morta: acDie → explode saindo da tela → some da mão
t=3400ms   hint "toque para continuar" + auto-avança em 3.5s
```

---

## 🏗️ Layout mobile (proporção fixa)

```
body (100dvh, max-width 430px)
│
├── #hud           — strip fino no topo
│   ├── J1: nome + barra de deck-energy + contagem de cartas
│   ├── centro: Rodada N + último resultado
│   └── J2: nome + barra + contagem
│
├── #game (flex:1, flex-direction:column)
│   │
│   ├── #arena-zone    flex: 0 0 52%
│   │   ├── #phase-bar — texto de fase (9px, italic)
│   │   ├── #arena     — campo de batalha
│   │   │   ├── .dz#dz1   — drop zone J1
│   │   │   ├── #arena-vs — "VS" central
│   │   │   ├── .dz#dz2   — drop zone J2
│   │   │   └── #arena-flash — flash de impacto overlay
│   │   └── #rev-btn   — botão flutuante "⚡ Revelar" (abs, bottom:8px)
│   │
│   └── #hand-zone     flex: 0 0 48%
│       └── .hand-rows (justify-content: flex-end → cartas no fundo)
│           ├── .hand-row.top  — 2 cartas centralizadas
│           └── .hand-row.bot  — 3 cartas
│
├── #drag-ghost    — clone da carta durante drag
├── #tap-hint      — "toque para continuar" (fixed, bottom)
│
├── #ppr-overlay   — bottom sheet PPR (fixed, z-index:100)
│   └── #ppr-panel  — sobe com slideUp animation
│       ├── #ppr-card-mini — carta do jogador em flip animation
│       ├── #ppr-who       — "Jogador X — golpe secreto"
│       ├── #ppr-sub       — regras PPR
│       ├── #ppr-opts      — 3 botões (Pedra/Papel/Tesoura)
│       └── #ppr-go        — "Confirmar golpe" (disabled até escolher)
│
└── #gameover      — overlay final (fixed, z-index:200)
```

---

## 🔧 Funções JavaScript

### Fluxo principal

| Função | O que faz |
|---|---|
| `init()` | Reset total: novos decks, zera estado, renderiza mão J1, ativa dz1 |
| `setPhase(p)` | Atualiza phase-bar com texto e cor da fase atual |
| `renderHand(deck, player)` | Desenha cartas 2+3 do deck na mão |
| `setupDrag(el, card)` | Registra eventos touch+mouse na carta |
| `startDrag / moveDrag / endDrag` | Sistema de drag completo |
| `onDropped(card)` | Carta chegou na drop zone → aciona PPR |
| `showPPR(player, card, cb)` | Abre bottom sheet com carta animada |
| `pickPPR(el)` | Seleciona golpe PPR |
| `confirmPPR()` | Confirma golpe → fecha overlay → executa callback |
| `doReveal()` | Sequência completa de combate com todos os timeouts |
| `advanceRound()` | Incrementa rodada, reseta estado, renderiza mão J1 |
| `endGame()` | Mostra tela de game over |

### Animações

| Função | O que faz |
|---|---|
| `spawnDmg(dmg, cx, cy, color, isLose)` | Número RPG flutuante, tamanho ∝ dano |
| `drainAC(dzId, toE)` | Drena barra de energia na arena card |
| `drainHC(cardId, newE)` | Drena barra e atualiza pts na carta da mão |
| `retToHand(dzId, cardId, isWinner)` | Clone da arena-card voa de volta à mão |
| `startSparks(eid) / stopSparks()` | Partículas elementais de fundo |
| `setGlow(eid)` | Névoa de fundo reativa ao elemento ativo |

---

## 🎨 Design

### Tipografia
- **Cinzel Decorative** — números grandes, títulos épicos, VS central
- **Cinzel** — botões, labels, nomes
- **IM Fell English italic** — subtítulos, flavor text, fase

### Paleta
- Fundo: `#07090e`
- Dourado UI: `#c8a84a`
- J1: `#7ecfff` (azul)
- J2: `#ff8080` (vermelho)

### Cores elementais por carta

| Elemento | Vitral (topo) | Glow | Borda |
|---|---|---|---|
| 🔥 Fogo | laranja→vermelho escuro | `rgba(220,70,0,.6)` | `rgba(255,130,50,.72)` |
| 💧 Água | cyan→azul profundo | `rgba(0,120,205,.6)` | `rgba(70,170,255,.7)` |
| 🌍 Terra | verde claro→verde escuro | `rgba(45,140,45,.6)` | `rgba(70,180,70,.7)` |
| 🌪️ Ar | branco→azul aço | `rgba(110,155,200,.48)` | `rgba(150,190,235,.6)` |
| ⚡ Elétrico | amarelo→dourado escuro | `rgba(200,148,0,.65)` | `rgba(240,200,50,.74)` |

### Cores de energia (barra)
| Nível | Cor |
|---|---|
| > 60% | 🟢 verde `#52c46a` |
| 35–60% | 🟡 âmbar `#f4c030` |
| < 35% | 🔴 vermelho `#f45050` |

### Estrutura visual da carta (proporção Magic 63:88)
```
┌─────────────────────┐
│ Nome           🔥   │  ← cf-hdr
├─────────────────────┤
│                     │
│    🔥 (flutuando)   │  ← cf-portrait (40% da altura)
│  vitral + raios     │
│─────────────────────│
│ Sentinela    FOGO   │  ← cf-type
├─────────────────────┤
│ [ATK: 6] [DEF: 9]   │  ← cf-stats
│ Energia ████░  6/15 │  ← cf-ebar
│ ▸ 🌍 ⚡              │  ← cf-beats (vence contra)
└─────────────────────┘
```

---

## 🐛 Bugs corrigidos nesta sessão

| Bug | Causa | Fix |
|---|---|---|
| `doReveal` não fazia nada | `c1.beats` era `undefined` — `beats` não estava no objeto da carta | `makeDeck` agora inclui `beats: TH[eid].beats` |
| Empate PPR causava draw | `drawP=true` → ambos atacavam → danos iguais possíveis | PPR empate agora sorteia um vencedor `Math.random()<.5` |
| Carta gerava 0 de dano | `max(0, ATK-DEF)` → DEF alta bloqueava completamente | Mudado para `max(1, ATK-DEF)` — dano mínimo sempre 1 |
| Tela de passe redundante | Cada turno exigia 1 toque extra para "ver a mão" | Eliminada — mão visível direto, PPR como bottom sheet |

---

## 🚧 Pendências / ideias para próximas sessões

- [ ] Sons: impacto, flip de carta, PPR escolha, vitória
- [ ] Efeito visual no bônus elemental (raio/faísca extra no dano)
- [ ] Histórico de rodadas no HUD (ícones das cartas jogadas)
- [ ] Tela de seleção de nome dos jogadores antes de iniciar
- [ ] Modo treino solo com IA básica (escolha aleatória)
- [ ] Animação de entrada das cartas ao início da partida (deal animation)
- [ ] Indicador visual do golpe PPR escolhido revelado após o combate (não antes)
- [ ] Salvar placar de vitórias entre partidas (localStorage)

---

*Snapshot gerado após correção do bug de dano zero — `elementos_v4.html` estável.*
