import JoinRoom from "../popups/JoinRoom";
import CreateRoom from "../popups/CreateRoom";
import UserSettings from "../popups/UserSettings";
import Room from "../member/Room";
import React from 'react';
import { useState } from 'react';


const LeftSidebar = (props) => {

  const [roomArr, updateArr] = useState([{name: 'CPSC 559 Discussion Group', link: 'roomCode'}, {name: 'Legend of Lonk', link: 'roomCode'}, {name: 'zxcv', link: 'roomCode'}])
  const { rooms } = []

  // TODO: Make useGetUserRooms() return list of rooms by api

  // A function that updates the list of rooms from the database
  const fetchRoomList = () =>{
    try {
      // const [userPacket, { isLoading }] = <useGetUserRooms()> // Query and get list of rooms for our user with yet to be made function useGetUserRooms()
      // const res = userPacket({ rooms }).unwrap(); // Unwrap the room names and save it into rooms
      //updateArr(rooms)

    } catch (err) {
      console.log(err);
    }
  }

  // Once a user leaves a room/joins another room, they load that page so we update the list of rooms
  window.addEventListener("load", fetchRoomList())


  return (
    <div className="flex flex-col justify-between w-1/5 min-w-fit h-full">
      <h1 className="text-lg font-bold mt-4 text-center">Available Rooms</h1>
      <div className="p-4 text-gray-800 h-[70%] overflow-y-hidden">
        {/* Scrollable Container for Room Components */}
        <div
          id="roomContainer"
          className="overflow-y-auto flex flex-col items-center items-stretch space-y-3 h-full"
        >

        {/* Dynamically add in the rooms loaded into "roomsData" above */}
        {roomArr.map(roomComponent => (
          <Room name={roomComponent.name} link={roomComponent.link} />
        ))}

        </div>
      </div>
      <div className="p-4 flex flex-col justify-between">
        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for User Settings */}
        <UserSettings />

        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Container for Join Room and Create Room buttons */}
        <div className="flex flex-col gap-4">
          {/* Buttons for Joining and Creating a Room */}
          <JoinRoom />
          <CreateRoom />
        </div>
      </div>
    </div>
  );
  
};

export default LeftSidebar;
