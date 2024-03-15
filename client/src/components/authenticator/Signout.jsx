import { Fragment } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { useLogoutMutation } from "../../store/user/userApiSlice";
import { logout } from "../../store/user/userSlice";
import { apiSlice } from "../../store/apiSlice";
import { setRoomInfo } from "../../store/room/roomSlice";

const SignOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const onLogout = async () => {
    try {
      dispatch(logout());
      dispatch(setRoomInfo(null));
      await logoutApi();
      // Clear the redux cache on logout to make way for a new user session
      // dispatch(apiSlice.util.resetApiState());
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Fragment>
      <Button color="error" variant="contained" onClick={onLogout}>
        Logout
      </Button>
    </Fragment>
  );
};

export default SignOut;
