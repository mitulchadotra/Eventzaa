import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const handleLoadUser = async () => {
    setIsLoadingUser(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/get-user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("admin");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      setUser(responseData.data ?? responseData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  return (
    <>
      <div className="home-page">

        {/* ================= HERO SECTION ================= */}

        <section className="hero-section">

          <div className="hero-left">

            {user && (
              <div className="home-user-info">
                <span>Signed in as</span>
                <strong>{user.name || "User"}</strong>
                <span>{user.email || "Email not provided"}</span>
                {user.phone && <span>{user.phone}</span>}
              </div>
            )}

            <span className="hero-label">
              DISCOVER • BOOK • EXPERIENCE
            </span>

            <h1>
              Find Your Next
              <br />
              <span>Unforgettable Event</span>
            </h1>

            <p>
              Discover amazing concerts, festivals, conferences,
              workshops, sports and entertainment events.
              Book your tickets easily and create unforgettable memories.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={() => navigate("/events")}
              >
                Explore Events →
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/ManageBooking")}
              >
                🎫 My Bookings
              </button>

              <button
                className="secondary-btn"
                onClick={handleLoadUser}
                disabled={isLoadingUser}
              >
                {isLoadingUser ? "Loading..." : user ? "Refresh Profile" : "Load My Profile"}
              </button>

            </div>

            {/* STATISTICS */}

            <div className="hero-stats">

              <div className="stat-box">
                <h3>500+</h3>
                <p>Events</p>
              </div>

              <div className="stat-box">
                <h3>50K+</h3>
                <p>Users</p>
              </div>

              <div className="stat-box">
                <h3>100+</h3>
                <p>Cities</p>
              </div>

            </div>

          </div>


          {/* HERO IMAGE */}

          <div className="hero-right">

            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
              alt="Event celebration"
            />

            <div className="hero-event-card">

              <div className="event-card-icon">
                🎵
              </div>

              <div>
                <h4>
                  Summer Music Festival
                </h4>

                <p>
                  📍 Ahmedabad &nbsp; • &nbsp; 07:00 PM
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= SEARCH SECTION ================= */}

        <section className="search-wrapper">

          <div className="search-box">

            <div className="search-field">
              <span>🔍</span>

              <div>
                <small>SEARCH</small>
                <input
                  type="text"
                  placeholder="Search events"
                />
              </div>
            </div>


            <div className="search-field">
              <span>📍</span>

              <div>
                <small>LOCATION</small>
                <input
                  type="text"
                  placeholder="Where?"
                />
              </div>
            </div>


            <div className="search-field">
              <span>📅</span>

              <div>
                <small>DATE</small>
                <input type="date" />
              </div>
            </div>


            <button
              className="search-btn"
              onClick={() => navigate("/events")}
            >
              Search Events
            </button>

          </div>

        </section>


        {/* ================= CATEGORIES ================= */}

        <section className="categories-section">

          <div className="section-heading">

            <div>
              <span>EXPLORE</span>

              <h2>
                Event Categories
              </h2>

              <p>
                Find something that matches your interests.
              </p>
            </div>

            <button
              onClick={() => navigate("/categories")}
            >
              View All →
            </button>

          </div>


          <div className="category-grid">

            <div
              className="category-card"
              onClick={() => navigate("/events")}
            >
              <div className="category-icon">
                🎵
              </div>

              <h3>Music</h3>

              <p>120+ Events</p>
            </div>


            <div
              className="category-card"
              onClick={() => navigate("/events")}
            >
              <div className="category-icon">
                🎭
              </div>

              <h3>Entertainment</h3>

              <p>85+ Events</p>
            </div>


            <div
              className="category-card"
              onClick={() => navigate("/events")}
            >
              <div className="category-icon">
                💻
              </div>

              <h3>Technology</h3>

              <p>65+ Events</p>
            </div>


            <div
              className="category-card"
              onClick={() => navigate("/events")}
            >
              <div className="category-icon">
                ⚽
              </div>

              <h3>Sports</h3>

              <p>50+ Events</p>
            </div>

          </div>

        </section>


        {/* ================= FEATURED EVENTS ================= */}

        <section className="featured-section">

          <div className="section-heading">

            <div>
              <span>DON'T MISS OUT</span>

              <h2>
                Featured Events
              </h2>

              <p>
                Check out the most popular events happening near you.
              </p>
            </div>

            <button
              onClick={() => navigate("/events")}
            >
              View All Events →
            </button>

          </div>


          <div className="event-grid">

            {/* EVENT 1 */}

            <div className="event-card">

              <div className="event-image">

                <img
                  src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80"
                  alt="Music Festival"
                />

                <span>
                  MUSIC
                </span>

              </div>

              <div className="event-info">

                <h3>
                  Summer Music Festival
                </h3>

                <p>
                  📍 Ahmedabad
                </p>

                <p>
                  📅 24 Aug 2026
                </p>

                <div className="event-bottom">

                  <strong>
                    ₹799
                  </strong>

                  <button
                    onClick={() => navigate("/login")}
                  >
                    Book Now
                  </button>

                </div>

              </div>

            </div>


            {/* EVENT 2 */}

            <div className="event-card">

              <div className="event-image">

                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="Technology Event"
                />

                <span>
                  TECHNOLOGY
                </span>

              </div>

              <div className="event-info">

                <h3>
                  Technology Innovation Summit
                </h3>

                <p>
                  📍 Bangalore
                </p>

                <p>
                  📅 30 Aug 2026
                </p>

                <div className="event-bottom">

                  <strong>
                    ₹1,299
                  </strong>

                  <button
                    onClick={() => navigate("/login")}
                  >
                    Book Now
                  </button>

                </div>

              </div>

            </div>


            {/* EVENT 3 */}

            <div className="event-card">

              <div className="event-image">

                <img
                  src="https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80"
                  alt="Comedy Event"
                />

                <span>
                  COMEDY
                </span>

              </div>

              <div className="event-info">

                <h3>
                  Comedy Night Live
                </h3>

                <p>
                  📍 Mumbai
                </p>

                <p>
                  📅 05 Sep 2026
                </p>

                <div className="event-bottom">

                  <strong>
                    ₹499
                  </strong>

                  <button
                    onClick={() => navigate("/login")}
                  >
                    Book Now
                  </button>

                </div>

              </div>

            </div>


            {/* EVENT 4 */}

            <div className="event-card">

              <div className="event-image">

                <img
                  src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80"
                  alt="Business Conference"
                />

                <span>
                  BUSINESS
                </span>

              </div>

              <div className="event-info">

                <h3>
                  Business Conference
                </h3>

                <p>
                  📍 Delhi
                </p>

                <p>
                  📅 12 Sep 2026
                </p>

                <div className="event-bottom">

                  <strong>
                    ₹999
                  </strong>

                  <button
                    onClick={() => navigate("/login")}
                  >
                    Book Now
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="home-cta">

          <div>

            <span>
              YOUR NEXT EXPERIENCE IS WAITING
            </span>

            <h2>
              Find something amazing today.
            </h2>

            <p>
              Discover events, book tickets and
              create unforgettable memories with Eventza.
            </p>

            <button
              onClick={() => navigate("/events")}
            >
              Explore Events →
            </button>

          </div>

        </section>

      </div>


      {/* ================= CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .home-page {
          width: 100%;
          background: #ffffff;
          color: #29242f;
          font-family: Arial, sans-serif;
        }


        /* HERO */

        .hero-section {
          min-height: 610px;

          display: grid;
          grid-template-columns: 1fr 1fr;

          align-items: center;

          gap: 60px;

          padding: 70px 7% 90px;

          background: #faf9ff;
        }

        .hero-left {
          max-width: 600px;
        }

        .home-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          margin-bottom: 20px;
          color: #77717d;
          font-size: 12px;
        }

        .home-user-info strong {
          color: #29242f;
          font-size: 16px;
        }

        .hero-label {
          color: #704cff;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 2px;
        }

        .hero-left h1 {
          margin: 20px 0;

          font-size: 60px;
          line-height: 1.02;

          letter-spacing: -3px;
        }

        .hero-left h1 span {
          color: #704cff;
        }

        .hero-left > p {
          max-width: 520px;

          color: #77717d;

          font-size: 14px;
          line-height: 1.8;
        }


        /* HERO BUTTONS */

        .hero-buttons {
          display: flex;

          gap: 12px;

          margin-top: 30px;
        }

        .primary-btn,
        .secondary-btn {
          height: 45px;

          padding: 0 20px;

          border-radius: 8px;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        .primary-btn {
          border: none;

          background: #704cff;

          color: white;
        }

        .primary-btn:hover {
          background: #5d3de0;
        }

        .secondary-btn {
          border: 1px solid #ddd9e5;

          background: white;

          color: #4e4856;
        }


        /* STATS */

        .hero-stats {
          display: flex;

          gap: 35px;

          margin-top: 45px;
        }

        .stat-box h3 {
          margin: 0;

          font-size: 21px;
        }

        .stat-box p {
          margin: 5px 0 0;

          color: #99939f;

          font-size: 10px;
        }


        /* HERO IMAGE */

        .hero-right {
          height: 470px;

          position: relative;

          overflow: hidden;

          border-radius: 25px;

          box-shadow:
            0 25px 60px
            rgba(40, 25, 80, 0.18);
        }

        .hero-right > img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .hero-event-card {
          position: absolute;

          left: 20px;
          right: 20px;
          bottom: 20px;

          display: flex;

          align-items: center;

          gap: 12px;

          padding: 15px;

          border-radius: 12px;

          background: rgba(255, 255, 255, 0.96);
        }

        .event-card-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #f0edff;

          font-size: 20px;
        }

        .hero-event-card h4 {
          margin: 0 0 5px;

          font-size: 13px;
        }

        .hero-event-card p {
          margin: 0;

          color: #85808b;

          font-size: 9px;
        }


        /* SEARCH */

        .search-wrapper {
          position: relative;

          margin-top: -40px;

          padding: 0 7%;
        }

        .search-box {
          min-height: 82px;

          display: grid;

          grid-template-columns:
            1.5fr 1fr 1fr auto;

          gap: 10px;

          align-items: center;

          padding: 15px;

          border-radius: 14px;

          background: white;

          box-shadow:
            0 15px 45px
            rgba(40, 25, 80, 0.12);
        }

        .search-field {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 5px 10px;

          border-right: 1px solid #eeeaf1;
        }

        .search-field > span {
          font-size: 18px;
        }

        .search-field div {
          display: flex;

          flex-direction: column;
        }

        .search-field small {
          color: #aaa4b0;

          font-size: 8px;
          font-weight: 700;
        }

        .search-field input {
          width: 100%;

          border: none;

          outline: none;

          color: #39333f;

          font-size: 11px;
        }

        .search-field input::placeholder {
          color: #77717d;
        }

        .search-btn {
          height: 45px;

          padding: 0 22px;

          border: none;

          border-radius: 8px;

          background: #704cff;

          color: white;

          font-size: 10px;
          font-weight: 700;

          cursor: pointer;
        }


        /* SECTIONS */

        .categories-section,
        .featured-section {
          padding: 90px 7%;
        }

        .featured-section {
          background: #faf9ff;
        }

        .section-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 35px;
        }

        .section-heading span {
          color: #704cff;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .section-heading h2 {
          margin: 8px 0;

          font-size: 32px;
        }

        .section-heading p {
          margin: 0;

          color: #88828e;

          font-size: 11px;
        }

        .section-heading button {
          padding: 10px 15px;

          border: none;

          border-radius: 7px;

          background: #f0edff;

          color: #704cff;

          font-size: 10px;
          font-weight: 700;

          cursor: pointer;
        }


        /* CATEGORIES */

        .category-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 18px;
        }

        .category-card {
          position: relative;

          padding: 25px;

          border: 1px solid #eeeaf1;

          border-radius: 14px;

          background: white;

          cursor: pointer;

          transition: 0.3s;
        }

        .category-card:hover {
          transform: translateY(-6px);

          box-shadow:
            0 15px 35px
            rgba(50, 30, 100, 0.1);
        }

        .category-icon {
          width: 52px;
          height: 52px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #f0edff;

          font-size: 23px;
        }

        .category-card h3 {
          margin: 18px 0 5px;

          font-size: 14px;
        }

        .category-card p {
          margin: 0;

          color: #99939f;

          font-size: 9px;
        }


        /* EVENTS */

        .event-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 18px;
        }

        .event-card {
          overflow: hidden;

          border: 1px solid #eeeaf1;

          border-radius: 14px;

          background: white;

          transition: 0.3s;
        }

        .event-card:hover {
          transform: translateY(-5px);

          box-shadow:
            0 15px 35px
            rgba(50, 30, 100, 0.1);
        }

        .event-image {
          height: 190px;

          position: relative;

          overflow: hidden;
        }

        .event-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .event-image span {
          position: absolute;

          top: 12px;
          left: 12px;

          padding: 6px 8px;

          border-radius: 5px;

          background: white;

          color: #704cff;

          font-size: 7px;
          font-weight: 800;
        }

        .event-info {
          padding: 16px;
        }

        .event-info h3 {
          margin: 0 0 12px;

          font-size: 13px;
        }

        .event-info p {
          margin: 6px 0;

          color: #8d8793;

          font-size: 9px;
        }

        .event-bottom {
          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-top: 15px;
        }

        .event-bottom strong {
          color: #704cff;

          font-size: 16px;
        }

        .event-bottom button {
          height: 32px;

          padding: 0 12px;

          border: none;

          border-radius: 7px;

          background: #704cff;

          color: white;

          font-size: 9px;
          font-weight: 700;

          cursor: pointer;
        }


        /* CTA */

        .home-cta {
          padding: 90px 20px;

          text-align: center;

          color: white;

          background:
            linear-gradient(
              135deg,
              #291466,
              #704cff
            );
        }

        .home-cta span {
          color: #dcd5ff;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .home-cta h2 {
          margin: 15px 0;

          font-size: 40px;
        }

        .home-cta p {
          color: #ded8f1;

          font-size: 12px;
        }

        .home-cta button {
          margin-top: 15px;

          padding: 13px 20px;

          border: none;

          border-radius: 7px;

          background: white;

          color: #704cff;

          font-size: 10px;
          font-weight: 700;

          cursor: pointer;
        }


        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .hero-section {
            grid-template-columns: 1fr;

          }

          .hero-left {
            max-width: 100%;
          }

          .category-grid,
          .event-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .search-box {
            grid-template-columns:
              1fr 1fr;
          }

        }


        @media (max-width: 600px) {

          .hero-section {
            padding: 50px 20px 80px;
          }

          .hero-left h1 {
            font-size: 42px;

            letter-spacing: -2px;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .hero-buttons button {
            width: 100%;
          }

          .hero-right {
            height: 350px;
          }

          .search-wrapper {
            padding: 0 20px;
          }

          .search-box {
            grid-template-columns: 1fr;
          }

          .search-field {
            border-right: none;

            border-bottom: 1px solid #eeeaf1;

            padding-bottom: 12px;
          }

          .search-btn {
            width: 100%;
          }

          .categories-section,
          .featured-section {
            padding: 60px 20px;
          }

          .section-heading {
            align-items: flex-start;

            flex-direction: column;

            gap: 15px;
          }

          .category-grid,
          .event-grid {
            grid-template-columns: 1fr;
          }

          .home-cta h2 {
            font-size: 30px;
          }

        }

      `}</style>
    </>
  );
};

export default Home;