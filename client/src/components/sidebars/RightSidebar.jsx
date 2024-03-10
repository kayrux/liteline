import RoomSettings from "../popups/RoomSettings";
import ShareRoom from "../popups/ShareRoom";
import Member from "../member/Member";
import React from 'react';
import { useState } from 'react';

const RightSidebar = (props) => {

  // Make the array of rooms mutatable 
  const [memberArr, updateArr] = useState([{uid: '', name: 'You', isOwner: 'true', isAFK: 'false'}, 
    {uid: '', name: 'Jennifer Lawrence', isAFK: 'false'},
    {uid: '', isAFK: 'true'}])
  const { members } = []

  // TODO: Make useGetMembers() return list of members by api

  // A function that updates the members in the member list
  // Intended to be called on page load and when number of websocket connections changes
  const updateMemberList = () =>{
    try {
      // const [memberList, { isLoading }] = <useGetMembers()> // Query and get list of members in the room
      // const res = memberList({ members }).unwrap() // Unwrap the room names and save it into rooms
      // updateArr(members) // Update here
    } catch (err) {
      console.log(err);
    }
  }

  // Load initial list of members when page is loading in
  window.addEventListener("load", updateMemberList())
  
  // TODO: When # connections changes in websocket, update active status and check if member list has changed

  // TODO: onMouseMove, make active. If moving from inactive->active, propagate on web sockets. After set amount of time, set status to inactive and propagate on web sockets

  return (
    <div className="flex flex-col justify-between h-full w-1/5 min-w-fit">
      <h1 className="text-lg mt-4 text-center">Current Members</h1>
      <div className="p-4 text-gray-900 h-[74%] overflow-y-hidden">
        {/* Scrollable Container for People Components */}
        <div
          id="memberContainer"
          className="overflow-y-auto flex flex-col items-center items-stretch space-y-3 h-full"
        >
          {/* Dynamically load in members from membersData array */}
          {memberArr.map(membersComponent => (
            <Member name={membersComponent.name} 
                    isOwner={membersComponent.isOwner} 
                    isAFK={membersComponent.isAFK} />
          ))}

        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for Room Settings */}
        <RoomSettings roomName={props.roomName} isOwner={props.isRoomOwner} />

        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for Sharing */}
        <ShareRoom roomName={props.roomName} roomCode={props.roomCode} />
      </div>
    </div>
  );
};

export default RightSidebar;
