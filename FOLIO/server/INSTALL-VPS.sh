# folio-snap — Instalação no VPS
# Execute cada bloco no terminal SSH como usuário deploy

# ── 1. CRIA DIRETÓRIOS ────────────────────────────────────────
sudo mkdir -p /var/www/folio-snap
sudo mkdir -p /var/www/folio-screenshots
sudo chown deploy:deploy /var/www/folio-snap
sudo chown deploy:deploy /var/www/folio-screenshots

# ── 2. INSTALA DEPENDÊNCIAS ───────────────────────────────────
cd /var/www/folio-snap
npm init -y
npm install puppeteer

# Puppeteer baixa o Chromium automaticamente (~170MB)
# Se demorar, é normal.

# ── 3. SOBE O SERVIÇO ─────────────────────────────────────────
# Copia os arquivos para o servidor:
#
#   scp snap-service.js deploy@191.252.93.74:/var/www/folio-snap/
#   scp ecosystem.snap.config.js deploy@191.252.93.74:/var/www/folio-snap/
#
# Depois no SSH, edita as variáveis:

cd /var/www/folio-snap
nano ecosystem.snap.config.js
# Mude: SNAP_TOKEN → string secreta (ex: rode: openssl rand -hex 16)
# Mude: SNAP_BASE  → https://SEU_USUARIO.github.io/labs

pm2 start ecosystem.snap.config.js
pm2 save
pm2 startup   # copia e cola o comando que ele gerar

# Verifica:
pm2 status
curl http://127.0.0.1:3099/health   # deve retornar: ok

# ── 4. NGINX ──────────────────────────────────────────────────
sudo nano /etc/nginx/sites-available/default
# Cola dentro do bloco server {} (antes do último }):

# location /screenshots/ {
#     alias /var/www/folio-screenshots/;
#     expires 5m;
#     add_header Cache-Control "public, max-age=300";
#     add_header Access-Control-Allow-Origin "*";
#     add_header X-Robots-Tag "noindex";
#     try_files $uri =404;
# }
#
# location /snap {
#     proxy_pass         http://127.0.0.1:3099;
#     proxy_http_version 1.1;
#     proxy_set_header   Host $host;
#     proxy_read_timeout 120s;
# }

sudo nginx -t && sudo systemctl reload nginx

# ── 5. TESTE FINAL ────────────────────────────────────────────
# Dispara captura de todos os labs:
curl "http://191.252.93.74/snap?token=SEU_TOKEN"

# Aguarda ~5s e verifica:
curl -I "http://191.252.93.74/screenshots/soul-gradient.jpg"
# → HTTP/1.1 200 OK

# ── 6. DIA A DIA ─────────────────────────────────────────────
# Atualizou uma app no GitHub Pages? Rode:
curl "http://191.252.93.74/snap?token=SEU_TOKEN&lab=soul-gradient"
# Screenshot novo em ~5s. Portfolio já exibe.

# Logs:
pm2 logs folio-snap --lines 30 --nostream
