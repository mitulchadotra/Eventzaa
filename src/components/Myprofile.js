import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // =========================
  // LOAD LOGGED IN USER
  // =========================

  useEffect(() => {
    const loginStatus =
      localStorage.getItem("isLoggedIn");

    const loggedInUser =
      JSON.parse(
        localStorage.getItem("loggedInUser")
      );

    if (
      loginStatus !== "true" ||
      !loggedInUser
    ) {
      navigate("/login");
      return;
    }

    setUser(loggedInUser);
  }, [navigate]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");

    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================

  if (!user) {
    return (
      <div className="profile-loading">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">

        <div>
          <h1>My Profile</h1>

          <p>
            Manage your Eventza account
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>

      {/* PROFILE CARD */}
      <div className="profile-container">

        {/* PROFILE TOP */}
        <div className="profile-top">

          <div className="profile-avatar">
            {user.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div className="profile-name">

            <h2>
              {user.name || "User"}
            </h2>

            <p>
              {user.email}
            </p>

            <span className="user-badge">
              {user.role === "admin"
                ? "Admin"
                : "User"}
            </span>

          </div>

        </div>

        {/* USER INFORMATION */}
        <div className="information-section">

          <h3>
            Personal Information
          </h3>

          <div className="information-grid">

            {/* NAME */}
            <div className="info-box">

              <span className="info-label">
                Full Name
              </span>

              <span className="info-value">
                {user.name || "Not Available"}
              </span>

            </div>

            {/* EMAIL */}
            <div className="info-box">

              <span className="info-label">
                Email Address
              </span>

              <span className="info-value">
                {user.email || "Not Available"}
              </span>

            </div>

            {/* PHONE */}
            <div className="info-box">

              <span className="info-label">
                Phone Number
              </span>

              <span className="info-value">
                {user.phone || "Not Available"}
              </span>

            </div>

            {/* ROLE */}
            <div className="info-box">

              <span className="info-label">
                Account Type
              </span>

              <span className="info-value">
                {user.role === "admin"
                  ? "Administrator"
                  : "Event User"}
              </span>

            </div>

          </div>

        </div>

        {/* ACCOUNT STATUS */}
        <div className="account-section">

          <h3>
            Account Status
          </h3>

          <div className="status-box">

            <div className="status-icon">
              ✓
            </div>

            <div>
              <strong>
                Account Active
              </strong>

              <p>
                Your Eventza account is
                currently active.
              </p>
            </div>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="profile-actions">

          <button
            className="home-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>

          <button
            className="booking-btn"
            onClick={() =>
              navigate("/booking-details")
            }
          >
            My Bookings
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* CSS */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        .profile-page {
          min-height: 100vh;
          width: 100%;
          padding: 40px 30px;
          background: #f7f5ff;
        }

        /* HEADER */

        .profile-header {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto 25px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .profile-header h1 {
          margin: 0;
          color: #27232f;
          font-size: 30px;
          font-weight: 800;
        }

        .profile-header p {
          margin: 6px 0 0;
          color: #777;
          font-size: 14px;
        }

        .back-btn {
          border: none;
          background: white;
          color: #704cff;

          padding: 11px 18px;

          border-radius: 8px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 4px 15px
            rgba(0, 0, 0, 0.05);
        }

        .back-btn:hover {
          background: #704cff;
          color: white;
        }

        /* MAIN CARD */

        .profile-container {
          width: 100%;
          max-width: 1000px;

          margin: auto;

          background: white;

          border-radius: 18px;

          padding: 30px;

          box-shadow:
            0 10px 35px
            rgba(0, 0, 0, 0.07);
        }

        /* PROFILE TOP */

        .profile-top {
          display: flex;
          align-items: center;

          gap: 20px;

          padding-bottom: 30px;

          border-bottom:
            1px solid #eee;
        }

        .profile-avatar {
          width: 90px;
          height: 90px;

          min-width: 90px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #704cff,
              #9b63ff
            );

          color: white;

          font-size: 36px;
          font-weight: 800;
        }

        .profile-name h2 {
          margin: 0;

          color: #27232f;

          font-size: 25px;
        }

        .profile-name p {
          margin: 7px 0 10px;

          color: #777;

          font-size: 14px;
        }

        .user-badge {
          display: inline-block;

          padding: 5px 12px;

          border-radius: 20px;

          background: #f0ebff;

          color: #704cff;

          font-size: 11px;

          font-weight: 700;
        }

        /* INFORMATION */

        .information-section {
          padding: 30px 0;
        }

        .information-section h3,
        .account-section h3 {
          margin: 0 0 18px;

          color: #27232f;

          font-size: 18px;
        }

        .information-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 15px;
        }

        .info-box {
          padding: 18px;

          border:
            1px solid #eee;

          border-radius: 10px;

          background: #faf9ff;
        }

        .info-label {
          display: block;

          margin-bottom: 7px;

          color: #888;

          font-size: 11px;

          font-weight: 600;
        }

        .info-value {
          display: block;

          color: #333;

          font-size: 14px;

          font-weight: 700;

          word-break: break-word;
        }

        /* ACCOUNT */

        .account-section {
          padding-bottom: 30px;
        }

        .status-box {
          display: flex;

          align-items: center;

          gap: 15px;

          padding: 15px;

          border-radius: 10px;

          background: #f1fff5;

          border:
            1px solid #d9f4e2;
        }

        .status-icon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #2dbf63;

          color: white;

          font-weight: 800;
        }

        .status-box strong {
          display: block;

          color: #23894b;

          font-size: 14px;
        }

        .status-box p {
          margin: 4px 0 0;

          color: #777;

          font-size: 12px;
        }

        /* ACTIONS */

        .profile-actions {
          display: flex;

          justify-content: flex-end;

          gap: 10px;

          padding-top: 20px;

          border-top:
            1px solid #eee;
        }

        .profile-actions button {
          padding: 11px 18px;

          border-radius: 8px;

          font-size: 13px;

          font-weight: 700;

          cursor: pointer;
        }

        .home-btn {
          border: 1px solid #704cff;

          background: white;

          color: #704cff;
        }

        .home-btn:hover {
          background: #704cff;
          color: white;
        }

        .booking-btn {
          border: none;

          background: #704cff;

          color: white;
        }

        .booking-btn:hover {
          background: #5d3de0;
        }

        .logout-btn {
          border: none;

          background: #ffecec;

          color: #dc3c3c;
        }

        .logout-btn:hover {
          background: #dc3c3c;

          color: white;
        }

        /* LOADING */

        .profile-loading {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #704cff;

          font-size: 18px;
          font-weight: 700;
        }

        /* MOBILE */

        @media (max-width: 700px) {

          .profile-page {
            padding: 25px 15px;
          }

          .profile-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-header h1 {
            font-size: 25px;
          }

          .profile-container {
            padding: 20px;
          }

          .profile-top {
            align-items: flex-start;
          }

          .profile-avatar {
            width: 70px;
            height: 70px;
            min-width: 70px;

            font-size: 28px;
          }

          .profile-name h2 {
            font-size: 20px;
          }

          .information-grid {
            grid-template-columns: 1fr;
          }

          .profile-actions {
            flex-direction: column;
          }

          .profile-actions button {
            width: 100%;
          }
        }

      `}</style>

    </div>
  );
};

export default MyProfile;