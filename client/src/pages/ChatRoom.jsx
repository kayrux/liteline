import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";
import Chatbox from "../components/chatbox/Chatbox";
import RightSidebar from "../components/sidebars/RightSidebar";
import LeftSidebar from "../components/sidebars/LeftSidebar";
import { useGetUserQuery } from "../store/user/userApiSlice";
import { setUserInfo } from "../store/user/userSlice";

const ChatRoom = () => {
  const [skip, setSkip] = useState(true);
  const { userInfo } = useSelector((state) => state.user);
  const { roomInfo } = useSelector((state) => state.room);
  const { data, isGetUserLoading } = useGetUserQuery(null, {
    skip,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGetUserLoading && data) {
      dispatch(setUserInfo({ ...data }));
    }
  }, [data, isGetUserLoading, dispatch]);

  useEffect(() => {
    if (!userInfo) {
      setSkip(true);
    }
    setSkip(false);
  }, [userInfo]);

  useEffect(() => {
    if (!roomInfo) {
      navigate("/chatroom");
    }
  }, [roomInfo, navigate]);

  return (
    <div className="container-center flex-row justify-between">
      {/* Left Sidebar */}
      <LeftSidebar />

      <Divider orientation="vertical" flexItem />

      <div className="flex flex-col w-4/5 min-w-fit h-full items-center">
        <div className="flex border-b-2 w-full h-16 justify-center items-center">
          {roomInfo && roomInfo.roomName}
        </div>

        <div className="flex flex-row w-full h-full max-h-full max-w-full">
          {roomInfo && <Chatbox />}
        </div>
      </div>

      <Divider orientation="vertical" flexItem />

      {/* Right Sidebar */}
      {roomInfo && <RightSidebar />}
    </div>
  );
};

export default ChatRoom;
