import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SignOut from "../components/authenticator/Signout";
import CreateRoom from "../components/popups/CreateRoom";
import JoinRoom from "../components/popups/JoinRoom";

const ChatLobby = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Make sure only logged in user can visit this page
  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, []);

  return (
    <div className="container-center justify-center">
      <div className="flex flex-col gap-5 border-2 w-[75%] sm:max-w-md rounded-xl px-8 py-12 sm:p-12">
        <JoinRoom />
        <CreateRoom />
        <SignOut />
      </div>
    </div>
  );
};

export default ChatLobby;
