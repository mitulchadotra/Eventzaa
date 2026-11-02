
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
} from "../Api";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!otpStep || resendSeconds <= 0) return;

    const timer = setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpStep, resendSeconds]);

  // Save authenticated session
  const saveSession = (backendUser, token) => {
    const backendRole = String(
      backendUser.role || ""
    ).trim().toLowerCase();

    const userId = backendUser._id || backendUser.id || "";

    const loggedInUser = {
      _id: userId,
      id: userId,
      name: backendUser.name || "User",
      email: backendUser.email || email.trim().toLowerCase(),
      phone: backendUser.phone || "",
      address: backendUser.address || "",
      role: backendRole,
    };

    localStorage.setItem("token", token);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(loggedInUser)
    );
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("isLoggedIn", "true");

    if (backendRole === "admin") {
      localStorage.setItem("admin", "true");
      localStorage.setItem(
        "adminProfile",
        JSON.stringify(loggedInUser)
      );
    } else {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminProfile");
    }

    window.dispatchEvent(new Event("authChanged"));

    navigate(
      backendRole === "admin" ? "/Adminpanel" : "/",
      { replace: true }
    );
  };

  // STEP 1: Login with email and password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const errors = {
      email: "",
      password: "",
    };

    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    setFieldErrors(errors);

    if (errors.email || errors.password) return;

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      const result = response?.data;

      if (
        !result ||
        result.status === 0 ||
        result.success === false
      ) {
        setError(result?.message || "Invalid email or password.");
        return;
      }

      // ADMIN: Skip OTP only when backend authenticates admin
      // and explicitly returns requiresOtp: false.
      if (result.requiresOtp === false) {
        const payload = result.data ?? result;

        const token =
          result.token ||
          payload.token ||
          result.accessToken ||
          payload.accessToken;

        const backendUser =
          result.user ||
          payload.user;

        if (!token || !backendUser) {
          setError("Token or user details missing from backend.");
          return;
        }

        const backendRole = String(
          backendUser.role || ""
        ).trim().toLowerCase();

        if (backendRole !== "admin") {
          setError("Invalid account role.");
          return;
        }

        if (role !== "admin") {
          setError("Please select the correct login role.");
          return;
        }

        saveSession(backendUser, token);
        return;
      }

      // NORMAL USER: Continue with OTP verification
      setOtp("");
      setOtpStep(true);
      setResendSeconds(60);
      setError(result.message || "OTP sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to start login. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyLoginOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const result = response?.data;

      if (
        !result ||
        result.status === 0 ||
        result.success === false
      ) {
        setError(result?.message || "OTP verification failed.");
        return;
      }

      const payload = result.data ?? result;

      const token =
        result.token ||
        payload.token ||
        result.accessToken ||
        payload.accessToken;

      const backendUser =
        result.user ||
        payload.user ||
        (payload._id || payload.id ? payload : null);

      if (!token || !backendUser) {
        setError("Token or user details missing from backend.");
        return;
      }

      const backendRole = String(
        backendUser.role || "user"
      ).trim().toLowerCase();

      if (!["user", "admin"].includes(backendRole)) {
        setError("Invalid account role.");
        return;
      }

      if (backendRole !== role) {
        setError(
          role === "admin"
            ? "This account is not an admin account."
            : "Please select the correct login role."
        );
        return;
      }

      saveSession(backendUser, token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Resend OTP
  const handleResendOtp = async () => {
    setError("");

    try {
      setLoading(true);

      const response = await resendLoginOtp({
        email: email.trim().toLowerCase(),
      });

      const result = response?.data;

      if (
        !result ||
        result.status === 0 ||
        result.success === false
      ) {
        setError(result?.message || "Could not resend OTP.");
        return;
      }

      setOtp("");
      setResendSeconds(60);
      setError(result.message || "New OTP sent.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="logo">
          <div className="logo-icon">E</div>
          <div className="logo-text">
            EVENT<span>ZAA</span>
          </div>
        </div>

        <h2>{otpStep ? "Verify OTP" : "Welcome Back"}</h2>

        <p className="subtitle">
          {otpStep
            ? `Enter the OTP sent to ${email}`
            : "Login to your Eventzaa account"}
        </p>

        {!otpStep && (
          <div className="role-buttons">
            {["user", "admin"].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  role === item ? "role-btn active" : "role-btn"
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
        )}

        {error && (
          <div className="error-box" role="alert">
            {error}
          </div>
        )}

        {!otpStep ? (
          <form onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label htmlFor="login-email">Email</label>
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

            <div className="input-group">
              <label htmlFor="login-password">Password</label>
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

            <div className="forgot-row">
              <button
                type="button"
                className="forgot-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="input-group">
              <label htmlFor="login-otp">Email OTP</label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  );
                  setError("");
                }}
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP & Login"}
            </button>

            <div className="forgot-row" style={{ marginTop: 16 }}>
              {resendSeconds > 0 ? (
                <span>Resend OTP in {resendSeconds}s</span>
              ) : (
                <button
                  type="button"
                  className="forgot-btn"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}

              <button
                type="button"
                className="forgot-btn"
                style={{ marginLeft: 12 }}
                onClick={() => {
                  setOtpStep(false);
                  setOtp("");
                  setError("");
                }}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

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

      <style>{`
        .login-page, .login-page * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(135deg, #f7f5ff, #ffffff);
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
          background: linear-gradient(135deg, #704cff, #9b63ff);
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

        .forgot-btn, .signup-text button {
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

        @media (max-width: 500px) {
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
