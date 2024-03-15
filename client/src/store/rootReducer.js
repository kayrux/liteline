import { combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import userReducer from "./user/userSlice";
import roomReducer from "./room/roomSlice";

export const rootReducer = combineReducers({
  user: userReducer,
  room: roomReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});
