import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Loader from "../loader/Loader";
import { useJoinRoomMutation } from "../../store/room/roomApiSlice";
import { setRoomInfo } from "../../store/room/roomSlice";
import {
  setSuccessAlert,
  setErrorAlert,
} from "../../store/notification/notificationSlice";
import socket from "../../socket";

const JoinRoom = () => {
  const [open, setOpen] = useState(false);
  const [codeIsNumeric, setCodeBool] = useState(true);
  const [joinRoom, { isLoading }] = useJoinRoomMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // check field is not empty
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const roomCode = formJson.roomId;

    try {
      const roomData = await joinRoom({ roomCode }).unwrap();
      dispatch(setRoomInfo({ ...roomData }));
      socket.emit("joinRoom", roomCode);
      dispatch(
        setSuccessAlert(`Welcome! You have joined ${roomData.roomName}!`)
      );
      navigate("/chatroom/" + roomCode);
    } catch (err) {
      dispatch(setErrorAlert(err?.data?.message || err.error));
    }
    handleClose();
  };

  if (isLoading) {
    return <Loader isLoading={isLoading} />;
  }

  return (
    <Fragment>
      <Button
        variant="contained"
        startIcon={<GroupAddRoundedIcon />}
        onClick={handleOpen}
      >
        Join Room
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            handleSubmit(event);
          },
        }}
      >
        <DialogTitle>Enter Code</DialogTitle>
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

        <DialogContent dividers className="flex flex-col gap-4">
          <DialogContentText>
            Enter the room code to join the room!
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="roomId"
            name="roomId"
            label="Room Code"
            type="text"
            onChange={(event) => setCodeBool(!(/^\d+$/.test(event.target.value)))}
            fullWidth
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<GroupAddRoundedIcon />}
            disabled={codeIsNumeric}
          >
            Join Room
          </Button>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default JoinRoom;
