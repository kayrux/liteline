import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CircleIcon from "@mui/icons-material/Circle";
import StarIcon from "@mui/icons-material/Star";

const Member = ({ name, isOwner, isOnline, isSelf }) => {
  // Put a random number if no name was given
  var randomN = Math.floor(Math.random() * 10000) + 1;

  return (
    <section
      className={`relative flex items-center rounded-full border-2 ${
        isOnline
          ? isSelf
            ? "border-violet-200 bg-violet-100"
            : "border-blue-200 bg-blue-50"
          : "border-stone-300 bg-gray-100 opacity-85"
      }`}
    >
      <AccountCircleIcon style={{ color: isOnline ? "#3f3f46" : "gray" }} />
      <CircleIcon
        className="absolute left-0"
        style={{
          color: isOnline ? "green" : "transparent",
          marginTop: "0.7rem",
          marginLeft: "0.9rem",
          fontSize: "0.75rem",
        }}
      />

      {/* Give a guest name if no name was given, otherwise put the given name and shorten it if it's over 18 characters */}
      <span className="mx-2 flex items-center gap-1">
        {name
          ? String(name).length > 18
            ? String(name).slice(0, 15) + "..."
            : name
          : "Guest " + randomN}
        {isOwner && (
          <StarIcon
            style={{
              color: "#facc15",
              fontSize: "1.1rem",
            }}
          />
        )}
      </span>
    </section>
  );
};

export default Member;
