import { Fragment, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useLeaveRoomMutation } from "../../store/room/roomApiSlice";
import { setRoomInfo } from "../../store/room/roomSlice";
import { SocketContext } from "../../SocketProvider";

const LeaveRoom = ({ setParentClose, open, setOpen }) => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [leaveRoom, { isLoading }] = useLeaveRoomMutation();
  const { roomInfo } = useSelector((state) => state.room);
  const dispatch = useDispatch();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setParentClose();
    setOpen(false);
  };

  const onLeaveRoom = async () => {
    try {
      await leaveRoom({ roomCode: roomInfo.roomCode }).unwrap();
      socket.emit("leaveRoom", roomInfo.roomCode);
      dispatch(setRoomInfo(null));
      navigate("/chatroom");
      handleClose();
    } catch (err) {
      console.log(err?.data?.message || err.error);
    }
  };

  return (
    <Fragment>
      <Button color="error" variant="contained" onClick={handleOpen}>
        Leave Room
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "div",
        }}
      >
        <DialogTitle>Leave Room</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers className="flex flex-col gap-5">
          <DialogContentText>
            Are you sure you want to leave <b>{roomInfo.roomName}</b>? You won't
            be able to rejoin this room unless you are re-invited.
          </DialogContentText>

          <Button
            color="error"
            variant="contained"
            onClick={onLeaveRoom}
            className="flex gap-1.5"
          >
            {`Yes, I want to leave `}
            {<b>{roomInfo.roomName}</b>}
          </Button>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default LeaveRoom;
