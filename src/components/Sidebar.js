import React from "react";

const Sidebar = ({ isOpen, onClose }) => {
  const currentPath = window.location.pathname;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      name: "Discover Events",
      path: "/events",
      icon: "◉",
    },
    {
      name: "My Bookings",
      path: "/bookings",
      icon: "▣",
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: "♡",
    },
  ];

  const accountItems = [
    {
      name: "Profile",
      path: "/profile",
      icon: "◯",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙",
    },
  ];

  const navigate = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!shouldLogout) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isLoggedIn");

    window.dispatchEvent(new Event("authChanged"));

    window.location.href = "/login";
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return (
        currentPath === "/dashboard" ||
        currentPath === "/"
      );
    }

    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`eventza-sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* =========================
            SIDEBAR HEADER
        ========================== */}

        <div className="sidebar-header">

          <div className="sidebar-brand">
            <div className="sidebar-logo">
              E
            </div>

            <div className="sidebar-brand-text">
              <span>EVENT</span>
              <strong>ZA</strong>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            className="sidebar-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        {/* =========================
            USER PROFILE
        ========================== */}

        <div className="sidebar-user">

          <div className="sidebar-user-avatar">
            U
          </div>

          <div className="sidebar-user-info">
            <strong>User</strong>
            <span>Customer</span>
          </div>

          <span className="online-dot"></span>

        </div>

        {/* =========================
            MAIN MENU
        ========================== */}

        <div className="sidebar-section">

          <p className="sidebar-title">
            MAIN MENU
          </p>

          <nav className="sidebar-menu">

            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`sidebar-item ${
                  isActive(item.path)
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span className="sidebar-item-text">
                  {item.name}
                </span>

                {isActive(item.path) && (
                  <span className="active-indicator"></span>
                )}

              </button>
            ))}

          </nav>

        </div>

        {/* =========================
            ACCOUNT
        ========================== */}

        <div className="sidebar-section">

          <p className="sidebar-title">
            ACCOUNT
          </p>

          <nav className="sidebar-menu">

            {accountItems.map((item) => (
              <button
                key={item.path}
                className={`sidebar-item ${
                  isActive(item.path)
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span className="sidebar-item-text">
                  {item.name}
                </span>

                {isActive(item.path) && (
                  <span className="active-indicator"></span>
                )}

              </button>
            ))}

          </nav>

        </div>

        {/* =========================
            CREATE EVENT CARD
        ========================== */}

        <div className="create-event-card">

          <div className="create-event-icon">
            +
          </div>

          <div className="create-event-content">
            <strong>
              Host an Event
            </strong>

            <span>
              Create your own event
            </span>
          </div>

          <button
            onClick={() => navigate("/events")}
          >
            →
          </button>

        </div>

        {/* =========================
            SIDEBAR BOTTOM
        ========================== */}

        <div className="sidebar-bottom">

          <button
            className="logout-sidebar-btn"
            onClick={handleLogout}
          >
            <span className="logout-icon">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =========================
          CSS
      ========================== */}

      <style>{`

        /* =================================
           SIDEBAR
        ================================= */

        .eventza-sidebar {
          position: fixed;

          top: 0;
          left: 0;

          width: 255px;
          height: 100vh;

          background: #ffffff;

          border-right: 1px solid #e9e9ef;

          display: flex;
          flex-direction: column;

          z-index: 1100;

          box-sizing: border-box;

          overflow-y: auto;

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }


        /* =================================
           SCROLLBAR
        ================================= */

        .eventza-sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .eventza-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .eventza-sidebar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }


        /* =================================
           HEADER
        ================================= */

        .sidebar-header {
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 20px;

          border-bottom: 1px solid #f0f0f3;

          flex-shrink: 0;
        }


        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;

          cursor: pointer;
        }


        .sidebar-logo {
          width: 40px;
          height: 40px;

          border-radius: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #7252ff,
              #a15cff
            );

          color: #ffffff;

          font-size: 20px;
          font-weight: 800;

          box-shadow:
            0 5px 15px
            rgba(114, 82, 255, 0.22);
        }


        .sidebar-brand-text {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }


        .sidebar-brand-text span {
          color: #222222;
        }


        .sidebar-brand-text strong {
          color: #7252ff;
        }


        .sidebar-close {
          display: none;

          width: 34px;
          height: 34px;

          border: none;
          border-radius: 8px;

          background: #f5f5f7;

          font-size: 24px;
          line-height: 1;

          color: #555;

          cursor: pointer;
        }


        /* =================================
           USER
        ================================= */

        .sidebar-user {
          margin: 18px 15px 12px;

          padding: 12px;

          background: #f8f7ff;

          border: 1px solid #eeeaff;

          border-radius: 12px;

          display: flex;
          align-items: center;

          gap: 10px;

          position: relative;
        }


        .sidebar-user-avatar {
          width: 38px;
          height: 38px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #7252ff,
              #a15cff
            );

          color: white;

          font-weight: 700;
          font-size: 14px;
        }


        .sidebar-user-info {
          display: flex;
          flex-direction: column;

          overflow: hidden;
        }


        .sidebar-user-info strong {
          color: #252525;

          font-size: 13px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }


        .sidebar-user-info span {
          margin-top: 3px;

          color: #888;

          font-size: 11px;
        }


        .online-dot {
          position: absolute;

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #25c878;

          border: 2px solid #f8f7ff;

          left: 39px;
          bottom: 10px;
        }


        /* =================================
           SECTION
        ================================= */

        .sidebar-section {
          padding: 5px 12px;
        }


        .sidebar-title {
          margin: 12px 10px 8px;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 1px;

          color: #9a9a9f;
        }


        /* =================================
           MENU
        ================================= */

        .sidebar-menu {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }


        .sidebar-item {
          position: relative;

          width: 100%;
          height: 45px;

          display: flex;
          align-items: center;

          padding: 0 12px;

          gap: 13px;

          border: none;
          border-radius: 9px;

          background: transparent;

          color: #666;

          cursor: pointer;

          font-size: 13px;

          text-align: left;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }


        .sidebar-item:hover {
          background: #f7f6fc;

          color: #7252ff;

          transform: translateX(2px);
        }


        .sidebar-item.active {
          background: #f0edff;

          color: #7252ff;

          font-weight: 600;
        }


        .sidebar-icon {
          width: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 19px;

          flex-shrink: 0;
        }


        .sidebar-item-text {
          flex: 1;
        }


        .active-indicator {
          width: 4px;
          height: 22px;

          border-radius: 4px;

          background: #7252ff;

          position: absolute;

          right: 0;
        }


        /* =================================
           CREATE EVENT
        ================================= */

        .create-event-card {
          margin: 18px 15px 10px;

          padding: 13px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #f3efff,
              #faf8ff
            );

          border: 1px solid #e7e0ff;

          display: flex;
          align-items: center;

          gap: 9px;
        }


        .create-event-icon {
          width: 32px;
          height: 32px;

          flex-shrink: 0;

          border-radius: 9px;

          background: #7252ff;

          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 20px;
        }


        .create-event-content {
          flex: 1;

          display: flex;
          flex-direction: column;

          min-width: 0;
        }


        .create-event-content strong {
          color: #333;

          font-size: 11px;
        }


        .create-event-content span {
          margin-top: 3px;

          color: #8b8797;

          font-size: 9px;

          white-space: nowrap;
        }


        .create-event-card button {
          width: 25px;
          height: 25px;

          border: none;
          border-radius: 7px;

          background: white;

          color: #7252ff;

          font-size: 16px;

          cursor: pointer;

          transition: 0.2s;
        }


        .create-event-card button:hover {
          transform: translateX(3px);

          background: #7252ff;

          color: white;
        }


        /* =================================
           BOTTOM
        ================================= */

        .sidebar-bottom {
          margin-top: auto;

          padding: 12px 15px 20px;

          border-top: 1px solid #f0f0f3;
        }


        .logout-sidebar-btn {
          width: 100%;
          height: 43px;

          display: flex;
          align-items: center;

          gap: 12px;

          padding: 0 12px;

          border: none;
          border-radius: 9px;

          background: transparent;

          color: #ef476f;

          font-size: 13px;

          cursor: pointer;

          transition: 0.2s;
        }


        .logout-sidebar-btn:hover {
          background: #fff1f4;
        }


        .logout-icon {
          font-size: 19px;
        }


        /* =================================
           MOBILE OVERLAY
        ================================= */

        .sidebar-overlay {
          display: none;

          position: fixed;

          inset: 0;

          background:
            rgba(0, 0, 0, 0.35);

          z-index: 1050;
        }


        /* =================================
           TABLET
        ================================= */

        @media (max-width: 900px) {

          .eventza-sidebar {
            width: 245px;
          }

        }


        /* =================================
           MOBILE
        ================================= */

        @media (max-width: 768px) {

          .eventza-sidebar {
            transform: translateX(-100%);

            box-shadow: none;
          }


          .eventza-sidebar.sidebar-open {
            transform: translateX(0);

            box-shadow:
              10px 0 35px
              rgba(0, 0, 0, 0.12);
          }


          .sidebar-overlay {
            display: block;
          }


          .sidebar-close {
            display: flex;

            align-items: center;
            justify-content: center;
          }

        }


        /* =================================
           SMALL MOBILE
        ================================= */

        @media (max-width: 420px) {

          .eventza-sidebar {
            width: 280px;
          }

          .sidebar-header {
            padding: 0 15px;
          }

        }

      `}</style>
    </>
  );
};

export default Sidebar;