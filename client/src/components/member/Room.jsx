import { useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useJoinRoomMutation } from "../../store/room/roomApiSlice";
import { setRoomInfo } from "../../store/room/roomSlice";
import { SocketContext } from "../../SocketProvider";

const Room = ({ name, roomCode }) => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [joinRoom, { isLoading }] = useJoinRoomMutation();
  const dispatch = useDispatch();

  const onJoinRoom = async () => {
    try {
      const res = await joinRoom({ roomCode }).unwrap();
      dispatch(setRoomInfo({ ...res }));
      navigate("/chatroom/" + roomCode);
    } catch (err) {
      console.log(err?.data?.message || err.error);
    }
  };

  return (
    <div
      onClick={onJoinRoom}
      className="bg-blue-950 hover:bg-blue-800 text-white font-bold py-6 px-4 rounded flex items-center justify-center cursor-pointer"
    >
      {/* Trim length of name to 18 characters */}
      {name
        ? String(name).length > 18
          ? String(name).slice(0, 15) + "..."
          : name
        : "Name Not Found!"}
    </div>
  );
};

export default Room;
