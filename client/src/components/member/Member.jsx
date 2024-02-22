import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Member = ({ username, isOnline }) => {
  const statusColor = isOnline ? "bg-green-600" :  "bg-gray-400";
  {
    /*
        Member Icon

        Member Name

        Member Status
            Active, Inactive, Room Admin Active, Room Admin Inactive 
    */
  }
  return (
    <section class="flex items-center flex-shrink-0 rounded-full border-2 border-black-300 mt-3">
      <span class>
        <AccountCircleIcon />
      </span>
      <span class="mx-2">{username}</span>
      <div className={"w-3 h-3 bottom-0 right-0 rounded-full border border-white " + statusColor}></div>
    </section>
  );
};

export default Member;
