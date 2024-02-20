import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Member = ({ username }) => {
    const online = true;
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
      {online && (
        <div className="w-3 h-3 bg-green-600 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </section>
  );
};

export default Member;
