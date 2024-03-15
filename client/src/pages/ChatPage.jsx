import { Routes, Route } from "react-router-dom";

import ChatRoom from "./ChatRoom";

const ChatPage = () => {
  return (
    <Routes>
      <Route index element={<ChatRoom />} />
      <Route path=":roomCode" element={<ChatRoom />} />
    </Routes>
  );
};

export default ChatPage;
