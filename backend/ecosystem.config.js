module.exports = {
  apps: [{
    name: "eskraft-backend",
    script: "./server.js",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    cwd: __dirname,
    env: { NODE_ENV: "production" },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    autorestart: true,
    max_restarts: 10,
    restart_delay: 3000,
    max_memory_restart: "300M"
  }]
};
