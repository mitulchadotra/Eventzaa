
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEvents,
  getBookings,
  cancelBooking,
  removeBooking,
} from "../Api";
import {
  isValidDate,
  isValidEmail,
} from "../utils/formValidation";

const getMinBookingDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const ManageBooking = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eventName, setEventName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const getEventName = (event) =>
    event.name ||
    event.eventName ||
    event.title ||
    event.eventTitle ||
    "";

  const getBookingId = (booking) =>
    booking._id || booking.bookingId;

  const loadData = useCallback(async (loggedInUser) => {
    try {
      setLoading(true);
      setError("");

      const [eventResponse, bookingResponse] = await Promise.all([
        getEvents(),
        getBookings(),
      ]);

      const eventData =
        eventResponse.data?.data ||
        eventResponse.data?.events ||
        [];

      const bookingData =
        bookingResponse.data?.data || [];

      setEvents(Array.isArray(eventData) ? eventData : []);

      const email = (loggedInUser.email || "")
        .trim()
        .toLowerCase();

      const userBookings = (
        Array.isArray(bookingData) ? bookingData : []
      ).filter(
        (booking) =>
          (booking.email || "").trim().toLowerCase() === email
      );

      setBookings(userBookings);
    } catch (err) {
      console.error(
        "Load booking data error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Events ya bookings backend se load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("loggedInUser");

      if (!savedUser) {
        navigate("/login");
        return;
      }

      const loggedInUser = JSON.parse(savedUser);

      if (!loggedInUser?.email) {
        navigate("/login");
        return;
      }

      setUser(loggedInUser);
      loadData(loggedInUser);
    } catch (err) {
      console.error("User data error:", err);
      navigate("/login");
    }
  }, [navigate, loadData]);

  const handleBooking = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isValidEmail(user?.email)) {
      setError("Please login before booking.");
      return;
    }

    if (!user?.name?.trim()) {
      setError("Please enter your name in your profile.");
      return;
    }

    if (!eventName) {
      setError("Please select an event.");
      return;
    }

    if (!isValidDate(bookingDate)) {
      setError("Please select a valid booking date.");
      return;
    }

    if (bookingDate < getMinBookingDate()) {
      setError("Booking date must be tomorrow or later.");
      return;
    }

    const quantity = Number(seats);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      setError("Please select between 1 and 20 seats.");
      return;
    }

    const selectedEvent = events.find(
      (event) => getEventName(event) === eventName
    );

    if (!selectedEvent) {
      setError("Selected event backend se nahi mila.");
      return;
    }

    const price = Number(selectedEvent.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Selected event ki valid price available nahi hai.");
      return;
    }

    const eventDate =
      selectedEvent.date ||
      selectedEvent.eventDate ||
      selectedEvent.startDate ||
      bookingDate;

    if (!isValidDate(String(eventDate))) {
      setError("Selected event ki valid date available nahi hai.");
      return;
    }

    const bookingDraft = {
      userName: user.name.trim(),
      userEmail: user.email.trim().toLowerCase(),
      eventName,
      eventTitle: eventName,
      bookingDate: eventDate,
      date: eventDate,
      seats: quantity,
      quantity,
      price,
      amount: price * quantity,
      totalAmount: price * quantity,
      location:
        selectedEvent.location ||
        selectedEvent.venue ||
        "",
      eventId: selectedEvent._id || selectedEvent.id || null,
    };

    if (!bookingDraft.location) {
      setError("Selected event ki location available nahi hai.");
      return;
    }

    // Payment.js backend API se booking create karega.
    // Yahan booking ko dobara create nahi karna hai.
    navigate("/Payment", {
      state: { booking: bookingDraft },
    });
  };

  const handleCancel = async (id) => {
    if (!id) {
      setError("Booking ID missing hai.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setActionLoading(id);

      await cancelBooking(id);

      setBookings((previous) =>
        previous.map((booking) =>
          getBookingId(booking) === id
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );

      setMessage("Booking cancelled successfully.");
    } catch (err) {
      console.error(
        "Cancel booking error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Booking cancel nahi hui."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError("Booking ID missing hai.");
      return;
    }

    if (!window.confirm("Delete this booking permanently?")) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setActionLoading(id);

      await removeBooking(id);

      setBookings((previous) =>
        previous.filter(
          (booking) => getBookingId(booking) !== id
        )
      );

      setMessage("Booking deleted successfully.");
    } catch (err) {
      console.error(
        "Delete booking error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Booking delete nahi hui."
      );
    } finally {
      setActionLoading("");
    }
  };

  const refreshBookings = async () => {
    if (!user) return;

    setMessage("");
    await loadData(user);
    setMessage("Bookings refreshed.");
  };

  const getStatusClass = (status) => {
    if (status === "Confirmed") return "confirmed";
    if (status === "Cancelled") return "cancelled";
    return "pending";
  };

  if (!user) {
    return (
      <div className="mb-loading">
        Checking login...
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="manage-booking-page">
      <div className="page-header">
        <div>
          <h1>Manage Booking</h1>
          <p>Create and manage your event bookings</p>
        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Home
        </button>
      </div>

      <div className="booking-form-card">
        <div className="form-title">
          <h2>Create New Booking</h2>
          <p>Select an event and book your seats</p>
        </div>

        {message && (
          <div className="success-message">✓ {message}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form noValidate onSubmit={handleBooking}>
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              value={user.name || user.userName || ""}
              readOnly
              placeholder="Name from your account"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email || ""}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Select Event</label>
            <select
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                setError("");
                setMessage("");
              }}
              required
            >
              <option value="">-- Select Event --</option>

              {events.map((event, index) => {
                const name = getEventName(event);

                return (
                  <option
                    key={event._id || event.id || index}
                    value={name}
                  >
                    {name || "Unnamed Event"}
                  </option>
                );
              })}
            </select>

            {events.length === 0 && !loading && (
              <small>No events loaded from backend.</small>
            )}
          </div>

          <div className="form-group">
            <label>Booking Date</label>
            <input
              type="date"
              min={getMinBookingDate()}
              value={bookingDate}
              onChange={(e) => {
                setBookingDate(e.target.value);
                setError("");
                setMessage("");
              }}
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Seats</label>
            <input
              type="number"
              min="1"
              max="20"
              value={seats}
              onChange={(e) => {
                setSeats(e.target.value);
                setError("");
                setMessage("");
              }}
              required
            />
          </div>

          {eventName && (
            <div className="selected-price">
              <span>Price per seat</span>
              <strong>
                ₹
                {Number(
                  events.find(
                    (event) => getEventName(event) === eventName
                  )?.price || 0
                ).toLocaleString("en-IN")}
              </strong>

              <span>Total</span>
              <strong>
                ₹
                {(
                  Number(
                    events.find(
                      (event) => getEventName(event) === eventName
                    )?.price || 0
                  ) * Number(seats || 0)
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          )}

          <button type="submit" className="book-btn">
            💳 Continue to Payment
          </button>
        </form>
      </div>

      <div className="my-bookings-card">
        <div className="section-title">
          <div>
            <h2>My Bookings</h2>
            <p>Your bookings saved in the backend database</p>
          </div>

          <div className="section-actions">
            <span className="booking-count">
              {bookings.length} Bookings
            </span>

            <button
              type="button"
              className="refresh-btn"
              onClick={refreshBookings}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty">
            <h3>Loading bookings...</h3>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <h3>No Bookings Yet</h3>
            <p>Your bookings will appear here after confirmation.</p>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => {
              const id = getBookingId(booking);

              return (
                <div className="booking-item" key={id}>
                  <div className="event-section">
                    <div className="event-icon">🎫</div>

                    <div>
                      <h3>{booking.eventTitle}</h3>
                      <p>
                        Booking ID:{" "}
                        {booking.bookingId || booking._id}
                      </p>
                    </div>
                  </div>

                  <div className="booking-info">
                    <div>
                      <span>Customer</span>
                      <strong>{booking.userName || "-"}</strong>
                    </div>

                    <div>
                      <span>Event Date</span>
                      <strong>
                        {booking.date
                          ? new Date(
                              booking.date
                            ).toLocaleDateString()
                          : "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>{booking.location || "-"}</strong>
                    </div>

                    <div>
                      <span>Seats</span>
                      <strong>{booking.quantity ?? 1}</strong>
                    </div>

                    <div>
                      <span>Total Amount</span>
                      <strong>
                        ₹
                        {Number(
                          booking.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Payment</span>
                      <strong
                        className={
                          booking.paymentStatus === "Paid"
                            ? "confirmed"
                            : "pending"
                        }
                      >
                        {booking.paymentStatus || "Pending"}
                      </strong>
                    </div>

                    <div>
                      <span>Booking Status</span>
                      <strong
                        className={getStatusClass(booking.status)}
                      >
                        {booking.status || "Pending"}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.status !== "Cancelled" && (
                      <button
                        type="button"
                        className="cancel-btn"
                        disabled={actionLoading === id}
                        onClick={() => handleCancel(id)}
                      >
                        {actionLoading === id
                          ? "Please wait..."
                          : "Cancel Booking"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="delete-btn"
                      disabled={actionLoading === id}
                      onClick={() => handleDelete(id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .manage-booking-page {
    width: 100%;
    min-height: 100vh;
    padding: 35px;
    background: #f7f5ff;
    box-sizing: border-box;
  }

  .manage-booking-page * {
    box-sizing: border-box;
  }

  .page-header {
    max-width: 1100px;
    margin: 0 auto 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .page-header h1 {
    margin: 0;
    color: #27232f;
    font-size: 30px;
    font-weight: 800;
  }

  .page-header p {
    margin: 7px 0 0;
    color: #777;
    font-size: 13px;
  }

  .back-btn,
  .refresh-btn {
    padding: 11px 18px;
    border: 1px solid #704cff;
    border-radius: 8px;
    background: white;
    color: #704cff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .back-btn:hover,
  .refresh-btn:hover {
    background: #704cff;
    color: white;
  }

  .refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .booking-form-card,
  .my-bookings-card {
    max-width: 1100px;
    margin: 0 auto 25px;
    padding: 25px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
  }

  .form-title {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .form-title h2,
  .section-title h2 {
    margin: 0;
    color: #27232f;
    font-size: 20px;
  }

  .form-title p,
  .section-title p {
    margin: 5px 0 0;
    color: #888;
    font-size: 12px;
  }

  .booking-form-card form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .form-group label {
    margin-bottom: 7px;
    color: #444;
    font-size: 12px;
    font-weight: 700;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    border: 1px solid #ddd9e5;
    border-radius: 8px;
    outline: none;
    background: white;
    color: #333;
    font-size: 13px;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: #704cff;
    box-shadow: 0 0 0 3px rgba(112, 76, 255, 0.08);
  }

  .form-group input[readonly] {
    background: #f5f4f8;
    color: #777;
  }

  .selected-price {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    align-self: center;
    color: #704cff;
    font-size: 13px;
  }

  .book-btn {
    grid-column: 1 / -1;
    width: 100%;
    min-height: 45px;
    border: none;
    border-radius: 8px;
    background: #704cff;
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .book-btn:hover {
    background: #5d3de0;
  }

  .success-message,
  .error-message {
    margin-bottom: 15px;
    padding: 11px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .success-message {
    background: #e9faef;
    color: #26974d;
  }

  .error-message {
    background: #ffebeb;
    color: #dc4040;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 18px;
    border-bottom: 1px solid #eee;
  }

  .section-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .booking-count {
    padding: 7px 12px;
    border-radius: 20px;
    background: #f0ebff;
    color: #704cff;
    font-size: 11px;
    font-weight: 700;
  }

  .booking-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding-top: 20px;
  }

  .booking-item {
    min-width: 0;
    padding: 20px;
    border: 1px solid #ebe8f1;
    border-radius: 12px;
  }

  .event-section {
    display: flex;
    align-items: center;
    gap: 13px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .event-icon {
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f0ebff;
    font-size: 20px;
  }

  .event-section h3 {
    margin: 0;
    color: #27232f;
    font-size: 16px;
  }

  .event-section p {
    margin: 5px 0 0;
    color: #999;
    font-size: 10px;
    overflow-wrap: anywhere;
  }

  .booking-info {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    padding: 18px 0;
  }

  .booking-info > div {
    min-width: 0;
    padding: 12px;
    background: #faf9ff;
    border-radius: 8px;
  }

  .booking-info span {
    display: block;
    margin-bottom: 6px;
    color: #999;
    font-size: 10px;
  }

  .booking-info strong {
    display: block;
    overflow-wrap: anywhere;
    color: #333;
    font-size: 12px;
  }

  .booking-info .confirmed {
    color: #26974d;
  }

  .booking-info .pending {
    color: #d89019;
  }

  .booking-info .cancelled {
    color: #dc4040;
  }

  .booking-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }

  .booking-actions button {
    padding: 9px 15px;
    border-radius: 7px;
    border: none;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .booking-actions button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: #fff4df;
    color: #d89019;
  }

  .cancel-btn:hover {
    background: #d89019;
    color: white;
  }

  .delete-btn {
    background: #ffebeb;
    color: #dc4040;
  }

  .delete-btn:hover {
    background: #dc4040;
    color: white;
  }

  .empty,
  .mb-loading {
    padding: 60px 20px;
    text-align: center;
  }

  .empty-icon {
    margin-bottom: 10px;
    font-size: 45px;
  }

  .empty h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }

  .empty p {
    margin: 7px 0;
    color: #999;
    font-size: 12px;
  }

  @media (max-width: 800px) {
    .manage-booking-page {
      padding: 20px 15px;
    }

    .page-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .back-btn {
      width: 100%;
    }

    .booking-form-card form {
      grid-template-columns: 1fr;
    }

    .booking-info {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 500px) {
    .booking-form-card,
    .my-bookings-card {
      padding: 18px;
    }

    .booking-info {
      grid-template-columns: 1fr;
    }

    .section-title {
      align-items: flex-start;
      flex-direction: column;
    }

    .booking-actions {
      flex-direction: column;
    }

    .booking-actions button {
      width: 100%;
    }
  }
`;

export default ManageBooking;
