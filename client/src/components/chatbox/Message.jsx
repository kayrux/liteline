const Message = ({ message }) => {
  const getMessageTimestamp = (messageDate) => {
    const messageDateTime = new Date(messageDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const timeString = messageDateTime
      .toLocaleTimeString("en-US", options)
      .replace(/^0/, "")
      .replace(/(:\d{2}| [AP]M)$/, " $1");

    if (messageDateTime.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (messageDateTime.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeString}`;
    } else {
      return `${messageDateTime.toLocaleDateString()} ${timeString}`;
    }
  };

  return (
    <div className="message">
      <div className="message-header">
        <span className="username">{message.sendername} </span>
        <span className="timestamp">
          {getMessageTimestamp(message.timestamp)}
        </span>
      </div>
      <span className="content">{message.message}</span>
    </div>
  );
};

export default Message;
