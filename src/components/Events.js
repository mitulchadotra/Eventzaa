
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../Api";

// ================= BACKEND IMAGE URL =================

const API_BASE_URL = "https://eventza-backend-7uxv.onrender.com";

const getEventImage = (event) => {
  const imagePath =
    event.imageUrl ||
    event.image ||
    event.imagePath ||
    event.eventImage ||
    "";

  if (!imagePath) return "";

  const path = String(imagePath).trim();

  if (!path) return "";

  // Already complete image URL
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Fix Windows and relative paths
  const cleanPath = path
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^\/+/, "");

  return `${API_BASE_URL}/${cleanPath}`;
};

// ================= EVENTS COMPONENT =================

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // ================= LOAD EVENTS =================

  useEffect(() => {
    let isActive = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEvents();
        const data = response.data;

        let fetchedEvents = [];

        if (Array.isArray(data)) {
          fetchedEvents = data;
        } else if (Array.isArray(data?.events)) {
          fetchedEvents = data.events;
        } else if (Array.isArray(data?.data)) {
          fetchedEvents = data.data;
        } else if (Array.isArray(data?.data?.events)) {
          fetchedEvents = data.data.events;
        }

        if (isActive) {
          setEvents(fetchedEvents);
        }
      } catch (loadError) {
        console.error("Load events error:", loadError);

        if (isActive) {
          setError(
            loadError.response?.data?.message ||
              loadError.message ||
              "Unable to load events. Please check your backend."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  // ================= CATEGORY FILTER =================

  const categories = [
    "All",
    ...new Set(
      events
        .map((event) => event.category)
        .filter(Boolean)
    ),
  ];

  // ================= SEARCH AND FILTER =================

  const filteredEvents = events.filter((event) => {
    const title = event.title || event.name || "";
    const searchText = search.toLowerCase();

    const searchMatch =
      title.toLowerCase().includes(searchText) ||
      (event.category || "").toLowerCase().includes(searchText) ||
      (event.location || "").toLowerCase().includes(searchText);

    const categoryMatch =
      category === "All" || event.category === category;

    return searchMatch && categoryMatch;
  });

  // ================= BOOKING =================

  const handleBooking = (event) => {
    let loggedUser = null;

    try {
      loggedUser =
        JSON.parse(localStorage.getItem("loggedInUser")) ||
        JSON.parse(localStorage.getItem("user"));
    } catch {
      loggedUser = null;
    }

    if (
      !loggedUser ||
      !localStorage.getItem("token") ||
      localStorage.getItem("isLoggedIn") === "false"
    ) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    navigate("/ManageBooking", {
      state: {
        eventName: event.title || event.name,
        eventId: event._id || event.id,
        event,
      },
    });
  };

  // ================= IMAGE ERROR =================

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "https://placehold.co/800x500?text=Image+Not+Found";
  };

  // ================= UI =================

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Explore Events</h1>
        <p>
          Discover amazing events and book your favorite experience
        </p>
      </div>

      {/* SEARCH AND CATEGORY */}

      <div className="event-filter">
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* EVENTS */}

      <div className="events-container">
        {loading ? (
          <div className="no-events">
            <h2>Loading events...</h2>
          </div>
        ) : error ? (
          <div className="no-events">
            <h2>Unable to Load Events</h2>
            <p>{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="no-events">
            <h2>No Events Found</h2>
            <p>Try another search or category.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const title =
              event.title || event.name || "Untitled Event";

            const imageSrc = getEventImage(event);

            return (
              <div
                className="event-card"
                key={event._id || event.id || title}
              >
                {/* EVENT IMAGE */}

                <div className="event-image">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={title}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="no-image">
                      <span>Image not uploaded</span>
                    </div>
                  )}

                  {event.category && (
                    <span className="event-category">
                      {event.category}
                    </span>
                  )}
                </div>

                {/* EVENT DETAILS */}

                <div className="event-content">
                  <h2>{title}</h2>

                  <p className="event-description">
                    {event.description ||
                      "Discover this exciting event."}
                  </p>

                  <div className="event-info">
                    <p>
                      📅 <b>Date:</b>{" "}
                      {event.date
                        ? new Date(event.date).toLocaleDateString(
                            "en-IN"
                          )
                        : "Not specified"}
                    </p>

                    <p>
                      ⏰ <b>Time:</b>{" "}
                      {event.time || "Not specified"}
                    </p>

                    <p>
                      📍 <b>Location:</b>{" "}
                      {event.location || "Not specified"}
                    </p>

                    {event.seats !== undefined && (
                      <p>
                        💺 <b>Available Seats:</b> {event.seats}
                      </p>
                    )}
                  </div>

                  {/* PRICE AND BOOKING */}

                  <div className="event-bottom">
                    <div className="event-price">
                      <span>Price</span>
                      <strong>₹{event.price ?? 0}</strong>
                    </div>

                    <button onClick={() => handleBooking(event)}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= CSS ================= */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .events-page {
          width: 100%;
          min-height: 100vh;
          padding: 40px 25px;
          background: #f5f7fb;
          overflow-x: hidden;
        }

        .events-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .events-header h1 {
          margin: 0;
          font-size: 38px;
          color: #222;
          font-weight: 700;
        }

        .events-header p {
          margin-top: 10px;
          color: #777;
          font-size: 16px;
        }

        .event-filter {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto 35px;
          display: flex;
          gap: 15px;
        }

        .event-filter input {
          flex: 1;
          min-width: 0;
          height: 50px;
          padding: 0 18px;
          border: 1px solid #ddd;
          border-radius: 10px;
          outline: none;
          font-size: 15px;
          background: white;
        }

        .event-filter input:focus,
        .event-filter select:focus {
          border-color: #6c3cff;
          box-shadow: 0 0 0 3px rgba(108, 60, 255, 0.1);
        }

        .event-filter select {
          width: 200px;
          height: 50px;
          padding: 0 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
          outline: none;
          background: white;
          font-size: 15px;
        }

        .events-container {
          width: 100%;
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 280px), 1fr)
          );
          gap: 25px;
        }

        .event-card {
          min-width: 0;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.13);
        }

        .event-image {
          height: 220px;
          position: relative;
          overflow: hidden;
          background: #e9edf5;
        }

        .event-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          background: #e9edf5;
          font-size: 14px;
        }

        .event-category {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #6c3cff;
          color: white;
          padding: 7px 13px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .event-content {
          padding: 20px;
        }

        .event-content h2 {
          margin: 0 0 10px;
          font-size: 22px;
          color: #222;
          overflow-wrap: anywhere;
        }

        .event-description {
          color: #777;
          font-size: 14px;
          line-height: 1.5;
          min-height: 42px;
          overflow-wrap: anywhere;
        }

        .event-info {
          margin-top: 15px;
        }

        .event-info p {
          margin: 8px 0;
          color: #555;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .event-bottom {
          border-top: 1px solid #eee;
          margin-top: 18px;
          padding-top: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .event-price span {
          display: block;
          font-size: 12px;
          color: #888;
        }

        .event-price strong {
          display: block;
          color: #6c3cff;
          font-size: 23px;
          margin-top: 3px;
        }

        .event-bottom button {
          border: none;
          background: #6c3cff;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: 0.3s;
        }

        .event-bottom button:hover {
          background: #5428d4;
        }

        .no-events {
          grid-column: 1 / -1;
          text-align: center;
          background: white;
          padding: 60px 20px;
          border-radius: 15px;
          overflow-wrap: anywhere;
        }

        .no-events h2 {
          color: #333;
        }

        .no-events p {
          color: #777;
        }

        @media (max-width: 700px) {
          .events-page {
            padding: 25px 15px;
          }

          .events-header h1 {
            font-size: 30px;
          }

          .event-filter {
            flex-direction: column;
          }

          .event-filter select {
            width: 100%;
          }

          .events-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Events;
