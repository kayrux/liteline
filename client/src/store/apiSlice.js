import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_Proxy_EndPoint, // proxy url
    credentials: "include",
  }),
  tagTypes: ["User", "Room", "Message"],
  endpoints: (builder) => ({}),
  refetchOnReconnect: true,
});
