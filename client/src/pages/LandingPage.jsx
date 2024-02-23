import { useContext } from "react";
import SignIn from "../components/SignIn";
import { UserContext } from "../UserContext";
import ChatRoom from "./ChatRoom";

const LandingPage = () => {
  const {username, id} = useContext(UserContext);

  console.log("Landing page: ",username);

  if (username) {
    return <ChatRoom />
  }

  return (
    <div className="container-center justify-center">
      <SignIn />
    </div>
  );
};

export default LandingPage;
