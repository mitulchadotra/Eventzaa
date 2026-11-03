
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Api";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const errors = {
      email: "",
      password: "",
    };

    if (!email.trim()) {
      errors.email = "Email is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);

    if (errors.email || errors.password) {
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      // IMPORTANT:
      // This API verifies password and sends OTP.
      // It does NOT return the final login session.

      const response = await loginUser({
        email: normalizedEmail,
        password,
        role,
      });

      const result = response?.data;

      if (
        !result ||
        result.status !== 1 ||
        result.success === false
      ) {
        setError(
          result?.message || "Unable to send login OTP"
        );
        return;
      }

      // Do not store JWT before OTP verification.
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("admin");
      localStorage.removeItem("adminProfile");

      // Store pending OTP details only.
      sessionStorage.setItem(
        "pendingOtpEmail",
        normalizedEmail
      );

      sessionStorage.setItem(
        "pendingOtpRole",
        role
      );

      // Open OTP verification page.
      navigate("/verify-otp", {
        state: {
          email: normalizedEmail,
          role,
        },
      });

    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
          `Login failed. Server returned ${err.response.status}`
        );
      } else {
        setError(
          "Cannot connect to Eventzaa server. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-box">

        {/* LOGO */}

        <div className="logo">

          <div className="logo-icon">
            E
          </div>

          <div className="logo-text">
            EVENT<span>ZAA</span>
          </div>

        </div>

        <h2>Welcome Back</h2>

        <p className="subtitle">
          Login to your Eventzaa account
        </p>

        {/* USER / ADMIN */}

        <div className="role-buttons">

          {["user", "admin"].map((item) => (

            <button
              key={item}
              type="button"
              className={
                role === item
                  ? "role-btn active"
                  : "role-btn"
              }
              onClick={() => {
                setRole(item);
                setError("");
              }}
            >
              {item === "user" ? "User" : "Admin"}
            </button>

          ))}

        </div>

        {/* ERROR */}

        {error && (

          <div
            className="error-box"
            role="alert"
          >
            {error}
          </div>

        )}

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin} noValidate>

          {/* EMAIL */}

          <div className="input-group">

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              autoComplete="username"
              onChange={(e) => {
                setEmail(e.target.value);

                setFieldErrors((prev) => ({
                  ...prev,
                  email: "",
                }));

                setError("");
              }}
            />

            {fieldErrors.email && (

              <span className="field-error">
                {fieldErrors.email}
              </span>

            )}

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);

                setFieldErrors((prev) => ({
                  ...prev,
                  password: "",
                }));

                setError("");
              }}
            />

            {fieldErrors.password && (

              <span className="field-error">
                {fieldErrors.password}
              </span>

            )}

          </div>

          {/* FORGOT PASSWORD */}

          <div className="forgot-row">

            <button
              type="button"
              className="forgot-btn"
              onClick={() =>
                navigate("/forgot-password")
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Sending OTP..."
              : "Login"}
          </button>

        </form>

        {/* SIGNUP */}

        <div className="signup-text">

          Don't have an account?

          <button
            type="button"
            onClick={() => navigate("/Signup")}
          >
            Sign Up
          </button>

        </div>

      </div>

      {/* CSS */}

      <style>{`

        .login-page,
        .login-page * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(
            135deg,
            #f7f5ff,
            #ffffff
          );
          font-family: Arial, sans-serif;
        }

        .login-box {
          width: 100%;
          max-width: 430px;
          padding: 35px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 40px rgba(0,0,0,.08);
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .logo-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            #704cff,
            #9b63ff
          );
          color: #fff;
          font-size: 22px;
          font-weight: 800;
        }

        .logo-text {
          color: #27232f;
          font-size: 23px;
          font-weight: 800;
        }

        .logo-text span {
          color: #704cff;
        }

        .login-box h2 {
          margin: 0;
          text-align: center;
          color: #27232f;
          font-size: 27px;
        }

        .subtitle {
          margin: 8px 0 25px;
          text-align: center;
          color: #777;
          font-size: 13px;
        }

        .role-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .role-btn {
          width: 50%;
          height: 40px;
          border: 1px solid #ddd9e5;
          border-radius: 8px;
          background: #fff;
          color: #666;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .role-btn.active {
          background: #704cff;
          color: #fff;
          border-color: #704cff;
        }

        .error-box {
          padding: 11px;
          margin-bottom: 15px;
          border-radius: 7px;
          background: #fff0f0;
          color: #d93636;
          font-size: 12px;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .input-group {
          margin-bottom: 17px;
        }

        .input-group label {
          display: block;
          margin-bottom: 7px;
          color: #444;
          font-size: 13px;
          font-weight: 700;
        }

        .input-group input {
          width: 100%;
          height: 45px;
          padding: 0 13px;
          border: 1px solid #ddd9e5;
          border-radius: 8px;
          outline: none;
          color: #333;
          font-size: 13px;
        }

        .input-group input:focus {
          border-color: #704cff;
          box-shadow: 0 0 0 3px rgba(112,76,255,.08);
        }

        .field-error {
          display: block;
          margin-top: 5px;
          color: #e04444;
          font-size: 11px;
        }

        .forgot-row {
          text-align: right;
          margin-bottom: 18px;
        }

        .forgot-btn,
        .signup-text button {
          border: none;
          background: none;
          color: #704cff;
          cursor: pointer;
          font-size: 12px;
        }

        .login-submit {
          width: 100%;
          height: 45px;
          border: none;
          border-radius: 8px;
          background: #704cff;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .login-submit:hover {
          background: #5d3de0;
        }

        .login-submit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .signup-text {
          margin-top: 22px;
          text-align: center;
          color: #777;
          font-size: 12px;
        }

        .signup-text button {
          margin-left: 5px;
          font-weight: 700;
        }

        @media(max-width:500px) {

          .login-page {
            padding: 15px;
          }

          .login-box {
            padding: 25px 20px;
          }

          .login-box h2 {
            font-size: 24px;
          }

        }

      `}</style>

    </div>
  );
};

export default Login;
