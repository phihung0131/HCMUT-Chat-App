import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.scss";

function Login() {
  const { signIn } = useAuth();
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn({ provider: "google" });
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.message.includes("@hcmut.edu.vn")) {
        setError("Chỉ cho phép đăng nhập bằng email @hcmut.edu.vn");
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="card p-4">
        <h2>Đăng nhập</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary" onClick={handleSignIn}>
          Đăng nhập với Google
        </button>
        <p className="mt-3">
          Lưu ý: Chỉ cho phép đăng nhập bằng email @hcmut.edu.vn
        </p>
      </div>
    </div>
  );
}

export default Login;
