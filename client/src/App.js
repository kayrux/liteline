import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
// import axios from "axios";

const App = () => {
  // axios.defaults.baseURL = "http://localhost:5000/api";
  // axios.defaults.withCredentials = true;

  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/chatroom/*" element={<ChatPage />}></Route>
      </Routes>
    </div>
  );
};

export default App;
