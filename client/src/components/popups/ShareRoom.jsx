import { Fragment, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";

const ShareRoom = () => {
  const [open, setOpen] = useState(false);
  const [copy, setCopy] = useState(false);
  const { roomInfo } = useSelector((state) => state.room);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomInfo.roomCode);
    setCopy(true);
  };

  useEffect(() => {
    let timeout = window.setTimeout(() => {
      setCopy(false);
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [copy]);

  return (
    <Fragment>
      <Button
        variant="contained"
        color="success"
        endIcon={<ShareIcon />}
        className="flex-grow"
        onClick={handleOpen}
      >
        Share
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"sm"}
        PaperProps={{
          component: "div",
        }}
      >
        <DialogTitle>
          Invite friends to <b>{roomInfo.roomName}</b>
        </DialogTitle>
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
          <DialogContentText className="uppercase">
            Send a Room Invite Code to a friend
          </DialogContentText>
          <Paper elevation={0} className="flex gap-3 items-center p-2">
            <TextField
              autoFocus
              required
              margin="dense"
              id="roomCode"
              name="roomCode"
              type="text"
              fullWidth
              variant="outlined"
              value={roomInfo.roomCode}
              InputProps={{
                readOnly: true,
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={copyLink}
              color={copy ? "secondary" : "primary"}
            >
              {copy ? "Copied" : "Copy"}
            </Button>
          </Paper>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default ShareRoom;
