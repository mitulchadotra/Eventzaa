
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, resendLoginOtp, verifyLoginOtp } from "../Api";

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
  const [success, setSuccess] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendSeconds, setResendSeconds] = useState(30);

  useEffect(() => {
    if (!otpStep || resendSeconds <= 0) return undefined;

    const timer = setTimeout(() => {
      setResendSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpStep, resendSeconds]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));

    setError("");
    setSuccess("");
  };

  const saveLoginData = (data) => {
    const { token, user } = data;

    if (!token || !user) {
      throw new Error("Login response is missing user or token.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
      localStorage.setItem("admin", JSON.stringify(user));
      localStorage.setItem("adminProfile", JSON.stringify(user));
    } else {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminProfile");
    }

    window.dispatchEvent(new Event("authChanged"));
    navigate(user.role === "admin" ? "/Adminpanel" : "/", {
      replace: true,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const role = formData.role;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
        role,
      });

      const data = response.data;
      const isSuccessful =
        data.status === 1 || data.success === true;

      if (!isSuccessful) {
        setError(data.message || "Login failed.");
        return;
      }

      if (role === "user") {
        setOtp("");
        setOtpStep(true);
        setResendSeconds(30);
        setSuccess(data.message || "A verification code has been sent to your email.");
        return;
      }

      if (data.user?.role !== role) {
        setError(`This account is not registered as ${role}.`);
        return;
      }

      saveLoginData(data);
    } catch (err) {
      console.error("Login error:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError(message || "You are not authorized to login.");
      } else if (status === 404) {
        setError("Login API route not found. Check backend route.");
      } else if (status >= 500) {
        setError(message || "Server error. Please try again.");
      } else if (!err.response) {
        setError("Unable to connect to server. Please check backend URL.");
      } else {
        setError(message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyLoginOtp({
        email: formData.email,
        otp,
      });
      const data = response.data;

      if (data.status === 0 || data.success === false) {
        setError(data.message || "Invalid or expired verification code.");
        return;
      }

      if (data.user?.role && data.user.role !== "user") {
        setError("This verification code is not for a user account.");
        return;
      }

      saveLoginData(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to verify the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const response = await resendLoginOtp({
        email: formData.email,
      });
      const data = response.data;

      if (data.status === 0 || data.success === false) {
        setError(data.message || "Unable to resend the verification code.");
        return;
      }

      setOtp("");
      setResendSeconds(30);
      setSuccess(data.message || "A new verification code has been sent.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to resend the code. Please try again."
      );
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

    /* Login area - no duplicate navbar */
    .event-login-main {
      width: 100%;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 45px 20px;
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

    .event-card-logo-name {
      font-size: 27px;
      font-weight: 900;
      color: #15121e;
    }

    .event-card-logo-name span {
      color: #7048ff;
    }

    .event-login-heading {
      text-align: center;
      margin-bottom: 29px;
    }

    .event-login-heading h2 {
      font-size: 32px;
      font-weight: 600;
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

    .event-role-btn:hover {
      border-color: #7048ff;
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

    .event-forgot a:hover {
      text-decoration: underline;
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

    .event-login-success {
      padding: 12px;
      margin-bottom: 18px;
      border-radius: 9px;
      background: #effaf2;
      border: 1px solid #ccebd3;
      color: #26743a;
      font-size: 13px;
      line-height: 1.5;
    }

    .event-otp-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin: -5px 0 22px;
      color: #81788d;
      font-size: 13px;
    }

    .event-otp-link {
      border: 0;
      padding: 0;
      background: transparent;
      color: #7048ff;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .event-otp-link:disabled {
      color: #aaa2b5;
      cursor: not-allowed;
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

    .event-login-footer a:hover {
      text-decoration: underline;
    }

    @media(max-width: 650px) {
      .event-login-main {
        min-height: 100vh;
        padding: 35px 15px;
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

      <main className="event-login-main">
        <div className="event-login-card">

          <div className="event-card-brand">
            <div className="event-card-logo-icon">E</div>

            <div className="event-card-logo-name">
              EVENT<span>ZAA</span>
            </div>
          </div>

          <div className="event-login-heading">
            <h2>{otpStep ? "Verify Your Email" : "Welcome Back"}</h2>
            <p>
              {otpStep
                ? `Enter the verification code sent to ${formData.email}.`
                : "Login to your Eventzaa account"}
            </p>
          </div>

          {!otpStep && (
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
          )}

          {error && (
            <div className="event-login-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="event-login-success" role="status">
              {success}
            </div>
          )}

          {otpStep ? (
            <form onSubmit={handleVerifyOtp}>
              <div className="event-form-group">
                <label htmlFor="login-otp">Verification Code</label>
                <input
                  id="login-otp"
                  className="event-login-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  name="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  maxLength={6}
                  required
                />
              </div>

              <div className="event-otp-actions">
                <span>
                  {resendSeconds > 0
                    ? `Resend code in ${resendSeconds}s`
                    : "Didn't receive the code?"}
                </span>
                <button
                  className="event-otp-link"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendSeconds > 0}
                >
                  Resend code
                </button>
              </div>

              <button
                className="event-login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                className="event-otp-link"
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                style={{ display: "block", margin: "18px auto 0" }}
              >
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
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
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="event-forgot">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button
                className="event-login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>
          )}

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
