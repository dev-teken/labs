// ecosystem.snap.config.js
// Rodar com: pm2 start ecosystem.snap.config.js

module.exports = {
  apps: [
    {
      name:   'folio-snap',
      script: '/var/www/folio-snap/snap-service.js',
      env: {
        SNAP_TOKEN: 'troque-este-token-agora',   // ← MUDE ISSO
        SNAP_DIR:   '/var/www/folio-screenshots',
        SNAP_BASE:  'https://SEU_USUARIO.github.io/labs',  // ← MUDE ISSO
      },
      // reinicia se crashar
      autorestart:     true,
      watch:           false,
      max_memory_restart: '300M',
      // logs
      out_file:  '/var/log/folio-snap-out.log',
      error_file: '/var/log/folio-snap-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
