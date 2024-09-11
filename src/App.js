import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import ChatRoom from "./components/ChatRoom";

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={user ? <RoomList /> : <Navigate to="/login" />}
        />
        <Route
          path="/room/:roomId"
          element={user ? <ChatRoom /> : <Navigate to="/login" />}
        />
      </Routes> 
    </div>
  );
}

export default App;
