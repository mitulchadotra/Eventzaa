
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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));

    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const role = formData.role;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      // Backend login API
      const response = await api.post("/auth/login", {
        email,
        password,
        role,
      });

      const data = response.data;

      console.log("Login API response:", data);

      // Backend sends status: 1, not necessarily success: true
      const isSuccessful =
        data.status === 1 || data.success === true;

      if (!isSuccessful || !data.token || !data.user) {
        setError(data.message || "Login failed.");
        return;
      }

      // Verify selected account role
      if (data.user.role !== role) {
        setError(
          `This account is not registered as ${role}.`
        );
        return;
      }

      // Save authentication details
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Save admin details
      if (data.user.role === "admin") {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "adminProfile",
          JSON.stringify(data.user)
        );
      } else {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminProfile");
      }

      // Notify application about authentication
      window.dispatchEvent(new Event("authChanged"));

      // Redirect according to role
      if (data.user.role === "admin") {
        navigate("/Adminpanel", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      console.error("Login error:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError(message || "You are not authorized to login.");
      } else if (status === 404) {
        setError("Login API route not found. Check backend route.");
      } else if (status >= 500) {
        setError(message || "Server error. Please try again.");
      } else if (!err.response) {
        setError(
          "Unable to connect to server. Please check backend URL."
        );
      } else {
        setError(message || "Login failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  const styles = `
    * {
      box-sizing: border-box;
    }

    .event-login-page {
      width: 100%;
      min-height: 100vh;
      background: #faf9ff;
      font-family: Arial, Helvetica, sans-serif;
      color: #19152a;
    }

    .event-navbar {
      width: 100%;
      min-height: 80px;
      background: #fff;
      border-bottom: 1px solid #eeeaf5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 7%;
      position: relative;
      z-index: 10;
    }

    .event-brand {
      display: flex;
      align-items: center;
      gap: 13px;
      text-decoration: none;
      color: #171426;
      flex-shrink: 0;
    }

    .event-brand-icon,
    .event-card-logo-icon {
      width: 53px;
      height: 53px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7048ff, #9853f7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 26px;
      font-weight: 900;
    }

    .event-brand-name {
      font-size: 23px;
      font-weight: 900;
      letter-spacing: -0.7px;
    }

    .event-brand-name span,
    .event-card-logo-name span {
      color: #7048ff;
    }

    .event-nav-links {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .event-nav-links a {
      text-decoration: none;
      color: #40394e;
      font-size: 15px;
      transition: .2s;
    }

    .event-nav-links a:hover {
      color: #7048ff;
    }

    .event-nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .event-nav-login,
    .event-nav-signup {
      height: 44px;
      padding: 0 22px;
      border-radius: 11px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .event-nav-login {
      color: #211b30;
      background: white;
      border: 1px solid #ddd6eb;
    }

    .event-nav-signup {
      color: white;
      background: #7048ff;
      border: 1px solid #7048ff;
    }

    .event-login-main {
      min-height: calc(100vh - 80px);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 65px 20px 45px;
      background: linear-gradient(
        110deg,
        #f8f6ff,
        #fbfaff 55%,
        #fff
      );
    }

    .event-login-card {
      width: 100%;
      max-width: 504px;
      padding: 40px;
      background: white;
      border-radius: 23px;
      box-shadow: 0 15px 55px rgba(43, 29, 79, .09);
      animation: eventLoginFade .45s ease;
    }

    @keyframes eventLoginFade {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .event-card-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 13px;
      margin-bottom: 28px;
    }

    .event-card-logo-name {
      font-size: 27px;
      font-weight: 900;
      color: #15121e;
    }

    .event-login-heading {
      text-align: center;
      margin-bottom: 29px;
    }

    .event-login-heading h2 {
      font-size: 32px;
      font-weight: 500;
      color: #171426;
      margin: 0 0 17px;
    }

    .event-login-heading p {
      color: #81788d;
      font-size: 15px;
      margin: 0;
    }

    .event-role-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 26px;
    }

    .event-role-btn {
      width: 50%;
      height: 48px;
      border: 1px solid #ded7eb;
      background: white;
      color: #554b62;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: .25s;
    }

    .event-role-btn.active {
      color: white;
      background: #7048ff;
      border-color: #7048ff;
    }

    .event-form-group {
      margin-bottom: 22px;
    }

    .event-form-group label {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #282233;
      margin-bottom: 11px;
    }

    .event-input-wrapper {
      position: relative;
    }

    .event-login-input {
      width: 100%;
      height: 53px;
      padding: 0 15px;
      border: 1px solid #ded8e9;
      border-radius: 10px;
      outline: none;
      background: white;
      color: #282033;
      font-size: 14px;
      font-family: inherit;
    }

    .event-login-input:focus {
      border-color: #7048ff;
      box-shadow: 0 0 0 3px rgba(112,72,255,.09);
    }

    .event-password-input {
      padding-right: 70px;
    }

    .event-password-toggle {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      color: #7048ff;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .event-forgot {
      display: flex;
      justify-content: flex-end;
      margin: 25px 0 24px;
    }

    .event-forgot a {
      text-decoration: none;
      color: #7048ff;
      font-size: 14px;
    }

    .event-login-error {
      padding: 12px;
      margin-bottom: 18px;
      border-radius: 9px;
      background: #fff0f0;
      border: 1px solid #ffd1d1;
      color: #c62828;
      font-size: 13px;
      line-height: 1.5;
    }

    .event-login-submit {
      width: 100%;
      height: 52px;
      border: none;
      border-radius: 10px;
      background: #7048ff;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: .3s;
    }

    .event-login-submit:hover {
      background: #5d35ec;
      transform: translateY(-1px);
      box-shadow: 0 7px 18px rgba(112,72,255,.2);
    }

    .event-login-submit:disabled {
      opacity: .65;
      cursor: not-allowed;
      transform: none;
    }

    .event-login-footer {
      text-align: center;
      margin-top: 29px;
      color: #82798d;
      font-size: 14px;
    }

    .event-login-footer a {
      color: #7048ff;
      text-decoration: none;
      font-weight: 700;
      margin-left: 4px;
    }

    @media(max-width: 900px) {
      .event-navbar {
        padding: 0 4%;
      }

      .event-nav-links {
        gap: 15px;
      }
    }

    @media(max-width: 650px) {
      .event-navbar {
        padding: 12px 18px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .event-brand-icon {
        width: 43px;
        height: 43px;
      }

      .event-brand-name {
        font-size: 19px;
      }

      .event-nav-links {
        order: 3;
        width: 100%;
        justify-content: center;
        gap: 17px;
        overflow-x: auto;
        padding: 8px 0;
      }

      .event-nav-links a {
        font-size: 12px;
        white-space: nowrap;
      }

      .event-nav-login,
      .event-nav-signup {
        height: 38px;
        padding: 0 13px;
        font-size: 12px;
      }

      .event-login-main {
        min-height: calc(100vh - 75px);
        padding: 40px 15px;
      }

      .event-login-card {
        max-width: 450px;
        padding: 32px 24px;
        border-radius: 18px;
      }

      .event-login-heading h2 {
        font-size: 28px;
      }
    }

    @media(max-width: 380px) {
      .event-nav-links {
        gap: 12px;
      }

      .event-login-card {
        padding: 28px 18px;
      }

      .event-card-logo-name {
        font-size: 23px;
      }
    }
  `;

  return (
    <div className="event-login-page">
      <style>{styles}</style>

      <header className="event-navbar">
        <Link to="/" className="event-brand">
          <div className="event-brand-icon">E</div>
          <div className="event-brand-name">
            EVENT<span>ZA</span>
          </div>
        </Link>

        <nav className="event-nav-links">
          <Link to="/">Home</Link>
          <Link to="/Events">Events</Link>
          <Link to="/Categories">Categories</Link>
          <Link to="/About">About</Link>
          <Link to="/Contact">Contact</Link>
        </nav>

        <div className="event-nav-actions">
          <Link to="/Login" className="event-nav-login">
            Login
          </Link>
          <Link to="/Signup" className="event-nav-signup">
            Sign up
          </Link>
        </div>
      </header>

      <main className="event-login-main">
        <div className="event-login-card">

          <div className="event-card-brand">
            <div className="event-card-logo-icon">E</div>
            <div className="event-card-logo-name">
              EVENT<span>ZAA</span>
            </div>
          </div>

          <div className="event-login-heading">
            <h2>Welcome Back</h2>
            <p>Login to your Eventzaa account</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="event-role-buttons">
              <button
                type="button"
                className={`event-role-btn ${
                  formData.role === "user" ? "active" : ""
                }`}
                onClick={() => handleRoleChange("user")}
              >
                User
              </button>

              <button
                type="button"
                className={`event-role-btn ${
                  formData.role === "admin" ? "active" : ""
                }`}
                onClick={() => handleRoleChange("admin")}
              >
                Admin
              </button>
            </div>

            {error && (
              <div className="event-login-error">
                {error}
              </div>
            )}

            <div className="event-form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                className="event-login-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="password">Password</label>

              <div className="event-input-wrapper">
                <input
                  id="password"
                  className="event-login-input event-password-input"
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
                  className="event-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="event-forgot">
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              className="event-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="event-login-footer">
            Don't have an account?
            <Link to="/Signup">Sign Up</Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;
