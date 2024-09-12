import { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tdxlkbnxwjdxcphlncwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGxrYm54d2pkeGNwaGxuY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMzQ1MDQsImV4cCI6MjA0MTYxMDUwNH0.hD7V62SpuPz6iaW3UavLAhU4MCxgjhry3zaspcxJ-sM"
);

const useRoomName = (roomId) => {
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const fetchRoomName = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("name")
        .eq("id", roomId)
        .single();
      if (error) console.error("Error fetching room name:", error);
      else setRoomName(data.name);
    };

    fetchRoomName();
  }, [roomId]);

  return { roomName };
};

export default useRoomName;