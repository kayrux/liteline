import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LeftSidebar from "../components/sidebars/LeftSidebar";
import WelcomeChat from "../components/chatroom/WelcomeChat";
import ChatRoom from "../components/chatroom/ChatRoom";
import { isDifferentUserArray } from "../utils/utility";
import { useGetUserQuery } from "../store/user/userApiSlice";
import { setUserInfo } from "../store/user/userSlice";
import { setRoomInfo, setOnlineMembers } from "../store/room/roomSlice";
import { setMessage } from "../store/message/messageSlice";
import { setInfoAlert } from "../store/notification/notificationSlice";
import socket from "../socket";

const ChatPage = () => {
  const [skip, setSkip] = useState(true);
  const { userInfo } = useSelector((state) => state.user);
  const { roomInfo, onlineMembers } = useSelector((state) => state.room);
  const { messages } = useSelector((state) => state.message);
  const { data, isGetUserLoading } = useGetUserQuery(null, { skip });
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
    } else {
      setSkip(false);
    }
  }, [userInfo]);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on("connect", () => {
      console.log("Connection (re)established!")
      socket.emit("online");
    })
  }, [socket])

  useEffect(() => {
    const handleMessage = (data) => {
      if (data && data.room === roomInfo?.roomCode) {
        dispatch(
          setMessage([
            ...messages,
            {
              sender: data.sender,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp,
              status: "received",
            },
          ])
        );
      }
    };
    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket, roomInfo?.roomCode, messages]);

  useEffect(() => {
    const handleOnline = (data) => {
      console.log("receive online notice1");
      if (data && data.roomId === roomInfo?.roomCode) {
        console.log("receive online notice2");
        if (
          onlineMembers.length !== data.onlineMembers ||
          isDifferentUserArray(onlineMembers, data.onlineMembers)
        ) {
          dispatch(setOnlineMembers(data.onlineMembers));
        }
      }
    };
    socket.on("online", handleOnline);

    return () => {
      socket.off("online", handleOnline);
    };
  }, [socket, roomInfo?.roomCode, onlineMembers]);

  useEffect(() => {
    const handleJoinRoom = (data) => {
      console.log("join room 1");
      if (data && data.roomId === roomInfo?.roomCode) {
        console.log("join room 2");
        dispatch(setOnlineMembers(data.onlineMembers));
        dispatch(setRoomInfo({ ...roomInfo, members: data.roomMembers }));
        if (userInfo.uid !== data.requester) {
          dispatch(setInfoAlert(`${data.joinedUser} joined the room.`));
        }
      }
    };
    socket.on("joinRoom", handleJoinRoom);

    return () => {
      socket.off("joinRoom", handleJoinRoom);
    };
  }, [socket, roomInfo?.roomCode, userInfo.uid]);

  useEffect(() => {
    const handleLeaveRoom = (data) => {
      console.log("leave room");
      if (data && data.roomId === roomInfo?.roomCode) {
        dispatch(setOnlineMembers(data.onlineMembers));
        dispatch(setRoomInfo({ ...roomInfo, members: data.roomMembers }));
      }
      if (data && data.requester === userInfo.uid) {
        dispatch(setRoomInfo(null));
        navigate("/chatroom");
      }
    };
    socket.on("leftRoom", handleLeaveRoom);

    return () => {
      socket.off("leftRoom", handleLeaveRoom);
    };
  }, [socket, roomInfo?.roomCode]);

  useEffect(() => {
    const handleDeleteRoom = (data) => {
      console.log("delete room");
      if (data && data.roomId === roomInfo?.roomCode) {
        dispatch(
          setInfoAlert(`${roomInfo.roomName} has been deleted by room owner.`)
        );

        dispatch(setRoomInfo(null));
        navigate("/chatroom");
      }

      const updatedRooms = userInfo.rooms.filter(
        (room) => room.id !== data.roomId
      );

      dispatch(setUserInfo({ ...userInfo, rooms: updatedRooms }));
    };
    socket.on("deletedRoom", handleDeleteRoom);

    return () => {
      socket.off("deletedRoom", handleDeleteRoom);
    };
  }, [socket, roomInfo?.roomCode, userInfo.rooms]);

  useEffect(() => {
    const handleUsernameChange = (data) => {
      if (data && data.roomId === roomInfo?.roomCode) {
        console.log("username change notice");
        dispatch(setOnlineMembers(data.onlineMembers));
        dispatch(setRoomInfo({ ...roomInfo, members: data.roomMembers }));
        const updatedMessages = messages.map((message) =>
          message.sender === data.updatedUser
            ? { ...message, username: data.updatedUsername }
            : message
        );
        dispatch(setMessage(updatedMessages));
      }
    };
    socket.on("updateUsername", handleUsernameChange);

    return () => {
      socket.off("updateUsername", handleUsernameChange);
    };
  }, [socket, roomInfo?.roomCode, messages, userInfo.username]);

  return (
    <Routes>
      <Route path="/" element={<LeftSidebar />}>
        <Route index element={<WelcomeChat />} />
        <Route path=":roomCode" element={roomInfo && <ChatRoom />} />
      </Route>
    </Routes>
  );
};

export default ChatPage;
