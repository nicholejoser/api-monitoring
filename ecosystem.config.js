module.exports = {
  apps: [
    {
      name: "dcs",
      cwd: "/var/www/api-monitoring",
      script: "npm",
      args: "start -- -H 127.0.0.1 -p 3000",

      env: {
        NODE_ENV: "production",
        NODE_TLS_REJECT_UNAUTHORIZED: "0",
      },

      autorestart: true,
      restart_delay: 5000,
      watch: false,
    },
  ],
};
