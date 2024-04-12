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
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

// Chatbox component to display the chat interface
const Chatbox = () => {
  let { roomCode } = useParams();
  const { userInfo } = useSelector((state) => state.user);
  const { roomInfo } = useSelector((state) => state.room);
  const { messages } = useSelector((state) => state.message);
  const [inputValue, setInputValue] = useState("");
  const [confirmedMessages, setConfirmedMessages] = useState([]);
  const [unsentMessages, setUnsentMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [addMessage, { isLoading }] = useAddMessageMutation();
  const { data, isGetMessagesLoading } = useGetMessagesByRoomQuery(roomCode);
  const dispatch = useDispatch();

  // Load room's message log from db
  useEffect(() => {
    console.log(roomInfo.roomCode, roomCode);
    if (!isGetMessagesLoading && data && roomInfo.roomCode === roomCode) {
      setConfirmedMessages(data);
      dispatch(setMessage([...data, ...unsentMessages]));
    }
  }, [isGetMessagesLoading, data]);

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

      // Add message to db -> update array of messages upon receiving confirmation -> broadcast event to app server
      // Upon failure -> assign failed status (gives a different opacity and retry option)
      try {
        setInputValue("");
        const response = await addMessage({
          ...newMessage,
          room: roomInfo.roomCode,
        }).unwrap();

        if (response.message === "Message successfully added.") {
          const confirmedMessage = {
            ...response.content,
            username: userInfo.username,
          };

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
        const msgId = uuidv4(); // unique id to track the message

        let unsentMessage = {
          ...newMessage,
          status: "failed",
          id: msgId,
        };

        dispatch(setMessage([...messages, unsentMessage]));
        setUnsentMessages([...unsentMessages, unsentMessage]);
        console.log(err?.data?.message || err.error);
      }
    }
  };

  const resendMessage = async (msg) => {
    const newMessage = {
      sender: userInfo.uid,
      username: userInfo.username,
      message: msg.message,
      timestamp: new Date().toISOString(), // Add timestamp when message is sent
      status: "sent",
    };

    try {
      const response = await addMessage({
        ...newMessage,
        room: roomInfo.roomCode,
      }).unwrap();

      if (response.message === "Message successfully added.") {
        const confirmedMessage = {
          ...response.content,
          username: userInfo.username,
        };

        // messages without the failed message
        // const confirmedMessages = messages.filter(
        //   (m) => m.id !== msg.id && m.timestamp !== msg.timestamp
        // );

        // remove the sent message from unsent messages
        const unsent = unsentMessages.filter((m) => m.id !== msg.id);
        setUnsentMessages(unsent);
        setConfirmedMessages([...confirmedMessages, confirmedMessage]);

        // Add the confirmed new message
        dispatch(
          setMessage([...confirmedMessages, ...unsent, confirmedMessage])
        );

        socket.emit("message", {
          ...confirmedMessage,
          room: roomInfo.roomCode,
        });
      }
    } catch (err) {
      const unsentMessage = {
        ...msg,
        timestamp: new Date().toISOString(),
        status: "failed",
      };

      // messages without the failed message
      // const confirmedMessages = messages.filter(
      //   (m) => m.id !== msg.id && m.timestamp !== msg.timestamp
      // );

      dispatch(
        setMessage([...confirmedMessages, ...unsentMessages, unsentMessage])
      );
      console.log(err?.data?.message || err.error);
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
            <div key={index}>
              <Message message={message} />
              {message.status === "failed" ? (
                <button
                  className="m-0 p-0 opacity-50 text-sm italic"
                  onClick={() => {
                    resendMessage(message);
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
