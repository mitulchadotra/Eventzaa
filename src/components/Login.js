
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Api";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================================
  // SAVE LOGIN DATA
  // ========================================

  const saveLoginData = (data) => {
    if (!data.token || !data.user) {
      throw new Error("Login response is missing user or token.");
    }

    const user = data.user;

    localStorage.setItem("token", data.token);
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    if (user.role === "admin") {
      localStorage.setItem("admin", JSON.stringify(user));
      localStorage.setItem("adminProfile", JSON.stringify(user));

      navigate("/Adminpanel", { replace: true });
    } else {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminProfile");

      navigate("/", { replace: true });
    }
  };

  // ========================================
  // DIRECT LOGIN
  // ========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: normalizedEmail,
        password,
        role,
      });

      const data = response.data;

      if (
        data.status !== 1 ||
        data.success !== true ||
        data.requiresOtp !== false
      ) {
        throw new Error(data.message || "Login failed.");
      }

      if (data.user?.role !== role) {
        throw new Error("Account role does not match selected role.");
      }

      saveLoginData(data);

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to login. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="eventzaa-login-page">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .eventzaa-login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 25px 15px;
          background:
            radial-gradient(circle at top left, #e9e5ff, transparent 40%),
            linear-gradient(135deg, #f5f3ff, #eef2ff);
          font-family: Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          padding: 38px 35px;
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(45,35,100,.12);
        }

        .login-logo {
          width: 65px;
          height: 65px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          color: white;
          font-size: 27px;
          font-weight: 800;
          background: linear-gradient(135deg,#704cff,#a15bff);
        }

        .login-title {
          text-align: center;
          font-size: 28px;
          color: #20213a;
          margin: 0 0 8px;
          font-weight: 750;
        }

        .login-subtitle {
          text-align: center;
          color: #77778b;
          font-size: 14px;
          margin-bottom: 28px;
        }

        .login-group {
          margin-bottom: 19px;
        }

        .login-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #33334c;
          margin-bottom: 8px;
        }

        .login-input,
        .login-select {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #dedeea;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          background: #fff;
          color: #25253b;
        }

        .login-input:focus,
        .login-select:focus {
          border-color: #7954ff;
          box-shadow: 0 0 0 3px rgba(121,84,255,.10);
        }

        .login-button {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg,#704cff,#925bff);
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 5px;
        }

        .login-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .login-error {
          padding: 11px 13px;
          border-radius: 9px;
          font-size: 13px;
          margin-bottom: 17px;
          background: #fff0f0;
          color: #d12d36;
          border: 1px solid #ffd6d6;
        }

        .login-success {
          padding: 11px 13px;
          border-radius: 9px;
          font-size: 13px;
          margin-bottom: 17px;
          background: #edfff4;
          color: #16834a;
        }

        .login-footer {
          text-align: center;
          margin-top: 23px;
          font-size: 14px;
          color: #77778b;
        }

        .login-footer a {
          color: #704cff;
          text-decoration: none;
          font-weight: 650;
        }

        .login-links {
          text-align: right;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .login-links a {
          color: #704cff;
          text-decoration: none;
        }

        @media(max-width:480px) {
          .login-card {
            padding: 30px 22px;
          }

          .login-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="login-card">

        <div className="login-logo">E</div>

        <h1 className="login-title">Welcome Back</h1>

        <p className="login-subtitle">
          Login to your Eventzaa account
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {success && (
          <div className="login-success">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="login-group">
            <label htmlFor="role">Login As</label>

            <select
              id="role"
              className="login-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="login-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              className="login-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="login-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          <div className="login-links">
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="login-footer">
            Don't have an account?{" "}
            <Link to="/Signup">Sign Up</Link>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Login;
