import { useState, useRef, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import "./Chatbox.css"; // import CSS for styling
import { Button } from "@mui/material";
import Message from "./Message";
import { SocketContext } from "../../SocketProvider";
import {
  useAddMessageMutation,
  useGetMessagesByRoomQuery,
} from "../../store/message/messageApiSlice";

// Chatbox component to display the chat interface
const Chatbox = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { roomInfo } = useSelector((state) => state.room);
  const socket = useContext(SocketContext);
  const [addMessage, { isLoading }] = useAddMessageMutation();
  const { data, isGetMessagesLoading } = useGetMessagesByRoomQuery(
    roomInfo.roomCode
  );

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Load room's message log from db
  useEffect(() => {
    if (!isGetMessagesLoading && data) {
      setMessages(data);
    }
  }, [isGetMessagesLoading, data]);

  // socket for receiving and sending messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: data.sender,
            sendername: data.sendername,
            message: data.message,
            timestamp: data.timestamp,
          },
        ]);
      }
    };
    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  // Function to handle sending messages
  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      const newMessage = {
        sender: userInfo.uid,
        sendername: userInfo.username,
        message: inputValue,
        timestamp: new Date().toISOString(), // Add timestamp when message is sent
      };

      try {
        socket.emit("message", { ...newMessage, room: roomInfo.roomCode });
        setMessages([...messages, newMessage]);
        setInputValue("");
        await addMessage({ ...newMessage, room: roomInfo.roomCode }).unwrap();
      } catch (err) {
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
        setMessages([]);
        break;
      default:
        // Command not recognized
        setMessages([
          ...messages,
          { username: "Bot", message: `Command "${command}" not recognized.` },
        ]);
        break;
    }
  };

  return (
    <div className="chatbox">
      <div className="messages-container">
        {messages.map((message, index) => (
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
