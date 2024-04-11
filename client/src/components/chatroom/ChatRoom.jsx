import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Divider from "@mui/material/Divider";
import Chatbox from "../chatbox/Chatbox";
import RightSidebar from "../sidebars/RightSidebar";
import Loader from "../loader/Loader";
import { useGetRoomQuery } from "../../store/room/roomApiSlice";
import { setRoomInfo } from "../../store/room/roomSlice";

const ChatRoom = () => {
  const { roomInfo } = useSelector((state) => state.room);
  const { data, isGetRoomLoading } = useGetRoomQuery(roomInfo.roomCode, {
    skip: roomInfo === null,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isGetRoomLoading && data && data.roomCode === roomInfo.roomCode) {
      console.log("fetching room", roomInfo.roomCode);
      dispatch(setRoomInfo({ ...data }));
    }
  }, [data, isGetRoomLoading, roomInfo.roomCode]);

  if (isGetRoomLoading) {
    return <Loader isLoading={isGetRoomLoading} />;
  }

  return (
    <div className="flex flex-row w-full justify-between">
      {/* Chatbox */}
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
