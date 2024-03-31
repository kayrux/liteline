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
      const receivedMessages = data.map((obj) => ({
        ...obj,
        status: "received",
      }));
      dispatch(setMessage(receivedMessages));
    }
  }, [roomInfo]);

  // Function to handle sending messages
  const sendMessage = async () => {
    if (inputValue.trim() !== "") {
      const newMessage = {
        sender: inputValue === "--fail" ? null : userInfo.uid,
        username: userInfo.username,
        message: inputValue,
        timestamp: new Date().toISOString(), // Add timestamp when message is sent
        status: "sent",
      };

      try {
        setInputValue("");
        // dispatch(setMessage([...messages, newMessage]));
        const response = await addMessage({
          ...newMessage,
          room: roomInfo.roomCode,
        }).unwrap();

        if (response.message === "Message successfully added.") {
          const confirmedMessage = {
            ...response.content,
            username: userInfo.username,
            status: "received",
          };
          // const receivedMessages = data.map((obj) => ({
          //   ...obj,
          //   status: "received",
          // }));
          dispatch(setMessage([...messages, confirmedMessage]));

          socket.emit("message", {
            ...confirmedMessage,
            room: roomInfo.roomCode,
          });
        }
      } catch (err) {
        // dispatch error message and maybe logout?
        if (err.status === 500) {
          dispatch(setErrorAlert(err?.data?.message || err.error));
        }
        console.log(err?.data?.message || err.error);
      }
    }
  };

  const resendMessage = async (msg) => {
    const newMessage = {
      sender: userInfo.uid,
      username: userInfo.username,
      message: msg,
      timestamp: new Date().toISOString(), // Add timestamp when message is sent
      status: "sent",
    };

    try {
      // dispatch(setMessage([...messages, newMessage]));
      const response = await addMessage({
        ...newMessage,
        room: roomInfo.roomCode,
      }).unwrap();

      if (response.message === "Message successfully added.") {
        const confirmedMessage = {
          ...response.content,
          username: userInfo.username,
          status: "received",
        };
        const receivedMessages = data.map((obj) => ({
          ...obj,
          status: "received",
        }));
        dispatch(setMessage([...receivedMessages, confirmedMessage]));

        socket.emit("message", {
          ...confirmedMessage,
          room: roomInfo.roomCode,
        });
      }
    } catch (err) {
      const unsentMessage = {
        ...newMessage,
        status: "failed",
      };

      const receivedMessages = data.map((obj) => ({
        ...obj,
        status: "received",
      }));
      dispatch(setMessage([...receivedMessages, unsentMessage]));
      console.log(err?.data?.message || err.error);
    }
  }

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
            <div key={index}>
              <Message message={message} />
              {message.status === "failed" ? (
                <button
                  className="m-0 p-0 opacity-50 text-sm italic"
                  onClick={() => {
                    resendMessage(message.message)
                  }}
                >
                  resend?
                </button>
              ) : null}
            </div>
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
