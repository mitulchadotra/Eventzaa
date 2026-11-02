import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPanel =
    location.pathname.toLowerCase() === "/adminpanel";

  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const loggedInUser = JSON.parse(
          localStorage.getItem("loggedInUser")
        );
        setUser(loggedInUser);
      } catch {
        setUser(null);
      }
    };

    syncUser();

    window.addEventListener("authChanged", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("authChanged", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    const shouldLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!shouldLogout) return;

    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    setUser(null);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  return (
    <>
      <nav
        className={`navbar ${
          isAdminPanel ? "admin-navbar" : ""
        }`}
      >
        {/* LOGO */}
        <Link to="/" className="logo">
          <div className="logo-icon">E</div>

          <span>
            EVENT<span>ZA</span>
          </span>
        </Link>

        {/* MENU */}
        {!isAdminPanel && (
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        )}

        {/* BUTTONS / USER */}
        <div className="nav-buttons">
          {user ? (
            <>
              <button
                type="button"
                className="profile-btn"
                onClick={() => navigate("/profile")}
              >
                👤 My Profile
              </button>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                type="button"
                className="start-btn"
                onClick={() => navigate("/Signup")}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      <style>{`
        * {
          box-sizing: border-box;
        }

        /* MAIN NAVBAR */
        .navbar {
          width: 100%;
          height: 72px;
          display: flex;
          align-items: center;
          padding: 0 7%;
          background: #ffffff;
          border-bottom: 1px solid #eeeeee;
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: background 0.2s ease;
        }

        /* ADMIN PANEL BLACK HEADER */
        .navbar.admin-navbar {
          background: #000000;
          border-bottom: 1px solid #171922;
          color: #ffffff;
        }

        /* LOGO */
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #27232f;
          font-size: 20px;
          font-weight: 800;
          white-space: nowrap;
        }

        .admin-navbar .logo {
          color: #ffffff;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #3286f7;
          color: white;
          font-size: 20px;
        }

        .logo span span {
          color: #704cff;
        }

        .admin-navbar .logo span span {
          color: #3286f7;
        }

        /* NAVIGATION LINKS */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          margin-left: auto;
          margin-right: auto;
        }

        .nav-links a {
          text-decoration: none;
          color: #69636f;
          font-size: 13px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .nav-links a:hover {
          color: #704cff;
        }

        /* BUTTON CONTAINER */
        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-navbar .nav-buttons {
          margin-left: auto;
        }

        /* COMMON BUTTON STYLES */
        .login-btn,
        .start-btn,
        .profile-btn,
        .logout-btn {
          height: 38px;
          padding: 0 17px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        /* LOGIN */
        .login-btn {
          border: 1px solid #ddd9e5;
          background: #ffffff;
          color: #4f4a57;
        }

        .login-btn:hover {
          border-color: #704cff;
          color: #704cff;
        }

        /* SIGN UP */
        .start-btn {
          border: 1px solid #704cff;
          background: #704cff;
          color: #ffffff;
        }

        .start-btn:hover {
          background: #5d3de0;
          border-color: #5d3de0;
        }

        /* PROFILE */
        .profile-btn {
          border: 1px solid #363a48;
          background: #20232d;
          color: #ffffff;
        }

        .profile-btn:hover {
          background: #303543;
          border-color: #3286f7;
        }

        /* LOGOUT */
        .logout-btn {
          border: 1px solid #59303a;
          background: #321b23;
          color: #ff9ba9;
        }

        .logout-btn:hover {
          background: #49212c;
          border-color: #e04444;
        }

        /* TABLET */
        @media (max-width: 800px) {
          .nav-links {
            display: none;
          }

          .navbar {
            padding: 0 20px;
          }
        }

        /* MOBILE */
        @media (max-width: 450px) {
          .navbar {
            height: 64px;
            padding: 0 12px;
          }

          .logo {
            gap: 7px;
            font-size: 17px;
          }

          .logo-icon {
            width: 34px;
            height: 34px;
            font-size: 18px;
          }

          .nav-buttons {
            gap: 6px;
          }

          .login-btn {
            display: none;
          }

          .logo span {
            display: none;
          }

          .profile-btn,
          .logout-btn,
          .start-btn {
            height: 35px;
            padding: 0 10px;
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;