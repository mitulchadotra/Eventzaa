import React, { useEffect, useState } from "react";
import { isValidEmail, isValidText } from "../utils/formValidation";

const AdminManageBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dataError, setDataError] = useState("");

  // =========================
  // LOAD BOOKINGS
  // =========================

  useEffect(() => {
    try {
      const savedBookings = JSON.parse(
        localStorage.getItem("bookings") || "[]"
      );

      if (!Array.isArray(savedBookings)) {
        throw new Error("Saved booking data must be a list.");
      }

      const validBookings = savedBookings.filter(
        (booking) =>
          booking &&
          typeof booking === "object" &&
          !Array.isArray(booking)
      );

      if (validBookings.length !== savedBookings.length) {
        setDataError("Some invalid booking records were excluded.");
      }

      setBookings(validBookings);
    } catch (error) {
      console.error("Invalid saved booking data:", error);
      setBookings([]);
      setDataError("Saved booking details are invalid and could not be loaded.");
    }
  }, []);

  // =========================
  // UPDATE LOCAL STORAGE
  // =========================

  const updateBookings = (updatedBookings) => {
    setBookings(updatedBookings);
    setDataError("");

    localStorage.setItem(
      "bookings",
      JSON.stringify(updatedBookings)
    );
  };

  // =========================
  // CONFIRM BOOKING
  // =========================

  const handleConfirm = (id) => {
    const selectedBooking = bookings.find((booking) => booking.id === id);

    if (
      !selectedBooking ||
      !isValidText(String(id || ""), 1, 100) ||
      !isValidText(selectedBooking.userName, 2, 80) ||
      !isValidEmail(selectedBooking.userEmail) ||
      !isValidText(selectedBooking.eventName, 2, 200) ||
      !["Pending", "Confirmed", "Cancelled"].includes(selectedBooking.status)
    ) {
      setDataError("This booking has invalid details and cannot be updated.");
      return;
    }

    const updatedBookings = bookings.map(
      (booking) =>
        booking.id === id
          ? {
              ...booking,
              status: "Confirmed",
            }
          : booking
    );

    updateBookings(updatedBookings);
  };

  // =========================
  // CANCEL BOOKING
  // =========================

  const handleCancel = (id) => {
    const selectedBooking = bookings.find((booking) => booking.id === id);

    if (
      !selectedBooking ||
      !isValidText(String(id || ""), 1, 100) ||
      !isValidText(selectedBooking.userName, 2, 80) ||
      !isValidEmail(selectedBooking.userEmail) ||
      !isValidText(selectedBooking.eventName, 2, 200) ||
      !["Pending", "Confirmed", "Cancelled"].includes(selectedBooking.status)
    ) {
      setDataError("This booking has invalid details and cannot be updated.");
      return;
    }

    const updatedBookings = bookings.map(
      (booking) =>
        booking.id === id
          ? {
              ...booking,
              status: "Cancelled",
            }
          : booking
    );

    updateBookings(updatedBookings);
  };

  // =========================
  // DELETE BOOKING
  // =========================

  const handleDelete = (id) => {
    if (!isValidText(String(id || ""), 1, 100)) {
      setDataError("This booking has an invalid ID and cannot be deleted.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );

    if (!confirmDelete) {
      return;
    }

    const updatedBookings =
      bookings.filter(
        (booking) =>
          booking.id !== id
      );

    updateBookings(updatedBookings);
  };

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredBookings =
    bookings.filter((booking) => {

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        String(
          booking.userName || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          booking.userEmail || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          booking.eventName || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          booking.id || ""
        )
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        ["All", "Pending", "Confirmed", "Cancelled"].includes(statusFilter) &&
        (statusFilter === "All" ||
        booking.status ===
          statusFilter);

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // =========================
  // STATISTICS
  // =========================

  const totalBookings =
    bookings.length;

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "Confirmed"
    ).length;

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "Pending"
    ).length;

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "Cancelled"
    ).length;

  return (
    <div className="manage-bookings">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>
            Manage Bookings
          </h1>

          <p>
            View and manage all event
            bookings
          </p>
        </div>

      </div>

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon purple">
            📋
          </div>

          <div>
            <span>
              Total Bookings
            </span>

            <h2>
              {totalBookings}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>
              Confirmed
            </span>

            <h2>
              {confirmedBookings}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            ⏳
          </div>

          <div>
            <span>
              Pending
            </span>

            <h2>
              {pendingBookings}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            ✕
          </div>

          <div>
            <span>
              Cancelled
            </span>

            <h2>
              {cancelledBookings}
            </h2>
          </div>
        </div>

      </div>

      {/* =========================
          FILTER
      ========================= */}

      <div className="filter-card">

        <div className="search-box">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by user, email, event or booking ID..."
            value={search}
            maxLength={100}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (["All", "Pending", "Confirmed", "Cancelled"].includes(value)) {
              setStatusFilter(value);
            }
          }}
        >
          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Confirmed">
            Confirmed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

      </div>

      {dataError && (
        <p className="error-message" role="alert">
          {dataError}
        </p>
      )}

      {/* =========================
          BOOKINGS TABLE
      ========================= */}

      <div className="table-card">

        <div className="table-header">

          <div>
            <h2>
              All Bookings
            </h2>

            <p>
              {filteredBookings.length}
              {" "}
              booking(s) found
            </p>
          </div>

        </div>

        {filteredBookings.length === 0 ? (

          <div className="no-bookings">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              No Bookings Found
            </h3>

            <p>
              There are no bookings
              matching your search.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Booking ID
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Event
                  </th>

                  <th>
                    Booking Date
                  </th>

                  <th>
                    Seats
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredBookings.map(
                  (booking) => (

                    <tr
                      key={
                        booking.id
                      }
                    >

                      {/* BOOKING ID */}
                      <td>

                        <strong className="booking-id">
                          #
                          {booking.id}
                        </strong>

                      </td>

                      {/* USER */}
                      <td>

                        <div className="user-info">

                          <div className="user-avatar">
                            {(
                              booking.userName ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {
                                booking.userName ||
                                "Unknown User"
                              }
                            </strong>

                            <span>
                              {
                                booking.userEmail ||
                                "No email"
                              }
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EVENT */}
                      <td>

                        <strong>
                          {
                            booking.eventName ||
                            "Unknown Event"
                          }
                        </strong>

                      </td>

                      {/* DATE */}
                      <td>

                        {
                          booking.bookingDate ||
                          booking.date ||
                          "N/A"
                        }

                      </td>

                      {/* SEATS */}
                      <td>

                        <span className="seat-badge">
                          {booking.seats ||
                            booking.numberOfSeats ||
                            0}
                        </span>

                      </td>

                      {/* PAYMENT */}
                      <td>

                        <span
                          className={
                            booking.paymentStatus ===
                            "Paid"
                              ? "payment paid"
                              : "payment pending"
                          }
                        >
                          {
                            booking.paymentStatus ||
                            "Pending"
                          }
                        </span>

                      </td>

                      {/* STATUS */}
                      <td>

                        <span
                          className={
                            booking.status ===
                            "Confirmed"
                              ? "status confirmed"
                              : booking.status ===
                                "Cancelled"
                              ? "status cancelled"
                              : "status pending"
                          }
                        >
                          {
                            booking.status ||
                            "Pending"
                          }
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td>

                        <div className="actions">

                          {booking.status !==
                            "Confirmed" && (

                            <button
                              className="confirm-btn"
                              title="Confirm Booking"
                              onClick={() =>
                                handleConfirm(
                                  booking.id
                                )
                              }
                            >
                              ✓
                            </button>

                          )}

                          {booking.status !==
                            "Cancelled" && (

                            <button
                              className="cancel-btn"
                              title="Cancel Booking"
                              onClick={() =>
                                handleCancel(
                                  booking.id
                                )
                              }
                            >
                              ✕
                            </button>

                          )}

                          <button
                            className="delete-btn"
                            title="Delete Booking"
                            onClick={() =>
                              handleDelete(
                                booking.id
                              )
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =========================
          CSS
      ========================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .manage-bookings {
          width: 100%;
          min-height: 100vh;

          padding: 30px;

          background: #f7f5ff;

          color: #27232f;
        }

        /* HEADER */

        .page-header {
          margin-bottom: 25px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-header h1 {
          margin: 0;

          font-size: 28px;
          font-weight: 800;

          color: #27232f;
        }

        .page-header p {
          margin: 7px 0 0;

          color: #777;

          font-size: 13px;
        }

        /* STATISTICS */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 18px;

          margin-bottom: 22px;
        }

        .stat-card {
          display: flex;
          align-items: center;

          gap: 15px;

          padding: 20px;

          background: white;

          border-radius: 12px;

          box-shadow:
            0 5px 20px
            rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          font-size: 19px;
          font-weight: 800;
        }

        .stat-icon.purple {
          background: #eee9ff;
          color: #704cff;
        }

        .stat-icon.green {
          background: #e9faef;
          color: #2caf5d;
        }

        .stat-icon.orange {
          background: #fff4df;
          color: #ed9c20;
        }

        .stat-icon.red {
          background: #ffebeb;
          color: #e04444;
        }

        .stat-card span {
          color: #888;

          font-size: 11px;
        }

        .stat-card h2 {
          margin: 5px 0 0;

          font-size: 24px;

          color: #27232f;
        }

        /* FILTER */

        .filter-card {
          display: flex;

          gap: 15px;

          padding: 18px;

          margin-bottom: 20px;

          background: white;

          border-radius: 12px;

          box-shadow:
            0 5px 20px
            rgba(0, 0, 0, 0.05);
        }

        .search-box {
          flex: 1;

          height: 43px;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 0 13px;

          border:
            1px solid #e2deeb;

          border-radius: 8px;
        }

        .search-box span {
          font-size: 14px;
        }

        .search-box input {
          width: 100%;

          border: none;

          outline: none;

          font-size: 13px;

          color: #333;
        }

        .filter-card select {
          width: 180px;

          height: 43px;

          padding: 0 12px;

          border:
            1px solid #e2deeb;

          border-radius: 8px;

          outline: none;

          color: #444;

          background: white;

          cursor: pointer;
        }

        /* TABLE */

        .table-card {
          width: 100%;

          background: white;

          border-radius: 12px;

          box-shadow:
            0 5px 20px
            rgba(0, 0, 0, 0.05);

          overflow: hidden;
        }

        .table-header {
          padding: 20px;

          border-bottom:
            1px solid #eee;
        }

        .table-header h2 {
          margin: 0;

          font-size: 18px;
        }

        .table-header p {
          margin: 5px 0 0;

          color: #888;

          font-size: 12px;
        }

        .table-wrapper {
          width: 100%;

          overflow-x: auto;
        }

        table {
          width: 100%;

          border-collapse:
            collapse;

          min-width: 1050px;
        }

        th {
          padding: 14px 15px;

          background: #faf9ff;

          color: #777;

          text-align: left;

          font-size: 11px;

          font-weight: 700;

          white-space: nowrap;
        }

        td {
          padding: 15px;

          border-top:
            1px solid #f0eef4;

          color: #444;

          font-size: 12px;

          vertical-align: middle;
        }

        tr:hover td {
          background: #fcfbff;
        }

        /* BOOKING ID */

        .booking-id {
          color: #704cff;

          font-size: 12px;
        }

        /* USER */

        .user-info {
          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 180px;
        }

        .user-avatar {
          width: 35px;
          height: 35px;

          min-width: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #704cff,
              #9b63ff
            );

          color: white;

          font-size: 13px;

          font-weight: 800;
        }

        .user-info strong {
          display: block;

          color: #333;

          font-size: 12px;
        }

        .user-info span {
          display: block;

          margin-top: 3px;

          color: #999;

          font-size: 10px;
        }

        /* SEATS */

        .seat-badge {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-width: 30px;

          padding: 5px 8px;

          border-radius: 6px;

          background: #f0ebff;

          color: #704cff;

          font-weight: 700;
        }

        /* PAYMENT */

        .payment {
          padding: 5px 9px;

          border-radius: 15px;

          font-size: 10px;

          font-weight: 700;
        }

        .payment.paid {
          background: #e9faef;

          color: #25934c;
        }

        .payment.pending {
          background: #fff4df;

          color: #d98b13;
        }

        /* STATUS */

        .status {
          display: inline-block;

          padding: 5px 9px;

          border-radius: 15px;

          font-size: 10px;

          font-weight: 700;
        }

        .status.confirmed {
          background: #e9faef;

          color: #25934c;
        }

        .status.pending {
          background: #fff4df;

          color: #d98b13;
        }

        .status.cancelled {
          background: #ffebeb;

          color: #d93d3d;
        }

        /* ACTIONS */

        .actions {
          display: flex;

          gap: 6px;
        }

        .actions button {
          width: 30px;
          height: 30px;

          border: none;

          border-radius: 6px;

          cursor: pointer;

          font-size: 12px;

          font-weight: 700;
        }

        .confirm-btn {
          background: #e9faef;

          color: #25934c;
        }

        .confirm-btn:hover {
          background: #25934c;

          color: white;
        }

        .cancel-btn {
          background: #fff4df;

          color: #d98b13;
        }

        .cancel-btn:hover {
          background: #d98b13;

          color: white;
        }

        .delete-btn {
          background: #ffebeb;

          color: #dc3d3d;
        }

        .delete-btn:hover {
          background: #dc3d3d;

          color: white;
        }

        /* EMPTY */

        .no-bookings {
          padding: 70px 20px;

          text-align: center;
        }

        .empty-icon {
          font-size: 45px;

          margin-bottom: 10px;
        }

        .no-bookings h3 {
          margin: 0;

          font-size: 18px;

          color: #333;
        }

        .no-bookings p {
          margin-top: 7px;

          color: #999;

          font-size: 12px;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 700px) {

          .manage-bookings {
            padding: 20px 15px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-card {
            flex-direction: column;
          }

          .filter-card select {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
};

export default AdminManageBooking;