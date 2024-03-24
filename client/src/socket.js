import io from "socket.io-client";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
const socket = io(serverUrl, {
  autoConnect: false,
  withCredentials: true,
});
export default socket;
