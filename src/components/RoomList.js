import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "react-query";
import "./RoomList.scss";

const supabase = createClient(
  "https://tdxlkbnxwjdxcphlncwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGxrYm54d2pkeGNwaGxuY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMzQ1MDQsImV4cCI6MjA0MTYxMDUwNH0.hD7V62SpuPz6iaW3UavLAhU4MCxgjhry3zaspcxJ-sM"
);

const ROOMS_PER_PAGE = 1000;

function RoomList() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("interested");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRooms = useCallback(async () => {
    let allRooms = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error, count } = await supabase
        .from("rooms")
        .select("*", { count: "exact" })
        .range(page * ROOMS_PER_PAGE, (page + 1) * ROOMS_PER_PAGE - 1)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      allRooms = [...allRooms, ...data];
      hasMore = data.length === ROOMS_PER_PAGE;
      page++;
    }

    return allRooms;
  }, []);

  const fetchInterests = useCallback(async () => {
    const { data, error } = await supabase
      .from("user_interests")
      .select("room_id")
      .eq("user_id", user.id);

    if (error) throw error;
    return data.map((i) => i.room_id);
  }, [user.id]);

  const { data: rooms, isLoading: roomsLoading } = useQuery("rooms", fetchRooms, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: interests, isLoading: interestsLoading } = useQuery(
    ["interests", user.id],
    fetchInterests,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const loading = roomsLoading || interestsLoading;

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter((room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const interestedRooms = useMemo(() => {
    if (!filteredRooms || !interests) return [];
    return filteredRooms.filter((room) => interests.includes(room.id));
  }, [filteredRooms, interests]);

  const notInterestedRooms = useMemo(() => {
    if (!filteredRooms || !interests) return [];
    return filteredRooms.filter((room) => !interests.includes(room.id));
  }, [filteredRooms, interests]);

  const currentRooms = useMemo(() => {
    const selectedRooms =
      activeTab === "interested" ? interestedRooms : notInterestedRooms;
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
    return selectedRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE);
  }, [activeTab, interestedRooms, notInterestedRooms, currentPage]);

  const pageCount = Math.ceil(
    (activeTab === "interested"
      ? interestedRooms.length
      : notInterestedRooms.length) / ROOMS_PER_PAGE
  );

  const toggleInterest = useCallback(async (roomId) => {
    const isInterested = interests.includes(roomId);
    try {
      if (isInterested) {
        await supabase
          .from("user_interests")
          .delete()
          .match({ user_id: user.id, room_id: roomId });
      } else {
        await supabase
          .from("user_interests")
          .insert({ user_id: user.id, room_id: roomId });
      }
      queryClient.invalidateQueries(["interests", user.id]);
    } catch (error) {
      console.error("Error toggling interest:", error);
    }
  }, [interests, user.id, queryClient]);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("user");
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      queryClient.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const renderRooms = () => {
    if (loading) {
      return <p className="loading">Loading...</p>;
    }
    if (currentRooms.length === 0) {
      return <p>Không tìm thấy phòng chat phù hợp.</p>;
    }
    return currentRooms.map((room) => (
      <div key={room.id} className="room">
        <Link to={`/room/${room.id}`}>{room.name}</Link>
        <button
          className={`btn ${interests.includes(room.id) ? "interested" : ""}`}
          onClick={() => toggleInterest(room.id)}
        >
          {interests.includes(room.id) ? "Bỏ quan tâm" : "Quan tâm"}
        </button>
      </div>
    ));
  };

  const renderPagination = () => {
    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Trang trước
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">
              Trang {currentPage} / {pageCount}
            </span>
          </li>
          <li
            className={`page-item ${
              currentPage === pageCount ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={currentPage === pageCount}
            >
              Trang sau
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="chat-room-list container">
      <div className="header d-flex justify-content-between align-items-center">
        <h2>Danh sách phòng chat (Tổng số: {rooms ? rooms.length : 0})</h2>
        <button onClick={handleLogout} className="btn btn-danger">
          Đăng xuất
        </button>
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm phòng chat..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="form-control my-3"
      />
      <div className="tabs d-flex mb-3">
        <button
          className={`btn btn-primary me-2 ${
            activeTab === "interested" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("interested");
            setCurrentPage(1);
          }}
        >
          Đã quan tâm ({interestedRooms.length})
        </button>
        <button
          className={`btn btn-secondary ${
            activeTab === "notInterested" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("notInterested");
            setCurrentPage(1);
          }}
        >
          Chưa quan tâm ({notInterestedRooms.length})
        </button>
      </div>
      <div className="room-list">{renderRooms()}</div>
      {renderPagination()}
    </div>
  );
}

export default RoomList;