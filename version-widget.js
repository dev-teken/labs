/*!
 * version-widget.js — v3.0 (Sidebar Edition)
 * Estilo: Navegação lateral esquerda integrada
 */

(function () {
  'use strict';

  // Força o navegador a buscar a versão mais recente do JSON
  const MANIFEST = './versoes/index.json?t=' + Date.now();

  /* ── Configurações de Estilo (CSS) ───────────────────────────── */
  const css = `
    :root { 
      --vw-accent: #3b82f6; 
      --vw-bg: #0e0e0c; 
      --vw-border: rgba(255,255,255,0.08); 
      --vw-font: ui-monospace, 'Cascadia Code', Menlo, Monaco, Consolas, monospace;
    }

    /* Gatilho Circular na Esquerda */
    #vw-trigger {
      position: fixed;
      left: 1.2rem;
      bottom: 1.2rem;
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
      color: #666;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    #vw-trigger:hover { color: #fff; transform: scale(1.1); border-color: rgba(255,255,255,0.2); }
    #vw-trigger.active { opacity: 0; pointer-events: none; transform: translateX(-20px); }

    /* Painel Lateral (Sidebar) */
    #vw-sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: 280px;
      background: var(--vw-bg);
      border-right: 1px solid var(--vw-border);
      z-index: 2147483646;
      transform: translateX(-100%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      font-family: var(--vw-font);
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
    #vw-close { cursor: pointer; color: #444; font-size: 1.2rem; transition: color 0.2s; }
    #vw-close:hover { color: #fff; }

    /* Lista de Versões */
    #vw-list { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
    .vw-item {
      padding: 0.8rem 1.5rem;
      cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
    }
    .vw-item:hover { background: rgba(255,255,255,0.03); }
    .vw-item.active { 
      background: rgba(59,130,246,0.08); 
      border-left: 3px solid var(--vw-accent);
    }
    .vw-item-badge { font-size: 0.6rem; color: var(--vw-accent); margin-bottom: 2px; font-weight: bold; }
    .vw-item-name { color: #999; font-size: 0.85rem; }
    .vw-item.active .vw-item-name { color: #fff; }

    /* Visualizador Principal (Iframe) */
    #vw-main {
      position: fixed;
      inset: 0;
      z-index: 2147483640;
      background: #000;
      transition: padding-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #vw-main.sidebar-open { padding-left: 280px; }
    #vw-iframe { width: 100%; height: 100%; border: none; background: #fff; }
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ── Estrutura HTML ────────────────────────────────────────── */
  const trigger = document.createElement('div');
  trigger.id = 'vw-trigger';
  trigger.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>`;

  const sidebar = document.createElement('div');
  sidebar.id = 'vw-sidebar';
  sidebar.innerHTML = `
    <div id="vw-header">
      <span id="vw-title">VERSÕES</span>
      <div id="vw-close">×</div>
    </div>
    <div id="vw-list"></div>
  `;

  const main = document.createElement('div');
  main.id = 'vw-main';
  main.innerHTML = `<iframe id="vw-iframe" src="about:blank"></iframe>`;

  document.body.appendChild(trigger);
  document.body.appendChild(sidebar);
  document.body.appendChild(main);

  const listContainer = sidebar.querySelector('#vw-list');
  const iframe = main.querySelector('#vw-iframe');

  /* ── Funções de Navegação ────────────────────────────────────── */
  const openUI = () => {
    sidebar.classList.add('open');
    main.classList.add('sidebar-open');
    trigger.classList.add('active');
  };

  const closeUI = () => {
    sidebar.classList.remove('open');
    main.classList.remove('sidebar-open');
    trigger.classList.remove('active');
  };

  trigger.onclick = openUI;
  sidebar.querySelector('#vw-close').onclick = closeUI;

function loadVersion(v, element) {
    document.querySelectorAll('.vw-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // encodeURI limpa espaços e caracteres especiais para o formato que o navegador entende
    const fileNameSafe = encodeURI(v.file);
    const path = './versoes/' + fileNameSafe;
    
    if (iframe.src.indexOf(fileNameSafe) === -1) {
        iframe.src = path;
    }
}
 

  /* ── Inicialização ───────────────────────────────────────────── */
  fetch(MANIFEST)
    .then(r => r.json())
    .then(data => {
      document.getElementById('vw-title').textContent = data.project || 'LABS';
      
      data.versions.forEach((v, i) => {
        const item = document.createElement('div');
        item.className = 'vw-item';
        item.innerHTML = `
          <span class="vw-item-badge">${v.badge || v.version}</span>
          <span class="vw-item-name">${v.name}</span>
        `;
        
        item.onclick = () => loadVersion(v, item);
        listContainer.appendChild(item);
        
        // Carrega a primeira versão por padrão
        if (i === 0) {
            item.classList.add('active');
            iframe.src = './versoes/' + v.file;
        }
      });
    })
    .catch(err => console.error('Erro ao carregar versões:', err));

})();