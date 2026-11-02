import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  const isAdminPanel =
    location.pathname.toLowerCase() === "/adminpanel";

  return (
    <>
      <footer className={`footer ${isAdminPanel ? "admin-footer" : ""}`}>
        <div className="footer-container">

          {/* BRAND */}

          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                E
              </div>

              <span>
                EVENT<span>ZA</span>
              </span>
            </Link>

            <p>
              Discover, book and experience
              amazing events with Eventza.
              Your one-stop destination for
              unforgettable experiences.
            </p>

            {/* SOCIAL */}

            <div className="social-links">
              <span role="img" aria-label="Facebook">f</span>
              <span role="img" aria-label="Instagram">◎</span>
              <span role="img" aria-label="Twitter">𝕏</span>
              <span role="img" aria-label="LinkedIn">in</span>
            </div>

          </div>

          {/* EXPLORE */}

          <div className="footer-column">
            <h4>Explore</h4>

            <Link to="/">Home</Link>
            <Link to="/Events">Events</Link>
            <Link to="/Categories">Categories</Link>
          </div>

          {/* COMPANY */}

          <div className="footer-column">
            <h4>Company</h4>

            <Link to="/About">About Us</Link>
            <Link to="/Contact">Contact</Link>
            <Link to="/Events">Discover Events</Link>
          </div>

          {/* ACCOUNT */}

          <div className="footer-column">
            <h4>Account</h4>

            <Link to="/Login">Login</Link>
            <Link to="/Login">My Bookings</Link>
            <Link to="/Login">My Profile</Link>
          </div>

          {/* NEWSLETTER */}

          <div className="footer-column newsletter">
            <h4>Stay Updated</h4>

            <p>
              Get the latest events and
              exclusive offers.
            </p>

            <div className="newsletter-box">
              <input
                type="email"
                placeholder="Your email"
              />

              <button type="button">
                →
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM */}

        <div className="footer-bottom">
          <p>
            © 2026 Eventza. All rights reserved.
          </p>

          <div>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </footer>

      <style>{`

        .footer {
          background: #17131f;
          color: white;
          padding: 70px 7% 20px;
        }

        .admin-footer {
          /* margin-left: 250px; */
        }

        .footer-container {
          display: grid;
          grid-template-columns: 1.7fr 1fr 1fr 1fr 1.5fr;
          gap: 45px;
          padding-bottom: 50px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        /* BRAND */

        .footer-brand {
          max-width: 300px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: white;
          font-size: 20px;
          font-weight: 800;
        }

        .footer-logo span span {
          color: #8b6cff;
        }

        .footer-logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg,#704cff,#9b63ff);
          font-weight: 800;
        }

        .footer-brand > p {
          margin: 20px 0;
          color: #96909e;
          font-size: 11px;
          line-height: 1.8;
        }

        /* SOCIAL */

        .social-links {
          display: flex;
          gap: 8px;
        }

        .social-links span {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #25202e;
          color: #aaa4b1;
          font-size: 11px;
          transition: 0.2s;
        }

        .social-links span:hover {
          background: #704cff;
          color: white;
        }

        /* COLUMNS */

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .footer-column h4 {
          margin: 0 0 8px;
          color: white;
          font-size: 12px;
        }

        .footer-column a {
          color: #96909e;
          text-decoration: none;
          font-size: 10px;
          transition: 0.2s;
        }

        .footer-column a:hover {
          color: #9b7cff;
        }

        /* NEWSLETTER */

        .newsletter p {
          margin: 0;
          color: #96909e;
          font-size: 10px;
          line-height: 1.6;
        }

        .newsletter-box {
          display: flex;
          height: 40px;
          margin-top: 5px;
          overflow: hidden;
          border: 1px solid #342e3e;
          border-radius: 7px;
          background: #211c29;
        }

        .newsletter-box input {
          width: 100%;
          padding: 0 10px;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 10px;
        }

        .newsletter-box input::placeholder {
          color: #77717f;
        }

        .newsletter-box button {
          width: 42px;
          border: none;
          background: #704cff;
          color: white;
          font-size: 15px;
          cursor: pointer;
        }

        /* BOTTOM */

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
        }

        .footer-bottom p {
          margin: 0;
          color: #716b79;
          font-size: 9px;
        }

        .footer-bottom div {
          display: flex;
          gap: 20px;
        }

        .footer-bottom span {
          color: #716b79;
          font-size: 9px;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .footer-container {
            grid-template-columns: repeat(3, 1fr);
          }

          .footer-brand {
            grid-column: span 3;
            max-width: 500px;
          }
        }

        @media (max-width: 600px) {
          .admin-footer {
            margin-left: 0;
          }

          .footer {
            padding: 50px 20px 20px;
          }

          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 35px 20px;
          }

          .footer-brand {
            grid-column: span 2;
          }

          .newsletter {
            grid-column: span 2;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .footer-bottom div {
            flex-direction: column;
            gap: 8px;
          }
        }

      `}</style>
    </>
  );
};

export default Footer;
