const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { setIntervalAsync } = require("set-interval-async/dynamic");
const http = require("http");
const https = require("https");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

// const SERVER_URL = process.env.SERVER_URL || "http://localhost";
// const PORT = process.env.PRIMARY_PORT || "8000";

// const localOptions = {
//   protocol: "https:",
//   target: `${SERVER_URL}:${PORT}`, // target host
//   changeOrigin: true, // needed for virtual hosted sites
//   ws: true, // proxy websockets
//   router: function (req) {
//     for (let port of Object.keys(onlinePorts)) {
//       if (onlinePorts[port]) {
//         return `${SERVER_URL}:${port}`;
//       }
//     }
//     return `${SERVER_URL}:${PORT}`;
//   },
//   onProxyReq: function (proxyReq, req, res) {
//     // executes on every request
//     console.log("ip address: ", req.connection.remoteAddress);
//   },
//   onOpen: function (proxySocket) {
//     console.log("ip address: ", proxySocket.remoteAddress);
//   },
// };
const expressServers = process.env.EXPRESS_SERVERS.split(" ");
const CLIENT_PORT = process.env.CLIENT_PORT || 5000;
const HEALTH_CHECK_INTERVAL = process.env.HEALTH_CHECK_INTERVAL || 5000;

const onlineServers = expressServers.reduce((acc, server) => {
  return { ...acc, [server]: false };
}, []);

const options = {
  changeOrigin: true, // needed for virtual hosted sites
  protocol: "https:",
  ws: true, // proxy websockets
  router: function (req) {
    console.log("Req url: ", req.url);
    for (let server of Object.keys(onlineServers)) {
      if (onlineServers[server]) {
        return {
          protocol: "https:", // The : is required
          host: server,
          port: 443,
        };
      }
    }
    return {
      protocol: "https:",
      host: "liteline-532q.onrender.com", // Default
      port: 443, // Default
    };
  },
  onProxyReq: function (proxyReq, req, res) {
    // executes on every request
    // console.log("\nPROXY REQUEST");
    // console.log("ip address: ", req.connection.remoteAddress);
    console.log("Proxy request target:", proxyReq._headers.host);
  },
  onOpen: function (proxySocket) {
    // console.log("\nON OPEN");
    // console.log("ip address: ", proxySocket.remoteAddress);
    console.log("Proxy socket target:", proxySocket._headers.host);
  },
  upgrade: function (req, socket, head) {
    console.log("upgrade");
    proxy.ws(req, socket, head);
  },
};

const onlinePorts = {
  8000: false,
  8001: false,
  8002: false,
};

async function checkServer(server) {
  return new Promise((resolve) => {
    const options = {
      protocol: "https:",
      host: server,
      path: "/health",
      timeout: 2000, // Timeout for the ping request (in milliseconds)
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ server: server, online: true });
      } else {
        resolve({ server: server, online: false });
      }
    });

    req.on("error", () => {
      resolve({ server: server, online: false });
    });

    req.end();
  });
}

async function checkAllServers() {
  console.log("\n*******");
  for (const server of Object.keys(onlineServers)) {
    const result = await checkServer(server);
    onlineServers[server] = result.online;
    console.log(
      `Server ${result.server} is ${result.online ? "online" : "offline"}`
    );
  }
  console.log("*******\n");
}

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
// async function checkAllPorts() {
//   console.log("\n*******");
//   for (const port of Object.keys(onlinePorts)) {
//     const result = await checkPort(port);
//     onlinePorts[port] = result.online;
//     console.log(
//       `Port ${result.port} is ${result.online ? "online" : "offline"}`
//     );
//   }
//   console.log("*******\n");
// }

// Set up periodic check every 3 seconds
setIntervalAsync(checkAllServers, HEALTH_CHECK_INTERVAL);

// create the proxy
const proxy = createProxyMiddleware(options);

app.use("/", proxy);

app.listen(CLIENT_PORT);
