module.exports = {
  apps: [
    {
      name: "pocketbase",
      script: "./pocketbase/bin/pocketbase",
      args: "serve --http 0.0.0.0:8090",
    },
    {
      name: "nodejs-app",
      script: "node",
      args: "server.cjs",
    },
  ],
};
