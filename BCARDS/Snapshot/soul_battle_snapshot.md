# ⚡ SOUL BATTLE — Snapshot de Projeto
> Cole este documento inteiro no início de um novo chat para continuar de onde parou.

---

## 🎯 O QUE É ESSE PROJETO

**Soul Battle** — jogo de cartas colecionável infantil (5–9 anos), HTML/CSS/JS puro, sem bibliotecas externas, sem backend. Estética **Yoshi's Island**: traço grosso `3.5px solid #2d1a5e`, fundo pergaminho `#f5ecd7`, fontes Fredoka One + Nunito, cores pastéis chapadas, mascotes SVG desenhados à mão.

**Arquivo principal:** `soul_battle.html` (único arquivo, ~1000 linhas, pronto para rodar)

---

## 🏗️ ARQUITETURA DO PROJETO

### Fluxo de telas (3 telas em SPA)
```
Tela 1: COLEÇÃO     → escolhe 3 cartas do time
Tela 2: INIMIGO     → escolhe quem vai enfrentar
Tela 3: BATALHA     → duelo por atributos, round a round
         ↓
    Overlay VITÓRIA / DERROTA → reinicia
```

### Navegação
```js
showScreen('s-collection') // Tela 1
showScreen('s-pick')       // Tela 2
showScreen('s-battle')     // Tela 3
```

### Estado global
```js
let selectedIds = [];    // IDs das 3 cartas do player (ex: ['a','c','f'])
let enemySoul   = null;  // objeto SOUL do inimigo
let playerHp    = 3;     // pontos de vida do player (0-3)
let enemyHp     = 3;     // pontos de vida do inimigo (0-3)
let scoreP      = 0;     // rounds vencidos pelo player
let scoreE      = 0;     // rounds vencidos pelo inimigo
let attackerSoul= null;  // carta selecionada para atacar (objeto SOUL)
let chosenAttr  = null;  // atributo escolhido: 'poder'|'velocidade'|'caos'|'brilho'
```

---

## 🐾 OS 6 PERSONAGENS (SOULS)

Cada personagem tem:
- **Dados do engine canvas**: `h` (matiz HSL), `s`, `l`, `a3` (cor alternativa RGB), `speed`, `phase`, `bperiod`
- **Dados visuais**: `label`, `rune`, `glowHex`, `glow`, `bg`, `fx`
- **Atributos de batalha** (0–100): `poder`, `velocidade`, `caos`, `brilho`

```js
const SOULS = [
  {id:'a', label:'Névoa',     rune:'🌫️', glowHex:'#5ab8e0',
   h:205, s:22, l:48, a3:[196,245,183], speed:.004, phase:0,   bperiod:7800, fx:'trail',
   bg:'#ddf6ff', glow:'rgba(180,240,255,.7)',
   attrs:{poder:42, velocidade:88, caos:30,  brilho:65}},

  {id:'b', label:'Terra',     rune:'🌍', glowHex:'#e07040',
   h:18,  s:22, l:42, a3:[189,121,146], speed:.011, phase:1.3, bperiod:8200, fx:'pulse',
   bg:'#ffe0cc', glow:'rgba(220,130,100,.7)',
   attrs:{poder:78, velocidade:40, caos:55,  brilho:50}},

  {id:'c', label:'Bosque',    rune:'🌿', glowHex:'#5acc7a',
   h:150, s:18, l:40, a3:[205,158,74],  speed:.021, phase:2.7, bperiod:7400, fx:'orbit',
   bg:'#d6f5e0', glow:'rgba(90,204,122,.7)',
   attrs:{poder:58, velocidade:62, caos:48,  brilho:72}},

  {id:'d', label:'Cosmos',    rune:'✨', glowHex:'#9b2fff',
   h:270, s:20, l:48, a3:[192,117,180], speed:.038, phase:4.1, bperiod:8600, fx:'stars',
   bg:'#ede0ff', glow:'rgba(155,47,255,.7)',
   attrs:{poder:65, velocidade:70, caos:82,  brilho:90}},

  {id:'e', label:'Areia',     rune:'⏳', glowHex:'#d4a820',
   h:38,  s:22, l:44, a3:[128,138,86],  speed:.062, phase:5.5, bperiod:7100, fx:'dust',
   bg:'#fff6cc', glow:'rgba(212,168,32,.7)',
   attrs:{poder:50, velocidade:95, caos:75,  brilho:38}},

  {id:'f', label:'Crepúsculo',rune:'🌅', glowHex:'#ff64b4',
   h:320, s:18, l:45, a3:[126,200,192], speed:.104, phase:.8,  bperiod:9000, fx:'aurora',
   bg:'#ffe0f0', glow:'rgba(255,100,180,.7)',
   attrs:{poder:70, velocidade:55, caos:60,  brilho:95}},
];
```

### Metadados dos atributos
```js
const ATTR_META = {
  poder:     {em:'💥', cor:'#ff6b1a', label:'Poder'},
  velocidade:{em:'⚡', cor:'#5ab8e0', label:'Veloc.'},
  caos:      {em:'🌀', cor:'#9b2fff', label:'Caos'},
  brilho:    {em:'✨', cor:'#d4a820', label:'Brilho'},
};
```

---

## 🎨 ENGINE CANVAS (SMOKE)

O coração do projeto. Roda em `requestAnimationFrame`. Cada alma tem animação independente.

### Como funciona
- **Noise layered** (`n2()`): 4 frequências de seno sobrepostas — cria movimento orgânico não-repetitivo
- **Heartbeat** (`heartbeat()`): pulso cardíaco com dois picos (sístole + diástole), baseado no `speed` da alma
- **Breathwave** (`breathwave()`): respiração lenta baseada no `bperiod` da alma
- **PUFFS**: 5 bolhas de gradiente radial com `globalCompositeOperation='screen'` — cria o efeito luminoso
- **Turbulência**: partículas periféricas baseadas em `iv` (intensidade 0–1)
- **FX únicos** por alma: `trail` (Névoa), `pulse` (Terra), `orbit` (Bosque), `stars` (Cosmos), `dust` (Areia), `aurora` (Crepúsculo)
- **Vinheta**: gradiente radial escuro nas bordas para profundidade

### Sistema de canvas
```js
// offscreens — um por alma, sempre vivos
const offscreens = {}; // id -> {c: OffscreenCanvas, ctx}

// canvases ativos na tela atual
const activeCanvases = {}; // key -> {cnv, soul, ivFn}

// registrar canvas para animação
registerCanvas('chave-unica', elemento_canvas, soul_objeto, () => valorIntensidade);

// intensidade (iv) vai de 0.0 a 1.0 e controla:
// densidade, turbulência, velocidade de rotação, brilho interno, expansão
```

### Parâmetros do engine por intensidade (iv)
```
density     = 0.3 + iv * 2.2   → espessura do smoke
turbulence  = iv * 3.5         → partículas periféricas
centrifugal = 0.8 + iv * 2.2   → expansão dos PUFFS
drift       = (iv - 0.5) * 1.4 → deriva vertical
halo        = 0.5 + iv * 2.0   → brilho interno
```

---

## 🖌️ MASCOTES SVG

6 mascotes estilo Yoshi's Island. Armazenados em objeto `MASCOTS`:
```js
const MASCOTS = {
  a: `<svg>...</svg>`, // Névoa — fantasminha azul com asas
  b: `<svg>...</svg>`, // Terra — tartaruguinha laranja
  c: `<svg>...</svg>`, // Bosque — joaninha verde com antenas
  d: `<svg>...</svg>`, // Cosmos — alienígena lilás olho cíclope
  e: `<svg>...</svg>`, // Areia — carangueijo amarelo com garras
  f: `<svg>...</svg>`, // Crepúsculo — passarinho rosa
};
```
Regras de estilo: `stroke="#2d1a5e"`, `stroke-width="3"`, cores chapadas, olhões grandes com reflexo.

---

## ⚔️ MECÂNICA DE BATALHA

### Fluxo de um round
1. Player toca em uma das 3 cartas → `selectAttacker(soul)`
2. Card fica com borda amarela `#ffe44d`
3. Painel de ataque mostra 4 atributos com valores → player toca num
4. `chosenAttr` é definido, botão ⚡ Atacar! fica ativo
5. `doAttack()` é chamado:
   - Pega `playerVal = attackerSoul.attrs[chosenAttr]`
   - Inimigo escolhe atributo **aleatório**: `eKey = random key`
   - `enemyVal = enemySoul.attrs[eKey]`
   - `playerVal >= enemyVal` → player vence o round
   - Vencedor: -1 HP no perdedor, +1 score
   - `shakeEl()` + `spawnHitParticles()` no perdedor
6. Resultado do round aparece, botão "Próxima rodada" → `nextRound()`
7. Verifica `enemyHp <= 0` → `endGame(true)` | `playerHp <= 0` → `endGame(false)`

### HP e scoring
- Cada lado começa com 3 HP
- Score conta rounds vencidos (não HP)
- Jogo acaba quando qualquer lado chega em 0 HP

---

## 🎨 DESIGN SYSTEM

### Paleta
```
Fundo:        #f5ecd7  (pergaminho)
Tinta/borda:  #2d1a5e  (roxo escuro)
Amarelo:      #ffe44d  (destaque primário)
Rosa:         #ff7eb3  (acento / derrota)
Verde:        #5acc7a  (vitória / sucesso)
Azul:         #5ab8e0  (Névoa)
Laranja:      #e07040  (Terra)
Roxo:         #9b2fff  (Cosmos)
Dourado:      #d4a820  (Areia)
Pink:         #ff64b4  (Crepúsculo)
```

### Componentes
```css
/* Card base */
border: 3.5px solid #2d1a5e;
border-radius: 20px;
filter: drop-shadow(3px 4px 0 rgba(45,26,94,.22));
background: #fff;

/* Botão */
font-family: 'Fredoka One';
border: 3px solid #2d1a5e;
box-shadow: 3px 4px 0 #2d1a5e;
border-radius: 16px;
/* :active → translateY(2px), box-shadow menor */

/* Botão primário */
background: #ffe44d;

/* Textura de fundo */
body::before com radial-gradient bolinhas
background-size: 38px 38px, 55px 55px, 44px 44px
```

### Fontes (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@800;900&display=swap" rel="stylesheet">
```
- **Fredoka One** — títulos, nomes, badges, rótulos
- **Nunito 800/900** — corpo de texto

---

## 📁 HISTÓRICO DE ARQUIVOS GERADOS

| Arquivo | O que é |
|---|---|
| `soul_smoke_kpop__3_.html` | Referência original (Soul Warriors) — engine canvas + personagens |
| `soul_de_energia.html` | v1 — Sol de energia com CSS puro, switches |
| `almas_de_energia.html` | v2 — 5 almas com engine canvas, tabs sw/barra |
| `soul_storm_v4.html` | v4 — 6 cartas, barras de intensidade, FX únicos |
| `soul_storm_v5.html` | v5 — switches + barra por card, contraste dramático |
| `soul_storm_v6.html` | v6 — mascotes SVG Yoshi's Island, UI pastel, painel tabs |
| **`soul_battle.html`** | **v7 — JOGO COMPLETO: coleção → inimigo → batalha** |

---

## 🔮 PRÓXIMOS PASSOS MAPEADOS (Caminho A)

### Prioridade alta (MVP app store)
- [ ] **Sistema de levels** — cada alma sobe de nível ao ganhar rounds (1–5), muda visual
- [ ] **Persistência** — `localStorage` para salvar cartas desbloqueadas, wins, nível de cada alma
- [ ] **Deck limitado** — player começa com 2 almas, desbloqueia as outras jogando
- [ ] **Inimigo com IA básica** — inimigo escolhe atributo mais alto (não aleatório)
- [ ] **Animação de ataque** — carta "voa" para o inimigo antes do resultado

### Prioridade média
- [ ] **Fusão de almas** — combinar 2 cartas para criar uma nova com atributos misturados
- [ ] **Tela de álbum** — ver todas as almas, nível, histórico de batalhas
- [ ] **Sound design** — efeitos sonoros com Web Audio API (sem assets externos)
- [ ] **Exportar card PNG** — `canvas.toDataURL()` + `html2canvas` para compartilhar

### Considerações App Store
- COPPA/LGPD para < 13 anos: sem coleta de dados, sem anúncios
- React Native com o mesmo engine canvas para iOS/Android
- Conta de desenvolvedor Apple: U$99/ano

---

## 💡 COMO CONTINUAR EM NOVO CHAT

Cole este documento e diga algo como:

> "Tenho um projeto chamado Soul Battle — jogo de cartas HTML. Aqui está o snapshot completo do estado atual. Quero implementar [próximo passo]. O arquivo principal é soul_battle.html."

Em seguida, anexe o arquivo `soul_battle.html` se quiser que Claude leia o código atual.
