/*!
 * version-widget.js — widget portátil de versões
 * Uso: adicione ao final do <body> de qualquer projeto que tenha versoes/index.json
 *
 *   <script src="../version-widget.js"></script>
 *
 * O widget lê versoes/index.json, monta uma timeline vertical e
 * carrega cada versão num iframe flutuante sem sair da página.
 */

(function () {
  'use strict';

  const MANIFEST = 'versoes/index.json';

  /* ── Injetar CSS ─────────────────────────────────────────────── */
  const css = `
    #vw-trigger {
      position: fixed;
      bottom: 1.6rem;
      right: 1.6rem;
      z-index: 8000;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      background: rgba(14,14,12,0.82);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 999px;
      padding: 0.52rem 1.1rem 0.52rem 0.72rem;
      cursor: pointer;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.18s;
      font-family: 'DM Mono', 'Courier New', monospace;
      color: rgba(232,230,220,0.65);
      font-size: 0.68rem;
      font-weight: 300;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      user-select: none;
    }
    #vw-trigger:hover {
      border-color: rgba(255,255,255,0.25);
      box-shadow: 0 0 1.2rem rgba(255,255,255,0.06);
      color: rgba(232,230,220,0.90);
      transform: translateY(-2px);
    }
    #vw-trigger .vw-dot {
      width: 0.48rem;
      height: 0.48rem;
      border-radius: 50%;
      background: rgba(120,200,120,0.70);
      flex-shrink: 0;
      box-shadow: 0 0 6px rgba(100,220,100,0.40);
      animation: vw-pulse 2.4s ease-in-out infinite;
    }
    @keyframes vw-pulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.55; transform: scale(0.78); }
    }

    #vw-panel {
      position: fixed;
      inset: 0;
      z-index: 9000;
      display: flex;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.32s ease;
    }
    #vw-panel.is-open {
      opacity: 1;
      pointer-events: all;
    }

    #vw-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(6,6,5,0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }

    #vw-sidebar {
      position: relative;
      z-index: 1;
      width: 22rem;
      max-width: 90vw;
      height: 100%;
      background: #0e0e0c;
      border-right: 1px solid rgba(255,255,255,0.07);
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform 0.38s cubic-bezier(0.25, 0.1, 0.25, 1);
      overflow: hidden;
    }
    #vw-panel.is-open #vw-sidebar {
      transform: translateX(0);
    }

    #vw-iframe-wrap {
      position: relative;
      z-index: 1;
      flex: 1;
      background: #080807;
      transform: translateX(-2rem);
      opacity: 0;
      transition: transform 0.42s cubic-bezier(0.25, 0.1, 0.25, 1) 0.08s,
                  opacity  0.38s ease 0.08s;
      display: flex;
      flex-direction: column;
    }
    #vw-panel.is-open #vw-iframe-wrap {
      transform: translateX(0);
      opacity: 1;
    }

    /* sidebar header */
    .vw-header {
      padding: 1.4rem 1.4rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .vw-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.3rem;
    }
    .vw-title {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.58rem;
      font-weight: 300;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(232,230,220,0.35);
    }
    .vw-close {
      width: 1.4rem;
      height: 1.4rem;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.04);
      color: rgba(232,230,220,0.45);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      transition: background 0.15s, color 0.15s, transform 0.2s;
      flex-shrink: 0;
    }
    .vw-close:hover {
      background: rgba(255,255,255,0.10);
      color: rgba(232,230,220,0.90);
      transform: rotate(90deg);
    }
    .vw-project-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.3rem;
      font-weight: 300;
      color: rgba(232,230,220,0.80);
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .vw-project-name em {
      font-style: italic;
      color: rgba(232,230,220,0.45);
    }

    /* timeline */
    .vw-timeline {
      flex: 1;
      overflow-y: auto;
      padding: 1.2rem 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.08) transparent;
    }
    .vw-timeline::-webkit-scrollbar { width: 3px; }
    .vw-timeline::-webkit-scrollbar-track { background: transparent; }
    .vw-timeline::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

    .vw-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.8rem 1.4rem 0.8rem 1.4rem;
      cursor: pointer;
      transition: background 0.15s;
      border-left: 2px solid transparent;
    }
    .vw-item:hover {
      background: rgba(255,255,255,0.03);
    }
    .vw-item.active {
      border-left-color: rgba(232,230,220,0.35);
      background: rgba(255,255,255,0.04);
    }
    .vw-item.active .vw-item-badge {
      color: rgba(232,230,220,0.90);
      border-color: rgba(232,230,220,0.30);
    }

    /* spine line between items */
    .vw-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: calc(1.4rem + 0.28rem); /* alinha com centro do dot */
      top: calc(0.8rem + 0.9rem);   /* abaixo do dot */
      bottom: -0.8rem;
      width: 1px;
      background: rgba(255,255,255,0.07);
    }

    .vw-item-spine {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.18rem;
    }
    .vw-item-dot {
      width: 0.58rem;
      height: 0.58rem;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.18);
      background: transparent;
      transition: background 0.2s, border-color 0.2s;
      flex-shrink: 0;
    }
    .vw-item.active .vw-item-dot {
      background: rgba(232,230,220,0.70);
      border-color: rgba(232,230,220,0.70);
    }
    .vw-item-latest .vw-item-dot {
      background: rgba(100,210,110,0.55);
      border-color: rgba(100,210,110,0.80);
      box-shadow: 0 0 6px rgba(100,210,110,0.30);
    }

    .vw-item-content {
      flex: 1;
      min-width: 0;
    }
    .vw-item-badge {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.58rem;
      font-weight: 300;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(232,230,220,0.32);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 999px;
      padding: 0.08rem 0.45rem;
      display: inline-block;
      margin-bottom: 0.28rem;
      transition: color 0.2s, border-color 0.2s;
    }
    .vw-item-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.0rem;
      font-weight: 400;
      color: rgba(232,230,220,0.75);
      line-height: 1.3;
      margin-bottom: 0.18rem;
    }
    .vw-item.active .vw-item-name {
      color: rgba(232,230,220,0.95);
    }
    .vw-item-desc {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.82rem;
      line-height: 1.6;
      color: rgba(232,230,220,0.32);
    }
    .vw-item-tag {
      display: inline-block;
      margin-top: 0.35rem;
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.50rem;
      font-weight: 300;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(232,230,220,0.22);
    }
    .vw-item-latest .vw-item-tag::before {
      content: '● ';
      color: rgba(100,210,110,0.60);
    }

    /* iframe area */
    .vw-iframe-header {
      padding: 0.75rem 1.2rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .vw-iframe-label {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.58rem;
      font-weight: 300;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(232,230,220,0.30);
    }
    .vw-iframe-label span {
      color: rgba(232,230,220,0.65);
    }
    .vw-open-btn {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.55rem;
      font-weight: 300;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(232,230,220,0.40);
      background: none;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 999px;
      padding: 0.2rem 0.65rem;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      text-decoration: none;
    }
    .vw-open-btn:hover {
      color: rgba(232,230,220,0.85);
      border-color: rgba(255,255,255,0.22);
    }

    #vw-iframe {
      flex: 1;
      border: none;
      display: block;
      background: #080807;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #vw-iframe.loaded { opacity: 1; }

    .vw-iframe-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.8rem;
    }
    .vw-iframe-placeholder p {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.60rem;
      font-weight: 300;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(232,230,220,0.18);
    }

    /* loading spinner */
    .vw-spinner {
      width: 1.2rem;
      height: 1.2rem;
      border: 1px solid rgba(255,255,255,0.08);
      border-top-color: rgba(232,230,220,0.35);
      border-radius: 50%;
      animation: vw-spin 0.9s linear infinite;
    }
    @keyframes vw-spin {
      to { transform: rotate(360deg); }
    }

    /* empty state */
    .vw-empty {
      padding: 2rem 1.4rem;
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.58rem;
      font-weight: 300;
      letter-spacing: 0.14em;
      color: rgba(232,230,220,0.20);
      text-transform: uppercase;
    }

    /* mobile */
    @media (max-width: 700px) {
      #vw-panel.is-open {
        flex-direction: column;
      }
      #vw-sidebar {
        width: 100%;
        max-width: 100%;
        height: 55vh;
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        transform: translateY(-100%);
      }
      #vw-panel.is-open #vw-sidebar {
        transform: translateY(0);
      }
      #vw-iframe-wrap {
        transform: translateY(2rem);
      }
      #vw-panel.is-open #vw-iframe-wrap {
        transform: translateY(0);
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Estrutura HTML ──────────────────────────────────────────── */
  const html = `
    <button id="vw-trigger" aria-label="Histórico de versões">
      <span class="vw-dot"></span>
      <span>versões</span>
    </button>

    <div id="vw-panel" role="dialog" aria-modal="true" aria-label="Histórico de versões">
      <div id="vw-backdrop"></div>

      <div id="vw-sidebar">
        <div class="vw-header">
          <div class="vw-header-top">
            <span class="vw-title">Histórico</span>
            <button class="vw-close" id="vw-close" aria-label="Fechar">✕</button>
          </div>
          <div class="vw-project-name" id="vw-project-name">
            Versões <em>do projeto</em>
          </div>
        </div>
        <div class="vw-timeline" id="vw-timeline">
          <div class="vw-empty">Carregando versões…</div>
        </div>
      </div>

      <div id="vw-iframe-wrap">
        <div class="vw-iframe-header">
          <span class="vw-iframe-label">Visualizando: <span id="vw-iframe-label-name">—</span></span>
          <a class="vw-open-btn" id="vw-open-btn" href="#" target="_blank">Abrir ↗</a>
        </div>
        <div class="vw-iframe-placeholder" id="vw-placeholder">
          <p>Selecione uma versão</p>
        </div>
        <iframe id="vw-iframe" src="" allow="autoplay; fullscreen" loading="lazy"></iframe>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  /* ── Referências ─────────────────────────────────────────────── */
  const trigger    = document.getElementById('vw-trigger');
  const panel      = document.getElementById('vw-panel');
  const backdrop   = document.getElementById('vw-backdrop');
  const closeBtn   = document.getElementById('vw-close');
  const timeline   = document.getElementById('vw-timeline');
  const iframe     = document.getElementById('vw-iframe');
  const placeholder = document.getElementById('vw-placeholder');
  const labelName  = document.getElementById('vw-iframe-label-name');
  const openBtn    = document.getElementById('vw-open-btn');
  const projectName = document.getElementById('vw-project-name');

  let versions = [];
  let activeIdx = null;

  /* ── Abrir / fechar ──────────────────────────────────────────── */
  function open() {
    panel.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    panel.classList.remove('is-open');
    document.body.style.overflow = '';
    // Limpa iframe depois da animação
    setTimeout(() => {
      if (!panel.classList.contains('is-open')) {
        iframe.src = '';
        iframe.classList.remove('loaded');
        placeholder.style.display = 'flex';
        iframe.style.display = 'none';
        labelName.textContent = '—';
        openBtn.href = '#';
        activeIdx = null;
        timeline.querySelectorAll('.vw-item').forEach(i => i.classList.remove('active'));
      }
    }, 400);
  }

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });

  /* ── Carregar versão no iframe ───────────────────────────────── */
  function loadVersion(idx) {
    const v = versions[idx];
    if (!v) return;

    activeIdx = idx;

    // Atualizar itens ativos
    timeline.querySelectorAll('.vw-item').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });

    // Atualizar header
    labelName.textContent = v.badge || v.name;
    openBtn.href = 'versoes/' + v.file;

    // Mostrar spinner, esconder iframe
    placeholder.innerHTML = '<div class="vw-spinner"></div>';
    placeholder.style.display = 'flex';
    iframe.style.display = 'none';
    iframe.classList.remove('loaded');

    // Carregar iframe
    iframe.onload = () => {
      placeholder.style.display = 'none';
      iframe.style.display = 'block';
      requestAnimationFrame(() => iframe.classList.add('loaded'));
    };
    iframe.src = 'versoes/' + v.file;
  }

  /* ── Montar timeline ─────────────────────────────────────────── */
  function buildTimeline(data) {
    if (data.project) {
      const parts = data.project.split(' — ');
      projectName.innerHTML = parts[0] + (parts[1] ? ` <em>— ${parts[1]}</em>` : '');
    }

    versions = data.versions || [];

    if (!versions.length) {
      timeline.innerHTML = '<div class="vw-empty">Nenhuma versão encontrada</div>';
      return;
    }

    timeline.innerHTML = '';
    versions.forEach((v, i) => {
      const isLatest = i === 0;
      const item = document.createElement('div');
      item.className = 'vw-item' + (isLatest ? ' vw-item-latest' : '');
      item.innerHTML = `
        <div class="vw-item-spine">
          <div class="vw-item-dot"></div>
        </div>
        <div class="vw-item-content">
          <span class="vw-item-badge">${v.badge || v.version}</span>
          <div class="vw-item-name">${v.name}</div>
          ${v.desc ? `<div class="vw-item-desc">${v.desc}</div>` : ''}
          <span class="vw-item-tag">${isLatest ? 'mais recente' : v.file}</span>
        </div>
      `;
      item.addEventListener('click', () => loadVersion(i));
      timeline.appendChild(item);
    });
  }

  /* ── Buscar manifesto ────────────────────────────────────────── */
  fetch(MANIFEST)
    .then(r => {
      if (!r.ok) throw new Error('manifest not found');
      return r.json();
    })
    .then(data => buildTimeline(data))
    .catch(() => {
      timeline.innerHTML = '<div class="vw-empty">versoes/index.json não encontrado</div>';
    });

})();
