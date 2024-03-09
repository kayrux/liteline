import RoomSettings from "../popups/RoomSettings";
import ShareRoom from "../popups/ShareRoom";
import Member from "../member/Member";
import React from 'react';

const RightSidebar = (props) => {

  // TODO: Placeholder array until I connect to the backend
  var membersData = [{name: 'You', isOwner: 'true', isAFK: 'false'}, 
    {name: 'Jennifer Lawrence', isOwner: 'false', isAFK: 'false'},
    {isOwner: 'false', isAFK: 'true'}];

  // TODO: Load in member data from backend

  // TODO: When membersData changes, refresh "memberContainer"


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
          {membersData.map(membersComponent => (
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
