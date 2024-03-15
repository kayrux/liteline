import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useLoginMutation } from "../../store/user/userApiSlice";
import { setUserInfo } from "../../store/user/userSlice";

const defaultFormFields = {
  username: "",
  password: "",
};

const SignIn = () => {
  const [userCredential, setUserCredential] = useState(defaultFormFields);
  const [message, setMessage] = useState("");
  const { username, password } = userCredential;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const resetFormFields = () => {
    setUserCredential(defaultFormFields);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUserCredential({ ...userCredential, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await login({ username, password }).unwrap();
      dispatch(setUserInfo({ ...res }));
      navigate("/chatroom");
    } catch (err) {
      setMessage(err?.data?.message || err.error);
    }

    resetFormFields();
  };

  return (
    <div className="pt-3 pb-5 px-4">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          type="text"
          required
          onChange={handleChange}
          name="username"
          value={username}
          variant="outlined"
        />

        <TextField
          label="Password"
          type="password"
          required
          onChange={handleChange}
          name="password"
          value={password}
          variant="outlined"
        />
        <div className="text-sm text-rose-700">{message}</div>
        <Button
          type="submit"
          color="secondary"
          variant="contained"
          className="m-1"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
