import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.scss";

function Login() {
  const { signIn } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signIn({ provider: "google" });
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.message.includes("@hcmut.edu.vn")) {
        setError("Chỉ cho phép đăng nhập bằng email @hcmut.edu.vn");
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" role="main">
      <div className="card p-4" role="form">
        <h2>Đăng nhập</h2>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <button className="btn btn-primary" onClick={handleSignIn} disabled={loading} aria-busy={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
        </button>
        <p className="mt-3">
          Lưu ý: Chỉ cho phép đăng nhập bằng email @hcmut.edu.vn
        </p>
      </div>
    </div>
  );
}

export default Login;
