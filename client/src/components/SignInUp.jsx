import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

const defaultFormFields = {
  username: "",
  password: "",
};

const SignInUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setisSignIn] = useState("signup");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const endpoint = isSignIn === "signup" ? "signup" : "signin";
    const { data } = await axios.post(endpoint, { username, password });
    console.log("Sign: ", data);
    if (isSignIn == "signup" && data === "user exists") {
      setMessage("User already exists.");
    } else if (isSignIn == "signin" && data === "no user") {
      setMessage("User doesn't exist.")
    } else {
      setLoggedInUsername(username);
      setId(data.id);
    }
  }

  return (
    <div className="pt-3 pb-5 px-4">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          type="text"
          required
          onChange={(e) => setUsername(e.target.value)}
          name="username"
          value={username}
          variant="outlined"
        />

        <TextField
          label="Password"
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          value={password}
          variant="outlined"
        />
        
        <Button
          type="submit"
          color="secondary"
          variant="contained"
          className="m-1"
        >
          {isSignIn === "signin" ? "Sign in" : "Sign Up"}
        </Button>
        <div className="text-center mt-2">
          {isSignIn === "signup" && (
            <div>
              Already a member?&nbsp;
              <button
                onClick={() => {
                  setisSignIn("signin");
                  setMessage("");
                }}
              >
                Sign in
              </button>
            </div>
          )}
          {isSignIn === "signin" && (
            <div>
              Don't have an account?&nbsp;
              <button
                onClick={() => {
                  setisSignIn("signup");
                  setMessage("");
                }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
        <div className="text-sm text-rose-700 text-center">{message}</div>
      </form>
    </div>
  );
};

export default SignInUp;
