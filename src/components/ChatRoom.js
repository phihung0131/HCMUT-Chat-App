import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "../contexts/AuthContext";
import "./ChatRoom.scss";

const supabase = createClient(
  "https://tdxlkbnxwjdxcphlncwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGxrYm54d2pkeGNwaGxuY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMzQ1MDQsImV4cCI6MjA0MTYxMDUwNH0.hD7V62SpuPz6iaW3UavLAhU4MCxgjhry3zaspcxJ-sM"
);

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Hàm cuộn xuống cuối cùng
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Lấy tin nhắn và tên phòng từ supabase
  useEffect(() => {
    fetchMessages();
    fetchRoomName();

    const channel = supabase
      .channel(`public:messages:room_id=eq.${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((current) => [...current, payload.new].slice(-500));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Lấy tin nhắn từ Supabase
  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) console.error("Error fetching messages:", error);
    else setMessages(data.reverse());
  }

  // Lấy tên phòng từ Supabase
  async function fetchRoomName() {
    const { data, error } = await supabase
      .from("rooms")
      .select("name")
      .eq("id", roomId)
      .single();
    if (error) console.error("Error fetching room name:", error);
    else setRoomName(data.name);
  }

  // Gửi tin nhắn mới
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from("messages")
      .insert({ room_id: roomId, content: newMessage });

    if (error) console.error("Error sending message:", error);
    else setNewMessage("");
  }

  // Điều hướng về trang chủ
  function handleBack() {
    navigate("/");
  }

  // Kiểm tra đăng nhập
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="chat-room d-flex flex-column vh-100">
      <header className="chat-header">
        <button className="btn btn-secondary" onClick={handleBack}>
          ← Back
        </button>
        <h2>{roomName}</h2>
      </header>
      <div className="messages-container flex-grow-1 overflow-auto">
        {messages.map((message) => (
          <div key={message.id} className="message d-flex align-items-center">
            <img src="https://demoda.vn/wp-content/uploads/2023/01/hinh-avatar-cute-dang-yeu-ba-dao.jpg" alt="Avatar" className="avatar" />
            <div>
              <p className="message-content">{message.content}</p>
              <small className="message-timestamp">
                {new Date(message.created_at).toLocaleString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="form-control"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
