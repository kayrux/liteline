import { useContext } from "react";
import { UserContext } from "../UserContext";
import ChatRoom from "./ChatRoom";
import SignInUp from "../components/SignInUp";

const LandingPage = () => {
  const {username, id} = useContext(UserContext);

  console.log("Landing page: ",username);

  if (username) {
    return <ChatRoom />
  }

  return (
    <div className="container-center justify-center">
      <SignInUp />
      {/* <SignIn /> */}
    </div>
  );
};

export default LandingPage;
