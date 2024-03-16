import { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import RoomSettings from "../popups/RoomSettings";
import ShareRoom from "../popups/ShareRoom";
import Member from "../member/Member";
import { SocketContext } from "../../SocketProvider";
import { useGetRoomQuery } from "../../store/room/roomApiSlice";
import { setRoomInfo } from "../../store/room/roomSlice";
import { setUserInfo } from "../../store/user/userSlice";

const RightSidebar = () => {
  const [skip, setSkip] = useState(true);
  const socket = useContext(SocketContext);
  const { roomInfo } = useSelector((state) => state.room);
  const { userInfo } = useSelector((state) => state.user);
  const { data, isGetRoomLoading } = useGetRoomQuery(roomInfo.roomCode, {
    skip,
  });
  const dispatch = useDispatch();

  const [connected, setConnected] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [offlineMembers, setOfflineMembers] = useState([]);

  useEffect(() => {
    if (!isGetRoomLoading && data) {
      dispatch(setRoomInfo({ ...data }));
    }
  }, [data, isGetRoomLoading, dispatch]);

  useEffect(() => {
    if (!roomInfo) {
      setSkip(true);
    }
    setSkip(false);
  }, [roomInfo]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("online");

    socket.on("online", (data) => {
      if (data && data.roomId === roomInfo.roomCode) {
        setConnected(data.onlineList);
      }
    });

    socket.on("joinRoom", (data) => {
      if (data && data.roomId === roomInfo.roomCode) {
        setConnected(data.connected);
        dispatch(setRoomInfo({ ...roomInfo, members: data.roomMembers }));
      }
    });

    socket.on("leftRoom", (data) => {
      if (data && data.roomId === roomInfo.roomCode) {
        setConnected(data.connected);
        dispatch(setRoomInfo({ ...roomInfo, members: data.roomMembers }));
      }
    });

    socket.on("deletedRoom", (data) => {
      if (data && data.roomId === roomInfo.roomCode) {
        setConnected(data.connected);
        dispatch(setRoomInfo(null));
        dispatch(setUserInfo({ ...userInfo, rooms: data.userRooms }));
      }
    });
  }, [socket]);

  useEffect(() => {
    const online = roomInfo.members.filter((member) => {
      if (connected.some((on) => on.uid === member.uid)) {
        return true;
      } else {
        return false;
      }
    });

    const offline = roomInfo.members.filter((member) => {
      if (online.some((on) => on.uid === member.uid)) {
        return false;
      } else {
        return true;
      }
    });

    setOnlineMembers(online);
    setOfflineMembers(offline);
  }, [roomInfo.roomCode, connected]);

  return (
    <div className="flex flex-col justify-between h-full w-1/5 min-w-fit">
      <h1 className="text-lg mt-4 text-center">Current Members</h1>
      <div className="p-4 text-gray-900 h-[74%] overflow-y-hidden">
        {/* Scrollable Container for People Components */}
        <div
          id="memberContainer"
          className="overflow-y-auto flex flex-col items-stretch space-y-3 h-full"
        >
          {onlineMembers.map((member) => (
            <Member
              key={member.uid}
              name={member.username}
              isOwner={roomInfo.owner === member.uid}
              isOnline={true}
            />
          ))}
          {offlineMembers.map((member) => (
            <Member
              key={member.uid}
              name={member.username}
              isOwner={roomInfo.owner === member.uid}
              isOnline={false}
            />
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for Room Settings */}
        <RoomSettings />

        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for Sharing */}
        <ShareRoom />
      </div>
    </div>
  );
};

export default RightSidebar;
