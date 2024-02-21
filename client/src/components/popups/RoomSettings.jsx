import { Fragment, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import DeleteRoom from "./DeleteRoom";
import LeaveRoom from "./LeaveRoom";

const RoomSettings = ({ roomName, isOwner }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<RoomPreferencesIcon />}
        className="flex-grow"
        onClick={handleOpen}
      >
        Room Settings
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "div",
        }}
      >
        <DialogTitle>Room Settings</DialogTitle>
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
            There is no going back of below actions. Please be certain.
          </DialogContentText>

          <LeaveRoom roomName={roomName} />

          {isOwner && <DeleteRoom roomName={roomName} />}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default RoomSettings;
