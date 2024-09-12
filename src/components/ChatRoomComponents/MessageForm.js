import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const MessageForm = ({ newMessage, setNewMessage, onSendMessage }) => {
  return (
    <form onSubmit={onSendMessage} className="message-form">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="form-control"
      />
      <button type="submit" className="btn btn-send">
        <FaPaperPlane style={{ color: "white" }} />
      </button>
    </form>
  );
};

export default MessageForm;
