import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import axios from "axios";
import { UserContextProvider } from "./UserContext";

const App = () => {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  return (
    <div className="relative min-h-screen">
        <UserContextProvider>
          <LandingPage />
        </UserContextProvider>
        {/* <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/chatroom/*" element={<ChatPage />}></Route>
        </Routes> */}
    </div>
  );
};

export default App;
