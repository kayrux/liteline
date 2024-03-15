import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CircleIcon from "@mui/icons-material/Circle";

const Member = (props) => {
  // Put a random number if no name was given
  var randomN = Math.floor(Math.random() * 10000) + 1;

  // Change icon color and section color based on owner status
  var iconColor = String(props.isOwner) === "true" ? "black" : "grey";
  var sectionColor =
    String(props.isOwner) === "true"
      ? "relative flex items-center rounded-full border-2 border-violet-200 bg-violet-100"
      : "relative flex items-center rounded-full border-2 border-blue-200 bg-blue-50";

  // Availability status
  var availColor = String(props.isOnline) === "true" ? "green" : "gray";

  return (
    <section className={sectionColor}>
      <AccountCircleIcon style={{ color: String(iconColor) }} />
      <CircleIcon
        className="absolute left-0"
        style={{
          color: String(availColor),
          marginTop: "0.7rem",
          marginLeft: "0.9rem",
          fontSize: "0.75rem",
        }}
      />
      {/* Give a guest name if no name was given, otherwise put the given name and shorten it if it's over 18 characters */}
      <span className="mx-2">
        {props.name
          ? String(props.name).length > 18
            ? String(props.name).slice(0, 15) + "..."
            : props.name
          : "Guest " + randomN}
      </span>
    </section>
  );
};

export default Member;
