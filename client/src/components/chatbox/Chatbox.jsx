import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Chatbox.css"; // import CSS for styling
import { Button } from "@mui/material";
import Message from "./Message";
import {
  useAddMessageMutation,
  useGetMessagesByRoomQuery,
} from "../../store/message/messageApiSlice";
import { setMessage } from "../../store/message/messageSlice";
import { setErrorAlert } from "../../store/notification/notificationSlice";
import socket from "../../socket";

// Chatbox component to display the chat interface
const Chatbox = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { roomInfo } = useSelector((state) => state.room);
  const { messages } = useSelector((state) => state.message);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [addMessage, { isLoading }] = useAddMessageMutation();
  const { data, isGetMessagesLoading } = useGetMessagesByRoomQuery(
    roomInfo.roomCode
  );
  const dispatch = useDispatch();

  // Load room's message log from db
  useEffect(() => {
    if (!isGetMessagesLoading && data) {
      dispatch(setMessage(data));
    }
  }, [isGetMessagesLoading, data]);

  // Function to handle sending messages
  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      const newMessage = {
        sender: userInfo.uid,
        username: userInfo.username,
        message: inputValue,
        timestamp: new Date().toISOString(), // Add timestamp when message is sent
      };

      try {
        socket.emit("message", { ...newMessage, room: roomInfo.roomCode });
        dispatch(setMessage([...messages, newMessage]));
        setInputValue("");
        const response = await addMessage({
          ...newMessage,
          room: roomInfo.roomCode,
        }).unwrap();
        // // check if response 200
        // if (response) {
        //   socket.emit("message", { ...newMessage, room: roomInfo.roomCode });
        // }
      } catch (err) {
        // dispatch error message and maybe logout?
        if (err.status === 500) {
          dispatch(setErrorAlert(err?.data?.message || err.error));
        }
        console.log(err?.data?.message || err.error);
      }
    }
  };

  // Automatically scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle creating commands
  const handleCommand = (command) => {
    // Add your logic here to handle different commands
    switch (command) {
      case "/clear":
        dispatch(setMessage([]));
        break;
      default:
        // Command not recognized
        dispatch(
          setMessage([
            ...messages,
            {
              username: "Bot",
              message: `Command "${command}" not recognized.`,
            },
          ])
        );
        break;
    }
  };

  return (
    <div className="chatbox">
      <div className="messages-container">
        {messages &&
          messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (inputValue.startsWith("/")) {
                handleCommand(inputValue);
              } else {
                sendMessage();
              }
            }
          }}
        />
        <Button variant="outlined" onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chatbox;
