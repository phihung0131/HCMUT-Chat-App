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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchInterests();
    }
  }, [user]);

  async function fetchRooms() {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (error) console.error("Error fetching rooms:", error);
    else setRooms(data);
  }

  async function fetchInterests() {
    const { data, error } = await supabase
      .from("user_interests")
      .select("room_id")
      .eq("user_id", user.id);
    if (error) console.error("Error fetching interests:", error);
    else setInterests(data.map((i) => i.room_id));
  }

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

  const sortedRooms = rooms.sort((a, b) => {
    const aInterested = interests.includes(a.id);
    const bInterested = interests.includes(b.id);
    if (aInterested && !bInterested) return -1;
    if (!aInterested && bInterested) return 1;
    return new Date(b.last_message_at) - new Date(a.last_message_at);
  });

  return (
    <div className="chat-room-list">
      <h2>Danh sách phòng chat</h2>
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
