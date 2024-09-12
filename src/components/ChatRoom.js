import React, { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useMessages from "../hooks/useMessages";
import useRoomName from "../hooks/useRoomName";
import MessageList from "./ChatRoomComponents/MessageList";
import MessageForm from "./ChatRoomComponents/MessageForm";
import Header from "./ChatRoomComponents/Header";
import "./ChatRoom.scss";

function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const { messages, sendMessage } = useMessages(roomId);
  const { roomName } = useRoomName(roomId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleBack = () => navigate("/");

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="chat-room">
      <Header roomName={roomName} onBack={handleBack} />
      <MessageList 
        messages={messages} 
        currentUser={user} 
        messagesEndRef={messagesEndRef}
      />
      <MessageForm
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default ChatRoom;