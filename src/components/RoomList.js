import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";
import "./RoomList.scss";

const supabase = createClient(
  "https://tdxlkbnxwjdxcphlncwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGxrYm54d2pkeGNwaGxuY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMzQ1MDQsImV4cCI6MjA0MTYxMDUwNH0.hD7V62SpuPz6iaW3UavLAhU4MCxgjhry3zaspcxJ-sM"
);

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [interests, setInterests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, signOut } = useAuth();
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) console.error("Error fetching rooms:", error);
      else setRooms(data);
    };

    const fetchInterests = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("user_interests")
        .select("room_id")
        .eq("user_id", user.id);
      if (error) console.error("Error fetching interests:", error);
      else setInterests(data.map((i) => i.room_id));
    };

    if (user) {
      fetchRooms();
      fetchInterests();
    }
  }, [user]);

  async function toggleInterest(roomId) {
    const isInterested = interests.includes(roomId);
    if (isInterested) {
      const { error } = await supabase
        .from("user_interests")
        .delete()
        .match({ user_id: user.id, room_id: roomId });
      if (error) console.error("Error removing interest:", error);
      else setInterests(interests.filter((id) => id !== roomId));
    } else {
      const { error } = await supabase
        .from("user_interests")
        .insert({ user_id: user.id, room_id: roomId });
      if (error) console.error("Error adding interest:", error);
      else setInterests([...interests, roomId]);
    }
  }

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await signOut();

      // Clear all local storage except for a logout flag
      Object.keys(localStorage).forEach((key) => {
        if (key !== "LOGGED_OUT") {
          localStorage.removeItem(key);
        }
      });

      // Set a flag in localStorage to indicate recent logout
      localStorage.setItem("LOGGED_OUT", "true");

      // Clear all session storage
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear any application state
      setRooms([]);
      setInterests([]);
      setSearchTerm("");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRooms = filteredRooms.sort((a, b) => {
    const aInterested = interests.includes(a.id);
    const bInterested = interests.includes(b.id);
    if (aInterested && !bInterested) return -1;
    if (!aInterested && bInterested) return 1;
    if (aInterested && bInterested) {
      return new Date(b.last_message_at) - new Date(a.last_message_at);
    }
    if (!aInterested && !bInterested) {
      return new Date(b.last_message_at) - new Date(a.last_message_at);
    }
    return 0;
  });

  return (
    <div className="chat-room-list">
      <div className="header">
        <h2>Danh sách phòng chat</h2>
        <button onClick={handleLogout} className="logout-btn">
          Đăng xuất
        </button>
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm phòng chat..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {sortedRooms.map((room) => (
        <div key={room.id} className="room">
          <Link to={`/room/${room.id}`}>{room.name}</Link>
          <button
            className={`btn ${interests.includes(room.id) ? "interested" : ""}`}
            onClick={() => toggleInterest(room.id)}
          >
            {interests.includes(room.id) ? "Bỏ quan tâm" : "Quan tâm"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default RoomList;
