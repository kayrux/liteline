import { createContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // "undefined" means the URL will be computed from the `window.location` object
  // add a server if/when deplyed
  const URL = "https://liteline-api.azurewebsites.net";
    // process.env.NODE_ENV === "production" ? undefined : "https://liteline-api.azurewebsites.net";

  useEffect(() => {
    const newSocket = io(URL, {
      autoConnect: false,
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
