import React from "react";

const Header = ({ roomName, onBack }) => {
  return (
    <header className="chat-header">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>
      <h2>{roomName}</h2>
    </header>
  );
};

export default Header;
