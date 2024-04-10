const express = require("express");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const allServers = [
  "http://localhost:8000",
  "http://localhost:8001",
  // "https://liteline.onrender.com",
  // "https://liteline-api01.onrender.com",
  // "https://liteline-api02-test.onrender.com",
];

const healthyServers = new Set();
let currentServer = 0;
let serverChanged = false;

const checkHealthyServers = async () => {
  for (const server of allServers) {
    try {
      await axios.get(server + "/health");
      // update health list
      console.log("Healthy: ", server);
      healthyServers.add(server);
    } catch (error) {
      console.log("Server unhealthy: ", server);
      healthyServers.delete(server);
    }
  }

  if (healthyServers.size <= 0) {
    console.log("No healthy servers");
  } else {
    checkCurrentServer();
  }
};

const checkCurrentServer = () => {
  // check current server health
  if (!healthyServers.has(allServers[currentServer])) {
    // find next healthy server
    for (let i = 0; i < allServers.length; i++) {
      const nextServer = (currentServer + i) % allServers.length;
      if (healthyServers.has(allServers[nextServer])) {
        currentServer = nextServer;
        console.log("Current server changed to: ", allServers[currentServer]);
        serverChanged = true;
        break;
      }
    }
  }
};

const reRoute = (req, res) => {
  return allServers[currentServer];
};

const proxyOptions = {
  target: "",
  changeOrigin: true,
  ws: true,
  secure: true,
  router: reRoute,
  on: {
    proxyReq: (proxyReq, req, res) => {
      /* handle proxyReq */
      console.log("on proxyReq", req.url);

      if (healthyServers.size === 0) {
        proxyReq.end();
        return res.status(500).send({
          message: "No healthy servers",
        });
      }

      console.log("Healthy servers - http: ", healthyServers.size);
      console.log("Current server - http: ", allServers[currentServer]);
    },
    proxyReqWs: (proxyReq, req, socket, options, head) => {
      /* handle proxyReq */
      console.log("on proxyReqWs", req.url);
      if (healthyServers.size === 0) {
        console.log("No healthy servers - proxyReqWs");
      }
      if (serverChanged) {
        console.log("Current server changed - ws: ", allServers[currentServer]);
        socket.emit("online");
        serverChanged = false;
      }
      console.log("Healthy servers - ws: ", healthyServers.size);
      console.log("Current server - ws: ", allServers[currentServer]);
    },
    proxyRes: (proxyRes, req, res) => {
      /* handle proxyRes */
      console.log("on proxyRes", proxyRes.statusCode);
    },
    error: async (err, req, res) => {
      /* handle error */
      console.log("on error", err.code);
      await checkHealthyServers();
    },
  },
};

const proxyMiddleware = createProxyMiddleware(proxyOptions);

app.use(proxyMiddleware);

// Update health periodically
setInterval(checkHealthyServers, 10000);

app.listen(5000);
