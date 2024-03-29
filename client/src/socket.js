import io from "socket.io-client";
const serverUrl = process.env.SERVER_URL;
const socket = io(serverUrl, {
  autoConnect: false,
  withCredentials: true,
});
export default socket;
