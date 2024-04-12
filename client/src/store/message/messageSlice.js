import { createSlice } from "@reduxjs/toolkit";
import { sortMessagessByTimestampAsc } from "../../utils/utility";

const initialState = {
  messages: localStorage.getItem("messages")
    ? JSON.parse(localStorage.getItem("messages"))
    : null,
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action) => {
      const sortedMessages = action.payload.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      state.messages = sortedMessages;
      localStorage.setItem("messages", JSON.stringify(sortedMessages));
    },
  },
});

export const { setMessage } = messageSlice.actions;

export default messageSlice.reducer;
