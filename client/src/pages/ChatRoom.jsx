import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ShareIcon from "@mui/icons-material/Share";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import ChatLobby from "./ChatLobby";
import Chatbox from "../components/chatbox/Chatbox";
import Member from "../components/member/Member";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import FormDialog from "../components/FormDialog";

const ChatRoom = () => {
  // const { id } = useParams(); // unique id for each chat room
  const [ws, setWs] = useState(null);
  const [onlineClients, setOnlineClients] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [offlineMembers, setOfflineMembers] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { username, id, setId, setUsername } = useContext(UserContext);

  // only clients connected to proxy
  function readOnlineClients(clientsArr) {
    // remove duplicates
    const online = [];
    clientsArr.forEach(({ userId, username }) => {
      // clientListObj[userId] = username;
      if (!online.includes(username)) online.push(username);
    });
    setOnlineClients(online);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      readOnlineClients(messageData.online);
    }
  }

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    // when we have our web socket up here, we can add things that should happen when we receive a message
    ws.addEventListener("message", handleMessage);
    // when socket is closed, this makes it reconnect
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
    console.log("ws: Connected.");
  }

  useEffect(() => {
    connectToWs();
  }, []);

  // grab user's rooms
  useEffect(() => {
    axios.get("/userRooms/" + username).then((res) => {
      const userRooms = Object.values(res.data);
      setJoinedRooms(userRooms);
    });
  }, []);

  useEffect(() => {
    console.log("Getting members for Current room: ", selectedRoom);
    if (selectedRoom) {
      axios.get("/roomMembers/" + selectedRoom).then((res) => {
        console.log("Received room members: ", res.data);
        const currentRoomMembers = res.data;
        setRoomMembers(currentRoomMembers);
      });
    }
  }, [selectedRoom]);



  

  async function handleCreateRoom(roomname) {
    const { data } = await axios.post("createRoom", { roomname, username });
    console.log("Room created? ", data);
    if (data === "created") {
      setJoinedRooms([...joinedRooms, roomname]);
    }
  }

  // offline room members
  // useEffect(() => {
  //   const offline = roomMembers.filter((member) => {
  //     return !onlineMembers.includes(member);
  //   });
  //   setOfflineMembers(offline);

  // }, [onlineMembers]);

  async function handleJoinRoom(roomname) {
    const { data } = await axios.post("joinRoom", { roomname, username });
    console.log("Joined room?", data);
    if (data === "joined") {
      setJoinedRooms([...joinedRooms, roomname]);
    }
  }

  // set online & offline room members
  useEffect(() => {
    console.log("Selected room: ", selectedRoom);
    console.log("Room members: ", roomMembers);
    console.log("Online Clients: ", onlineClients);
    const online = onlineClients.filter((client) => {
      return roomMembers.includes(client);
    });
    console.log("online: ", online);
    setOnlineMembers(online);

    const offline = roomMembers.filter((member) => {
      return !online.includes(member);
    });
    console.log("offline: ", offline);
    setOfflineMembers(offline);
  }, [roomMembers, onlineClients]);

  // console.log("Online Members: ", onlineMembers);
  // console.log("Offline Members: ", offlineMembers);

  return (
    <div className="container-center flex-row justify-between">
      {/* Left Sidebar */}
      {/* TODO: Make Room Components */}
      <div className="flex flex-col w-1/5 min-w-fit justify-between items-stretch">
        {/* Sidebar Content */}
        <div className="p-4 text-gray-900">
          <h1 className="text-lg font-bold mb-4">Available Rooms</h1>
          <div className="grid grid-cols-1 gap-4">
            {/* Scrollable Container for Room Components */}

            <div className="overflow-y-scroll flex flex-col items-center items-stretch space-y-3 h-96">
              {joinedRooms.map((room) => (
                <button
                  onClick={() => setSelectedRoom(room)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {room}
                </button>
              ))}
              {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Room 1
              </button> */}
              {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Room 2
              </button>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Room 3
              </button> */}
            </div>

            <hr class="my-6 border-gray-200 dark:border-gray-400" />

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ManageAccountsIcon />}
            >
              User Settings
            </Button>

            <hr class="my-6 border-gray-200 dark:border-gray-400" />
            {/* <Button variant="contained" startIcon={<GroupAddRoundedIcon />}>
              Join Room
            </Button> */}
            <FormDialog
              title={"Join Room"}
              text={"Enter the room name you want to join below."}
              handleSubmit={handleJoinRoom}
            />
            <FormDialog
              title={"Create Room"}
              text={"Enter the room name you want to create below."}
              handleSubmit={handleCreateRoom}
            />
            {/* <Button
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
            >
              Create Room
            </Button> */}
          </div>
        </div>
      </div>

      <div className="border-2 h-full"></div>

      <div className="flex flex-col w-4/5 min-w-fit h-full items-center">
        <div className="flex border-b-2 w-full h-16 justify-center items-center">
          {selectedRoom === null ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
                />
              </svg>
              Pick a room
            </>
          ) : (
            <>{selectedRoom}</>
          )}
        </div>

        <div className="flex flex-row w-full h-full max-h-full max-w-full">
          {selectedRoom === null ? (
            <>No room</>
          ) : (
            <Chatbox username={username} roomname={selectedRoom} ws={ws} />
          )}
        </div>
      </div>

      {/* TODO: Spacing for both sidebars*/}
      {/* Right Sidebar */}
      <div className="border-2 h-full"></div>
      <div className="flex flex-col w-1/5 min-w-fit justify-between items-stretch">
        <div className="p-4 text-gray-900">
          <h1 className="text-lg mb-4">Current Members</h1>
          <div className="grid grid-cols-1 gap-4">
            {/* Scrollable Container for People Components */}
            <div className="overflow-y-scroll flex flex-col items-center items-stretch space-y-3 h-96">
              {/* Buttons */}
              {/* {Object.keys(onlineClients).map((userId) => (
                <Member username={onlineClients[userId]} />
              ))} */}
              {selectedRoom &&
                onlineMembers.map((member) => (
                  <Member username={member} isOnline={true} />
                ))}
              {selectedRoom &&
                offlineMembers.map((member) => (
                  <Member username={member} isOnline={false} />
                ))}
            </div>

            <hr class="my-6 border-gray-200 dark:border-gray-400" />
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RoomPreferencesIcon />}
            >
              Room Settings
            </Button>

            <hr class="my-6 border-gray-200 dark:border-gray-400" />
            <Button variant="contained" color="success" endIcon={<ShareIcon />}>
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
