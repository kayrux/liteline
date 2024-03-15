import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "https://liteline-api.azurewebsites.net", // server url
    credentials: "include",
  }),
  tagTypes: ["User", "Room", "Message"],
  endpoints: (builder) => ({}),
  refetchOnReconnect: true,
});
