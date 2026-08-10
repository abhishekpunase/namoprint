/** PM2 production process file — run from project root: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'printingwatch',
      cwd: './backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
