const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { setIntervalAsync } = require("set-interval-async/dynamic");
const http = require("http");
const app = express();

const options = {
  target: "http://localhost:8000", // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  router: function (req) {
    for (let port of Object.keys(onlinePorts)) {
      if (onlinePorts[port]) {
        return `http://localhost:${port}`;
      }
    }
    return "http://localhost:8000";
  },
  onProxyReq: function (proxyReq, req, res) {
    // executes on every request
    console.log("ip address: ", req.connection.remoteAddress);
  },
  onOpen: function (proxySocket) {
    // console.log("ip address: ", proxySocket.remoteAddress);
  },
};

const onlinePorts = {
  8000: false,
  8001: false,
  8002: false,
};

// Check if a port is online
async function checkPort(port) {
  return new Promise((resolve) => {
    const options = {
      host: "localhost",
      port: port,
      timeout: 2000, // Timeout for the ping request (in milliseconds)
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ port: port, online: true });
      } else {
        resolve({ port: port, online: false });
      }
    });

    req.on("error", () => {
      resolve({ port: port, online: false });
    });

    req.end();
  });
}

// Go through through all the ports and check if they are online.
async function checkAllPorts() {
  console.log("\n*******");
  for (const port of Object.keys(onlinePorts)) {
    const result = await checkPort(port);
    onlinePorts[port] = result.online;
    console.log(
      `Port ${result.port} is ${result.online ? "online" : "offline"}`
    );
  }
  console.log("*******\n");
}

// Set up periodic check every 3 seconds
setIntervalAsync(checkAllPorts, 3000);

// create the proxy
const proxy = createProxyMiddleware(options);

app.use("/", proxy);

app.listen(5000);
