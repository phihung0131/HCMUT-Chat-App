import React from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.scss";

function Login() {
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      const { error } = await signIn({ provider: "google" });
      if (error) throw error;
    } catch (error) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="card p-4">
        <h2>Đăng nhập</h2>
        <button className="btn btn-primary" onClick={handleSignIn}>
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}

export default Login;
