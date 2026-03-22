/**
 * snap-service.js
 * Serviço Node.js que roda no VPS e tira screenshots das apps via Puppeteer.
 * 
 * Endpoint: GET /snap?token=SEU_TOKEN[&lab=soul-gradient]
 *   - sem &lab → captura TODOS os labs configurados em LABS[]
 *   - com &lab  → captura só aquele lab
 * 
 * Imagens salvas em: SCREENSHOTS_DIR/[lab-slug].jpg
 * Servidas pelo Nginx em: /screenshots/[lab-slug].jpg
 */

const http        = require('http');
const url         = require('url');
const path        = require('path');
const fs          = require('fs');
const puppeteer   = require('puppeteer');

/* ── CONFIG ─────────────────────────────────────────────── */
const PORT            = 3099;                         // porta interna (Nginx faz proxy)
const SECRET_TOKEN    = process.env.SNAP_TOKEN || 'troque-este-token-agora';
const SCREENSHOTS_DIR = process.env.SNAP_DIR   || '/var/www/folio-screenshots';
const GITHUB_BASE     = process.env.SNAP_BASE  || 'https://SEU_USUARIO.github.io/labs';

// Labs registrados — adicione novos aqui
const LABS = [
  {
    slug:    'soul-gradient',
    url:     `${GITHUB_BASE}/labs/soul-gradient/`,
    waitMs:  2200,   // tempo para Canvas API animar
    width:   1600,
    height:  480,
  },
  {
    slug:    'persona-ai',
    url:     `${GITHUB_BASE}/labs/persona-ai/`,
    waitMs:  1800,
    width:   1600,
    height:  480,
  },
  {
    slug:    'tralia',
    url:     `${GITHUB_BASE}/labs/tralia/`,
    waitMs:  1600,
    width:   1600,
    height:  480,
  },
];

/* ── GARANTE DIRETÓRIO ───────────────────────────────────── */
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log(`[snap] criado diretório ${SCREENSHOTS_DIR}`);
}

/* ── CAPTURA ─────────────────────────────────────────────── */
async function capturelab(lab) {
  console.log(`[snap] capturando: ${lab.slug} → ${lab.url}`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: lab.width, height: lab.height, deviceScaleFactor: 1 });
    await page.goto(lab.url, { waitUntil: 'networkidle2', timeout: 30000 });

    // aguarda animações iniciarem
    await new Promise(r => setTimeout(r, lab.waitMs));

    const outPath = path.join(SCREENSHOTS_DIR, `${lab.slug}.jpg`);
    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 90,
      clip: { x: 0, y: 0, width: lab.width, height: lab.height },
    });

    console.log(`[snap] ✓ salvo: ${outPath}`);
    return { ok: true, slug: lab.slug, path: outPath };
  } catch (err) {
    console.error(`[snap] ✗ erro em ${lab.slug}:`, err.message);
    return { ok: false, slug: lab.slug, error: err.message };
  } finally {
    await browser.close();
  }
}

/* ── SERVER ──────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  // endpoint principal
  if (pathname !== '/snap') {
    res.writeHead(404);
    res.end('not found');
    return;
  }

  // autenticação
  if (query.token !== SECRET_TOKEN) {
    res.writeHead(401);
    res.end('unauthorized');
    return;
  }

  // qual lab?
  let targets = LABS;
  if (query.lab) {
    const found = LABS.find(l => l.slug === query.lab);
    if (!found) {
      res.writeHead(400);
      res.end(`lab desconhecido: ${query.lab}\nLabs disponíveis: ${LABS.map(l => l.slug).join(', ')}`);
      return;
    }
    targets = [found];
  }

  // responde imediatamente — captura em background
  res.writeHead(202, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status:  'capturing',
    targets: targets.map(l => l.slug),
    message: 'Screenshots sendo gerados. Aguarde ~5s por lab.',
  }));

  // captura sequencial (evita OOM no VPS)
  for (const lab of targets) {
    await capturelab(lab);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[snap] rodando em http://127.0.0.1:${PORT}`);
  console.log(`[snap] screenshots → ${SCREENSHOTS_DIR}`);
  console.log(`[snap] labs: ${LABS.map(l => l.slug).join(', ')}`);
});
