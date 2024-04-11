import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import RoomSettings from "../popups/RoomSettings";
import ShareRoom from "../popups/ShareRoom";
import Member from "../member/Member";
import { sortUsersByUsernameAsc } from "../../utils/utility";

const RightSidebar = () => {
  const { roomInfo, onlineMembers } = useSelector((state) => state.room);
  const { userInfo } = useSelector((state) => state.user);
  const [online, setOnline] = useState([]);
  const [offline, setOffline] = useState([]);

  useEffect(() => {
    const online = roomInfo.members.filter((member) => {
      if (onlineMembers?.some((on) => on.uid === member.uid)) {
        return true;
      } else {
        return false;
      }
    });
    sortUsersByUsernameAsc(online);

    const offline = roomInfo.members.filter((member) => {
      if (online.some((on) => on.uid === member.uid)) {
        return false;
      } else {
        return true;
      }
    });
    sortUsersByUsernameAsc(offline);

    setOnline(online);
    setOffline(offline);
  }, [roomInfo.members, onlineMembers]);

  return (
    <div className="flex flex-col justify-between h-full w-1/5 min-w-fit">
      <h1 className="text-lg mt-4 text-center">Current Members</h1>
      <div className="p-4 text-gray-900 h-[74%] overflow-y-hidden">
        {/* Scrollable Container for People Components */}
        <div
          id="memberContainer"
          className="overflow-y-auto flex flex-col items-stretch space-y-3 h-full"
        >
          {online.map((member) => (
            <Member
              key={member.uid}
              name={member.username}
              isOwner={roomInfo.owner === member.uid}
              isOnline={true}
              isSelf={userInfo.username === member.username}
            />
          ))}
          {offline.map((member) => (
            <Member
              key={member.uid}
              name={member.username}
              isOwner={roomInfo.owner === member.uid}
              isOnline={false}
            />
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for Room Settings */}
        <RoomSettings />

        <hr className="my-6 border-gray-200 dark:border-gray-400" />

        {/* Button for Sharing */}
        <ShareRoom />
      </div>
    </div>
  );
};

export default RightSidebar;
