module.exports = {
  apps: [
    {
      name: "dcs",
      cwd: "/var/www/api-monitoring",
      script: "npm",
      args: "start",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      autorestart: true,
      restart_delay: 5000,
      watch: false,
    },
  ],
};
