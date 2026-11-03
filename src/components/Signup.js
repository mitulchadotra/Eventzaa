
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../Api";
import { isValidEmail, isValidText } from "../utils/formValidation";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!isValidText(name, 2, 80)) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name,
        email,
        password,
      });

      if (response.data?.status === 0) {
        setError(response.data.message || "Registration failed.");
        return;
      }

      setSuccess(
        response.data?.message || "Registration successful!"
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Registration successful; go to Login page.
      setTimeout(() => {
        navigate("/Login", {
          state: { email },
        });
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px;
          background: linear-gradient(135deg, #eef2ff, #fdf2f8);
          font-family: Arial, sans-serif;
        }

        .signup-card {
          width: 100%;
          max-width: 440px;
          padding: 35px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(30, 41, 59, 0.12);
        }

        .signup-title {
          margin: 0 0 8px;
          color: #312e81;
          font-size: 30px;
          text-align: center;
        }

        .signup-subtitle {
          margin: 0 0 25px;
          color: #64748b;
          text-align: center;
          font-size: 14px;
        }

        .signup-form-group {
          margin-bottom: 18px;
        }

        .signup-form-group label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 14px;
          font-weight: 600;
        }

        .signup-form-group input {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-size: 15px;
        }

        .signup-form-group input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .signup-button {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #4f46e5;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .signup-button:hover {
          background: #4338ca;
        }

        .signup-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .signup-error,
        .signup-success {
          margin-bottom: 16px;
          padding: 11px;
          border-radius: 7px;
          font-size: 14px;
          text-align: center;
        }

        .signup-error {
          background: #fee2e2;
          color: #b91c1c;
        }

        .signup-success {
          background: #dcfce7;
          color: #166534;
        }

        .signup-footer {
          margin: 22px 0 0;
          color: #64748b;
          text-align: center;
          font-size: 14px;
        }

        .signup-footer a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }

        .signup-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-page {
            padding: 15px;
          }

          .signup-card {
            padding: 25px 20px;
          }
        }
      `}</style>

      <div className="signup-card">
        <h1 className="signup-title">Create Account</h1>

        <p className="signup-subtitle">
          Join Eventzaa and discover amazing events.
        </p>

        {error && (
          <div className="signup-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="signup-success" role="status">
            {success}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit}>
          <div className="signup-form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            className="signup-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/Login">Login</Link>
        </p>
      </div>
    </div>
  );
}
