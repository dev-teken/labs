/*!
 * version-widget.js — v2.0 (Otimizado)
 * Foco: Carregamento instantâneo e bypass de cache
 */

(function () {
  'use strict';

  // O "?t=" + Date.now() impede que o navegador use uma versão velha do JSON
  const MANIFEST = 'versoes/index.json?t=' + Date.now();

  /* ── Injetar CSS Otimizado ───────────────────────────────────── */
  const css = `
    #vw-trigger {
      position: fixed;
      bottom: 1.6rem;
      right: 1.6rem;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      background: rgba(14,14,12,0.85);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all 0.2s ease;
      /* Fonte nativa para evitar delay de download */
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
      color: #fff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      user-select: none;
    }
    #vw-trigger:hover {
      background: rgba(25,25,22,0.95);
      transform: translateY(-2px);
      border-color: rgba(255,255,255,0.25);
    }
    #vw-trigger svg { opacity: 0.7; }
    #vw-count {
      background: #3b82f6;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 6px;
      min-width: 1.2rem;
      text-align: center;
    }
    #vw-panel {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      display: none;
      background: rgba(7,7,5,0.6);
      backdrop-filter: blur(4px);
      justify-content: flex-end;
    }
    #vw-panel.vw-open { display: flex; }
    #vw-sidebar {
      width: 100%;
      max-width: 340px;
      background: #0e0e0c;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-left: 1px solid rgba(255,255,255,0.08);
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
      animation: vw-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes vw-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    #vw-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    #vw-project-name { font-size: 0.9rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    #vw-timeline {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }
    .vw-item {
      padding: 1rem 1.5rem;
      cursor: pointer;
      display: flex;
      gap: 1rem;
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .vw-item:hover { background: rgba(255,255,255,0.03); }
    .vw-item-badge {
      font-size: 0.65rem;
      background: rgba(255,255,255,0.08);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: #aaa;
    }
    .vw-item-name { color: #eee; font-size: 0.95rem; margin-top: 0.3rem; font-weight: 500; }
    
    #vw-viewer {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: #000;
      display: none;
      flex-direction: column;
    }
    #vw-viewer.vw-active { display: flex; }
    #vw-viewer-bar {
      height: 44px;
      background: #111;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      justify-content: space-between;
      border-bottom: 1px solid #222;
    }
    #vw-iframe { border: none; flex: 1; background: #fff; }
    .vw-close-btn { color: #888; cursor: pointer; font-size: 0.8rem; border: 1px solid #333; padding: 4px 10px; border-radius: 4px; }
    .vw-close-btn:hover { color: #fff; background: #222; }
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ── Elementos da UI ─────────────────────────────────────────── */
  const trigger = document.createElement('div');
  trigger.id = 'vw-trigger';
  trigger.style.display = 'none'; // Escondido até carregar
  trigger.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
    <span>Labs</span>
    <span id="vw-count">0</span>
  `;

  const panel = document.createElement('div');
  panel.id = 'vw-panel';
  panel.innerHTML = `
    <div id="vw-sidebar">
      <div id="vw-header">
        <div id="vw-project-name">Carregando...</div>
      </div>
      <div id="vw-timeline"></div>
    </div>
  `;

  const viewer = document.createElement('div');
  viewer.id = 'vw-viewer';
  viewer.innerHTML = `
    <div id="vw-viewer-bar">
      <span id="vw-current-ver" style="color:#aaa; font-size:0.8rem; font-family:monospace;"></span>
      <div class="vw-close-btn" id="vw-close-viewer">Fechar Visualização</div>
    </div>
    <iframe id="vw-iframe"></iframe>
  `;

  document.body.appendChild(trigger);
  document.body.appendChild(panel);
  document.body.appendChild(viewer);

  const timeline = panel.querySelector('#vw-timeline');
  const projDisplay = panel.querySelector('#vw-project-name');
  const iframe = viewer.querySelector('#vw-iframe');
  const verDisplay = viewer.querySelector('#vw-current-ver');

  let versions = [];

  /* ── Lógica de Ações ─────────────────────────────────────────── */
  trigger.onclick = () => panel.classList.add('vw-open');
  panel.onclick = (e) => { if(e.target === panel) panel.classList.remove('vw-open'); };
  
  document.getElementById('vw-close-viewer').onclick = () => {
    viewer.classList.remove('vw-active');
    iframe.src = 'about:blank';
  };

  function loadVersion(index) {
    const v = versions[index];
    verDisplay.textContent = v.badge || v.version;
    iframe.src = 'versoes/' + v.file;
    viewer.classList.add('vw-active');
    panel.classList.remove('vw-open');
  }

  /* ── Fetch do Manifesto ──────────────────────────────────────── */
  fetch(MANIFEST)
    .then(r => r.json())
    .then(data => {
      projDisplay.textContent = data.project || 'LABS';
      versions = data.versions || [];
      document.getElementById('vw-count').textContent = versions.length;
      
      timeline.innerHTML = '';
      versions.forEach((v, i) => {
        const item = document.createElement('div');
        item.className = 'vw-item';
        item.innerHTML = `
          <div>
            <div class="vw-item-badge">${v.badge || v.version}</div>
            <div class="vw-item-name">${v.name}</div>
          </div>
        `;
        item.onclick = () => loadVersion(i);
        timeline.appendChild(item);
      });
      
      trigger.style.display = 'flex';
    })
    .catch(err => console.error('Erro ao carregar versões:', err));

})();