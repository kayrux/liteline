import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setisSignIn] = useState("signup");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();
    const endpoint = isSignIn === "signup" ? "signup" : "signin";
    const { data } = await axios.post(endpoint, { username, password });
    setLoggedInUsername(username);
    console.log("user data: ", data);
    setId(data.id);
  }

  return (
    <div className="bg-blue-50 h-screen w-full flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isSignIn === "signin" ? "Sign in" : "Sign Up"}
        </button>
        <div className="text-center mt-2">
          {isSignIn === "signup" && (
            <div>
              Already a member?&nbsp;
              <button onClick={() => setisSignIn("signin")}>
                Sign in
              </button>
            </div>
          )}
          {isSignIn === "signin" && (
            <div>
              Don't have an account?&nbsp;
              <button onClick={() => setisSignIn("signup")}>
                Sign up
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
