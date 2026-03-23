/*!
 * version-widget.js — v3.0 (Sidebar Edition)
 * Estilo: Minimalista, Ancorado à Esquerda
 */

(function () {
  'use strict';

  const MANIFEST = './versoes/index.json?t=' + Date.now();

  /* ── Injetar CSS v3 (Sidebar) ────────────────────────────────── */
  const css = `
    :root { --vw-accent: #3b82f6; --vw-bg: #0e0e0c; --vw-border: rgba(255,255,255,0.08); }

    /* Gatilho Discreto na Esquerda */
    #vw-trigger {
      position: fixed;
      left: 1rem;
      bottom: 1rem;
      z-index: 2147483647;
      width: 2.8rem;
      height: 2.8rem;
      background: var(--vw-bg);
      border: 1px solid var(--vw-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #888;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    #vw-trigger:hover { color: #fff; transform: scale(1.1); border-color: rgba(255,255,255,0.2); }
    #vw-trigger.active { left: 260px; transform: rotate(90deg); opacity: 0; pointer-events: none; }

    /* Sidebar de Navegação */
    #vw-sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: 280px;
      background: var(--vw-bg);
      border-right: 1px solid var(--vw-border);
      z-index: 2147483646;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      font-family: ui-monospace, monospace;
    }
    #vw-sidebar.open { transform: translateX(0); }

    #vw-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--vw-border);
    }
    #vw-header span { font-size: 0.7rem; color: #555; text-transform: uppercase; letter-spacing: 0.1em; }
    #vw-close-sidebar { cursor: pointer; color: #555; font-size: 1.2rem; }
    #vw-close-sidebar:hover { color: #fff; }

    #vw-list { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
    .vw-item {
      padding: 0.8rem 1.5rem;
      cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      transition: all 0.2s;
    }
    .vw-item:hover { background: rgba(255,255,255,0.03); }
    .vw-item.active { border-left: 3px solid var(--vw-accent); background: rgba(59,130,246,0.05); }
    .vw-item-badge { font-size: 0.6rem; color: var(--vw-accent); display: block; margin-bottom: 2px; }
    .vw-item-name { color: #ccc; font-size: 0.85rem; }

    /* Área do Iframe (Ocupa o resto da tela) */
    #vw-main-viewer {
      position: fixed;
      inset: 0;
      z-index: 2147483640;
      background: #000;
      transition: padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #vw-main-viewer.sidebar-open { padding-left: 280px; }
    #vw-iframe { width: 100%; height: 100%; border: none; background: #fff; }
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ── Elementos da UI ─────────────────────────────────────────── */
  const trigger = document.createElement('div');
  trigger.id = 'vw-trigger';
  trigger.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><rect width="20" height="8" x="2" y="14" rx="2"/></svg>`;

  const sidebar = document.createElement('div');
  sidebar.id = 'vw-sidebar';
  sidebar.innerHTML = `
    <div id="vw-header">
      <span id="vw-proj-title">Versions</span>
      <div id="vw-close-sidebar">×</div>
    </div>
    <div id="vw-list"></div>
  `;

  const viewer = document.createElement('div');
  viewer.id = 'vw-main-viewer';
  viewer.innerHTML = `<iframe id="vw-iframe" src="about:blank"></iframe>`;

  document.body.appendChild(trigger);
  document.body.appendChild(sidebar);
  document.body.appendChild(viewer);

  const listContainer = sidebar.querySelector('#vw-list');
  const iframe = viewer.querySelector('#vw-iframe');

  /* ── Lógica ─────────────────────────────────────────────────── */
  const openSidebar = () => {
    sidebar.classList.add('open');
    viewer.classList.add('sidebar-open');
    trigger.classList.add('active');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    viewer.classList.remove('sidebar-open');
    trigger.classList.remove('active');
  };

  trigger.onclick = openSidebar;
  sidebar.querySelector('#vw-close-sidebar').onclick = closeSidebar;

  function loadVersion(v, element) {
    // Marcar ativo na lista
    document.querySelectorAll('.vw-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // Atualizar Iframe
    iframe.src = './versoes/' + v.file;
  }

  fetch(MANIFEST)
    .then(r => r.json())
    .then(data => {
      document.getElementById('vw-proj-title').textContent = data.project || 'LABS';
      
      data.versions.forEach((v, i) => {
        const item = document.createElement('div');
        item.className = 'vw-item';
        if (i === 0) item.classList.add('active'); // Primeira versão ativa por padrão

        item.innerHTML = `
          <span class="vw-item-badge">${v.badge || v.version}</span>
          <span class="vw-item-name">${v.name}</span>
        `;
        
        item.onclick = () => loadVersion(v, item);
        listContainer.appendChild(item);
        
        // Carrega a primeira versão automaticamente ao iniciar
        if (i === 0) iframe.src = './versoes/' + v.file;
      });
    });

})();