
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Api";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(30);

  // ================= OTP TIMER =================

  useEffect(() => {
    if (!otpStep || resendSeconds <= 0) return;

    const timer = setTimeout(() => {
      setResendSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpStep, resendSeconds]);

  // ================= SAVE LOGIN DATA =================

  const saveLoginData = (data) => {
    const user = data.user;
    const token = data.token;

    if (!user || !token) {
      throw new Error("Login response is missing user or token");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    if (user.role === "admin") {
      localStorage.setItem("admin", JSON.stringify(user));
      localStorage.setItem("adminProfile", JSON.stringify(user));
      navigate("/Adminpanel", { replace: true });
    } else {
      localStorage.removeItem("admin");
      navigate("/", { replace: true });
    }
  };

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      const data = response.data;

      if (!data.success && data.status !== 1) {
        throw new Error(data.message || "Login failed");
      }

      // ADMIN: DIRECT LOGIN WITHOUT OTP
      if (data.requiresOtp === false) {
        if (data.user?.role !== "admin") {
          throw new Error("Invalid admin login response");
        }

        saveLoginData(data);
        return;
      }

      // USER: OTP REQUIRED
      if (data.requiresOtp === true) {
        setOtpEmail(data.email || email.trim().toLowerCase());
        setOtpStep(true);
        setOtp("");
        setResendSeconds(30);
        setSuccess("OTP sent successfully to your registered email.");
        return;
      }

      throw new Error("Unexpected login response from server");
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

  // ================= VERIFY OTP =================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-login-otp", {
        email: otpEmail,
        otp: otp.trim(),
      });

      const data = response.data;

      if (data.status !== 1 || !data.token || !data.user) {
        throw new Error(data.message || "OTP verification failed");
      }

      if (data.user.role !== "user") {
        throw new Error("OTP verification is only available for users");
      }

      saveLoginData(data);
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/resend-login-otp", {
        email: otpEmail,
      });

      if (response.data.status !== 1) {
        throw new Error(response.data.message || "Unable to resend OTP");
      }

      setOtp("");
      setResendSeconds(30);
      setSuccess("New OTP sent successfully.");
    } catch (err) {
      console.error("Resend OTP error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= BACK TO LOGIN =================

  const handleBack = () => {
    setOtpStep(false);
    setOtp("");
    setError("");
    setSuccess("");
    setPassword("");
  };

  return (
    <div className="eventzaa-login-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .eventzaa-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px 15px;
          background:
            radial-gradient(circle at top left, #e9e5ff, transparent 40%),
            linear-gradient(135deg, #f5f3ff, #eef2ff);
          font-family: Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          padding: 38px 35px;
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(45, 35, 100, 0.12);
        }

        .login-logo {
          width: 65px;
          height: 65px;
          margin: 0 auto 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 18px;
          color: white;
          font-size: 27px;
          font-weight: 800;
          background: linear-gradient(135deg, #704cff, #a15bff);
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
          line-height: 1.5;
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
          background: #ffffff;
          color: #25253b;
          transition: 0.2s;
        }

        .login-input:focus,
        .login-select:focus {
          border-color: #7954ff;
          box-shadow: 0 0 0 3px rgba(121, 84, 255, 0.10);
        }

        .login-input:disabled,
        .login-select:disabled {
          background: #f4f4f8;
          cursor: not-allowed;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #704cff, #925bff);
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 5px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 7px 18px rgba(112, 76, 255, 0.25);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-message {
          padding: 11px 13px;
          border-radius: 9px;
          font-size: 13px;
          margin-bottom: 17px;
          line-height: 1.5;
        }

        .login-error {
          background: #fff0f0;
          color: #d12d36;
          border: 1px solid #ffd6d6;
        }

        .login-success {
          background: #edfff4;
          color: #16834a;
          border: 1px solid #c6f1d6;
        }

        .login-footer {
          text-align: center;
          margin-top: 23px;
          font-size: 14px;
          color: #77778b;
        }

        .login-footer a,
        .login-link {
          color: #704cff;
          text-decoration: none;
          font-weight: 650;
        }

        .login-footer a:hover,
        .login-link:hover {
          text-decoration: underline;
        }

        .login-links {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -5px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .otp-input {
          text-align: center;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: 10px;
          padding-left: 20px;
        }

        .otp-email {
          font-weight: 700;
          color: #704cff;
          word-break: break-word;
        }

        .otp-resend {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #77778b;
        }

        .otp-resend button {
          border: none;
          background: none;
          color: #704cff;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
        }

        .otp-resend button:disabled {
          color: #999;
          cursor: not-allowed;
        }

        .back-button {
          display: block;
          width: 100%;
          border: none;
          background: none;
          color: #704cff;
          cursor: pointer;
          margin-top: 18px;
          font-size: 13px;
          font-weight: 650;
        }

        @media (max-width: 480px) {
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

        <h1 className="login-title">
          {otpStep ? "Verify OTP" : "Welcome Back"}
        </h1>

        <p className="login-subtitle">
          {otpStep
            ? "Enter the verification code sent to your email."
            : "Login to your Eventzaa account"}
        </p>

        {error && (
          <div className="login-message login-error">
            {error}
          </div>
        )}

        {success && (
          <div className="login-message login-success">
            {success}
          </div>
        )}

        {!otpStep ? (
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
              <span></span>
              <Link className="login-link" to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : "Login"}
            </button>

            <div className="login-footer">
              Don't have an account?{" "}
              <Link to="/Signup">Sign Up</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="login-group">
              <label>Email Address</label>
              <input
                className="login-input"
                type="email"
                value={otpEmail}
                disabled
                readOnly
              />
            </div>

            <div className="login-group">
              <label htmlFor="otp">6-Digit OTP</label>

              <input
                id="otp"
                className="login-input otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={loading}
                required
              />
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="otp-resend">
              {resendSeconds > 0 ? (
                <span>
                  Resend OTP in {resendSeconds} seconds
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
              disabled={loading}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
