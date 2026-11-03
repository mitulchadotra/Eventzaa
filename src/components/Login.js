
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      const data = response.data;

      if (!data.success || !data.token) {
        setError(data.message || "Login failed.");
        return;
      }

      // Save authentication details
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");

      if (data.user) {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // Save admin details
      if (formData.role === "admin") {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "adminProfile",
          JSON.stringify(data.user)
        );
      }

      window.dispatchEvent(new Event("authChanged"));

      // Redirect according to role
      if (formData.role === "admin") {
        navigate("/Adminpanel", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 35px 20px;
          background:
            radial-gradient(circle at 10% 10%, rgba(255,255,255,0.2), transparent 30%),
            linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #9333ea 100%);
          font-family: Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 42px 38px;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 20px 60px rgba(25, 10, 55, 0.28);
          animation: loginFade 0.5s ease;
        }

        @keyframes loginFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-logo {
          width: 68px;
          height: 68px;
          margin: 0 auto 17px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
          color: white;
          font-size: 30px;
          font-weight: 800;
          background: linear-gradient(135deg, #6d28d9, #a855f7);
          box-shadow: 0 8px 20px rgba(109, 40, 217, 0.25);
        }

        .login-heading {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-heading h2 {
          margin: 0 0 10px;
          color: #24133f;
          font-size: 29px;
          font-weight: 800;
        }

        .login-heading p {
          margin: 0;
          color: #77718a;
          font-size: 14px;
        }

        .login-group {
          margin-bottom: 20px;
        }

        .login-group label {
          display: block;
          margin-bottom: 9px;
          color: #302044;
          font-size: 14px;
          font-weight: 700;
        }

        .login-input-wrapper {
          position: relative;
        }

        .login-input {
          width: 100%;
          height: 49px;
          padding: 0 15px;
          border: 1px solid #ded6ec;
          border-radius: 10px;
          outline: none;
          background: #faf9fd;
          color: #282033;
          font-size: 14px;
          transition: 0.3s;
        }

        .login-input:focus {
          border-color: #7c3aed;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }

        .login-input::placeholder {
          color: #a29aaf;
        }

        .password-input {
          padding-right: 75px;
        }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 13px;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .login-forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: -7px;
          margin-bottom: 21px;
        }

        .login-forgot a {
          color: #7c3aed;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .login-forgot a:hover {
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #6d28d9, #9333ea);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 7px 17px rgba(109, 40, 217, 0.25);
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(109, 40, 217, 0.35);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .login-error {
          padding: 12px 14px;
          margin-bottom: 20px;
          border-radius: 9px;
          background: #fff0f0;
          border: 1px solid #ffd0d0;
          color: #c62828;
          font-size: 13px;
          line-height: 1.5;
        }

        .login-footer {
          margin-top: 25px;
          text-align: center;
          color: #77718a;
          font-size: 14px;
        }

        .login-footer a {
          color: #7c3aed;
          font-weight: 700;
          text-decoration: none;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 25px;
          color: #aaa2b5;
          font-size: 12px;
        }

        .login-divider::before,
        .login-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #eee8f5;
        }

        .login-secure-note {
          margin-top: 19px;
          text-align: center;
          color: #8a8296;
          font-size: 12px;
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 20px 14px;
          }

          .login-card {
            padding: 32px 23px;
            border-radius: 17px;
          }

          .login-heading h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">E</div>

          <div className="login-heading">
            <h2>Welcome Back!</h2>
            <p>Login to continue your Eventzaa journey</p>
          </div>

          <form onSubmit={handleLogin}>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="login-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                className="login-input"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-group">
              <label htmlFor="password">Password</label>

              <div className="login-input-wrapper">
                <input
                  id="password"
                  className="login-input password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="login-group">
              <label htmlFor="role">Login As</label>

              <select
                id="role"
                className="login-input"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="login-forgot">
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="login-divider">
            OR
          </div>

          <div className="login-footer">
            Don't have an account?{" "}
            <Link to="/Signup">Create Account</Link>
          </div>

          <div className="login-secure-note">
            © Eventzaa. All rights reserved.
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;
