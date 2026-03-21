# 🥋 Dojo dos 9 Quadrados — Snapshot

## Onde você está
Completou o **modo arquiteto** — pintar posições em vez de apagar.

## O que você domina

**Mapa mental do grid:**
```
1 2 3
4 5 6
7 8 9
```

**Modo escultor** → começa tudo preto, usa `background:transparent` para apagar

**Modo arquiteto** → começa tudo transparente, usa `background:black` para pintar

**Letras que você montou:** L, L invertido, T, +, X, H, C, E, F, P, U, Z, S, N

## Bug importante aprendido
`display:none` quebra o grid — os elementos saem do fluxo e os outros se reorganizam.
Sempre usar `background:transparent` para "apagar" visualmente mantendo o espaço.

## Código base atual
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Dojo dos 9 Quadrados</title>
<style>

body { margin:0; font-family:sans-serif; }

.screen {
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
}

.grid {
  display:grid;
  grid-template-columns:repeat(3,100px);
  grid-template-rows:repeat(3,100px);
  gap:10px;
}

.box { background: transparent; }

/* pinte aqui */
.box:nth-child(1),
.box:nth-child(2),
.box:nth-child(3) {
  background: black;
}

</style>
</head>
<body>
<div class="screen">
  <div class="grid">
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
    <div class="box"></div>
  </div>
</div>
</body>
</html>
```

## Referência das letras

| Letra | Posições |
|-------|----------|
| L     | 1,4,7,8,9 |
| L inv | 3,6,7,8,9 |
| T     | 1,2,3,5,8 |
| +     | 2,4,5,6,8 |
| X     | 1,3,5,7,9 |
| H     | 1,3,4,5,6,7,9 |
| C     | 1,2,3,4,7,8,9 |
| E     | 1,2,3,4,5,7,8,9 |
| F     | 1,2,3,4,5,7 |
| P     | 1,2,3,4,5,6,7 |
| U     | 1,3,4,6,7,8,9 |
| Z     | 1,2,3,5,7,8,9 |
| S     | 1,2,3,4,5,8,9 |
| N     | 1,3,4,5,6,7,9 |

## Próximo nível
**grid-column** e **grid-row** — blocos ocupando múltiplas células, base de layouts reais.

---
Cole esse snapshot num novo prompt e continue de onde parou.
