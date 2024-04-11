import io from "socket.io-client";

const socket = io(process.env.REACT_APP_Proxy_EndPoint, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
