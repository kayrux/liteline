const express = require("express");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Create express app
const app = express();

// Queue class
class Queue {
  constructor() {
    this.items = [];
    this.frontIndex = 0;
    this.backIndex = 0;
  }
  enqueue(item) {
    this.items[this.backIndex] = item;
    this.backIndex++;
    return item + " inserted";
  }
  dequeue() {
    const item = this.items[this.frontIndex];
    delete this.items[this.frontIndex];
    this.frontIndex++;
    return item;
  }
  peek() {
    return this.items[this.frontIndex];
  }
  size() {
    return this.backIndex - this.frontIndex;
  }
  get printQueue() {
    return this.items;
  }
}

// Get server list from environment variable
const serverList = process.env.EXPRESS_SERVERS?.split(" ");

// Create a queue of servers
const allServers = new Queue();
if (serverList) {
  for (const server of serverList) {
    allServers.enqueue(server);
  }
}

// Check if there is at least one healthy server
let hasHealthyServer = false;

// Check server health
const checkHealthyServers = async () => {
  console.log("\n*******************");
  // Loop by queue size
  for (let i = 0; i < allServers.size(); i++) {
    try {
      // Check health of the server
      await axios.get(allServers.peek() + "/health");
      hasHealthyServer = true;
      console.log("Healthy: ", allServers.peek());
      break;
    } catch (error) {
      // If server is not healthy, move it to the end of the queue
      let inactive = allServers.dequeue();
      allServers.enqueue(inactive);
    }
  }

  if (hasHealthyServer) return;
  hasHealthyServer = false;
  console.log("No healthy servers");
  console.log("\n*******************");
};

// Route to get the current server
const reRoute = (req, res) => {
  return allServers.peek();
};

// Proxy options
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

      if (!hasHealthyServer) {
        proxyReq.end();
        return res.status(500).send({
          message: "No healthy servers",
        });
      }
      // console.log("Current server - http: ", allServers.peek());
    },
    proxyReqWs: (proxyReq, req, socket, options, head) => {
      /* handle proxyReq */
      console.log("on proxyReqWs", req.url);
      if (!hasHealthyServer) {
        console.log("No healthy servers - proxyReqWs");
      }
      // console.log("Current server - ws: ", allServers.peek());
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

// Create proxy middleware
const proxyMiddleware = createProxyMiddleware(proxyOptions);

// Use proxy middleware
app.use(proxyMiddleware);

// Initial health check
checkHealthyServers();
// Update health periodically
setInterval(checkHealthyServers, 10000);

// Start server, listening on port 5000
app.listen(5000);
