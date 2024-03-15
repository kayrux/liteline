import { apiSlice } from "../apiSlice";
const MESSAGES_URL = "/api/messages";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addMessage: builder.mutation({
      query: (data) => ({
        url: `${MESSAGES_URL}/${data.room}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Message"],
    }),
    getMessagesByRoom: builder.query({
      query: (id) => ({
        url: `${MESSAGES_URL}/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Message"],
    }),
  }),
});

export const { useAddMessageMutation, useGetMessagesByRoomQuery } =
  usersApiSlice;
