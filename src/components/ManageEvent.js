import React, { useState } from "react";
import {
  isValidDate,
  isValidText,
} from "../utils/formValidation";

const ManageEvents = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Music Festival 2026",
      category: "Music",
      date: "25 Aug 2026",
      venue: "City Ground",
      organizer: "Eventza",
      status: "Upcoming",
    },
    {
      id: 2,
      name: "Tech Conference",
      category: "Technology",
      date: "30 Aug 2026",
      venue: "Grand Hall",
      organizer: "Eventza",
      status: "Upcoming",
    },
    {
      id: 3,
      name: "Comedy Night",
      category: "Comedy",
      date: "10 Sep 2026",
      venue: "Royal Auditorium",
      organizer: "Eventza",
      status: "Upcoming",
    },
    {
      id: 4,
      name: "Sports Meet",
      category: "Sports",
      date: "15 Jul 2026",
      venue: "Sports Complex",
      organizer: "Eventza",
      status: "Completed",
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const [editEvent, setEditEvent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Music",
    date: "",
    venue: "",
    organizer: "",
    status: "Upcoming",
  });


  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredEvents = events.filter((event) => {
    const searchMatch =
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      category === "All" || event.category === category;

    return searchMatch && categoryMatch;
  });


  // =========================
  // DELETE EVENT
  // =========================

  const deleteEvent = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (confirmDelete) {
      setEvents(events.filter((event) => event.id !== id));
    }
  };


  // =========================
  // EDIT EVENT
  // =========================

  const handleEdit = (event) => {
    setEditEvent(event);

    setFormData({
      name: event.name,
      category: event.category,
      date: event.date,
      venue: event.venue,
      organizer: event.organizer,
      status: event.status,
    });

    setShowModal(true);
  };


  // =========================
  // ADD EVENT
  // =========================

  const handleAdd = () => {
    setEditEvent(null);

    setFormData({
      name: "",
      category: "Music",
      date: "",
      venue: "",
      organizer: "",
      status: "Upcoming",
    });

    setShowModal(true);
  };


  // =========================
  // SAVE EVENT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidText(formData.name, 2, 120)) {
      alert("Event name must be between 2 and 120 characters.");
      return;
    }

    if (
      !["Music", "Technology", "Comedy", "Sports", "Conference"].includes(
        formData.category
      )
    ) {
      alert("Please select a valid event category.");
      return;
    }

    if (!isValidDate(formData.date)) {
      alert("Please enter a valid event date.");
      return;
    }

    if (!isValidText(formData.venue, 2, 120)) {
      alert("Venue must be between 2 and 120 characters.");
      return;
    }

    if (!isValidText(formData.organizer, 2, 120)) {
      alert("Organizer must be between 2 and 120 characters.");
      return;
    }

    if (!["Upcoming", "Completed"].includes(formData.status)) {
      alert("Please select a valid event status.");
      return;
    }

    const validatedFormData = {
      ...formData,
      name: formData.name.trim(),
      venue: formData.venue.trim(),
      organizer: formData.organizer.trim(),
    };

    if (editEvent) {
      setEvents(
        events.map((event) =>
          event.id === editEvent.id
            ? {
                ...event,
                ...validatedFormData,
              }
            : event
        )
      );
    } else {
      const newEvent = {
        id: Date.now(),
        ...validatedFormData,
      };

      setEvents([...events, newEvent]);
    }

    setShowModal(false);
  };


  return (
    <div className="manage-events">

      {/* =========================
          HEADER
      ========================== */}

      <div className="page-header">

        <div>
          <p className="breadcrumb">
            Admin / Events
          </p>

          <h1>
            Manage Events
          </h1>

          <p className="subtitle">
            Create, edit and manage all your events.
          </p>
        </div>

        <button
          className="add-event-btn"
          onClick={handleAdd}
        >
          + Add Event
        </button>

      </div>


      {/* =========================
          STAT CARDS
      ========================== */}

      <div className="stats">

        <div className="stat-card">

          <div className="stat-icon purple">
            📅
          </div>

          <div>
            <span>Total Events</span>
            <h2>{events.length}</h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon blue">
            🔔
          </div>

          <div>
            <span>Upcoming</span>
            <h2>
              {
                events.filter(
                  (event) =>
                    event.status === "Upcoming"
                ).length
              }
            </h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <h2>
              {
                events.filter(
                  (event) =>
                    event.status === "Completed"
                ).length
              }
            </h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon orange">
            🎫
          </div>

          <div>
            <span>Categories</span>
            <h2>5</h2>
          </div>

        </div>

      </div>


      {/* =========================
          TABLE CARD
      ========================== */}

      <div className="table-card">

        {/* TOOLBAR */}

        <div className="toolbar">

          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search events..."
              value={search}
              maxLength={100}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <select
            value={category}
            onChange={(e) => {
              const value = e.target.value;
              if (
                ["All", "Music", "Technology", "Comedy", "Sports", "Conference"].includes(value)
              ) {
                setCategory(value);
              }
            }}
          >
            <option value="All">
              All Categories
            </option>

            <option value="Music">
              Music
            </option>

            <option value="Technology">
              Technology
            </option>

            <option value="Comedy">
              Comedy
            </option>

            <option value="Sports">
              Sports
            </option>

            <option value="Conference">
              Conference
            </option>

          </select>

        </div>


        {/* TABLE */}

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Organizer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {filteredEvents.length > 0 ? (

                filteredEvents.map((event) => (

                  <tr key={event.id}>

                    <td>

                      <div className="event-name">

                        <div className="event-icon">
                          🎫
                        </div>

                        <div>
                          <strong>
                            {event.name}
                          </strong>

                          <small>
                            Event #{event.id}
                          </small>
                        </div>

                      </div>

                    </td>


                    <td>
                      <span className="category">
                        {event.category}
                      </span>
                    </td>


                    <td>
                      📅 {event.date}
                    </td>


                    <td>
                      📍 {event.venue}
                    </td>


                    <td>
                      {event.organizer}
                    </td>


                    <td>

                      <span
                        className={
                          event.status === "Upcoming"
                            ? "status upcoming"
                            : "status completed"
                        }
                      >
                        ● {event.status}
                      </span>

                    </td>


                    <td>

                      <div className="actions">

                        <button
                          className="view-btn"
                          title="View"
                          onClick={() =>
                            alert(
                              `Event: ${event.name}`
                            )
                          }
                        >
                          👁
                        </button>


                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() =>
                            handleEdit(event)
                          }
                        >
                          ✏️
                        </button>


                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() =>
                            deleteEvent(event.id)
                          }
                        >
                          🗑
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="no-data"
                  >
                    No events found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================
          ADD / EDIT MODAL
      ========================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editEvent
                    ? "Edit Event"
                    : "Add New Event"}
                </h2>

                <p>
                  Enter event information below.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>


            <form noValidate onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group full">

                  <label>
                    Event Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter event name"
                    value={formData.name}
                    maxLength={120}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                  >

                    <option value="Music">
                      Music
                    </option>

                    <option value="Technology">
                      Technology
                    </option>

                    <option value="Comedy">
                      Comedy
                    </option>

                    <option value="Sports">
                      Sports
                    </option>

                    <option value="Conference">
                      Conference
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Date
                  </label>

                  <input
                    type="text"
                    placeholder="25 Aug 2026"
                    value={formData.date}
                    maxLength={40}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                      })
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Venue
                  </label>

                  <input
                    type="text"
                    placeholder="Enter venue"
                    value={formData.venue}
                    maxLength={120}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venue: e.target.value,
                      })
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Organizer
                  </label>

                  <input
                    type="text"
                    placeholder="Enter organizer"
                    value={formData.organizer}
                    maxLength={120}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizer: e.target.value,
                      })
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                  >

                    <option value="Upcoming">
                      Upcoming
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editEvent
                    ? "Update Event"
                    : "Add Event"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          CSS
      ========================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .manage-events {
          min-height: 100vh;
          padding: 30px;
          background: #f6f7fb;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          color: #292333;
        }


        /* HEADER */

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .breadcrumb {
          margin: 0 0 7px;
          color: #8f8999;
          font-size: 12px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .subtitle {
          margin: 7px 0 0;
          color: #96909d;
          font-size: 13px;
        }


        .add-event-btn {
          border: none;
          border-radius: 8px;
          background: #704cff;
          color: white;
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .add-event-btn:hover {
          background: #5c3de0;
          transform: translateY(-1px);
        }


        /* STATS */

        .stats {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: white;
          border: 1px solid #eeeaf2;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .purple {
          background: #f0ebff;
        }

        .blue {
          background: #eaf5ff;
        }

        .green {
          background: #e9f9ef;
        }

        .orange {
          background: #fff3e5;
        }

        .stat-card span {
          display: block;
          color: #99939f;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .stat-card h2 {
          margin: 0;
          font-size: 22px;
        }


        /* TABLE CARD */

        .table-card {
          background: white;
          border: 1px solid #eeeaf2;
          border-radius: 13px;
          overflow: hidden;
        }


        /* TOOLBAR */

        .toolbar {
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #eeeaf2;
        }

        .search-box {
          width: 330px;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #e3dfea;
          border-radius: 8px;
          padding: 0 12px;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 12px;
        }

        .toolbar select {
          height: 40px;
          border: 1px solid #e3dfea;
          border-radius: 8px;
          padding: 0 12px;
          outline: none;
          font-size: 12px;
          color: #514b58;
          background: white;
        }


        /* TABLE */

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
        }

        th {
          padding: 14px 18px;
          text-align: left;
          background: #faf9fc;
          color: #88818f;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        td {
          padding: 16px 18px;
          border-top: 1px solid #f0edf3;
          color: #625b68;
          font-size: 11px;
        }


        /* EVENT */

        .event-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .event-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #f0ebff;
          font-size: 17px;
        }

        .event-name strong {
          display: block;
          color: #332c3b;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .event-name small {
          color: #aaa3ae;
          font-size: 9px;
        }


        /* CATEGORY */

        .category {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          background: #f1edff;
          color: #704cff;
          font-size: 9px;
          font-weight: 600;
        }


        /* STATUS */

        .status {
          font-size: 9px;
          font-weight: 700;
        }

        .upcoming {
          color: #269b5d;
        }

        .completed {
          color: #88818d;
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
          border-radius: 7px;
          cursor: pointer;
          background: #f7f6f9;
        }

        .view-btn:hover {
          background: #eaf5ff;
        }

        .edit-btn:hover {
          background: #f0ebff;
        }

        .delete-btn:hover {
          background: #fff0f0;
        }


        .no-data {
          text-align: center;
          padding: 50px;
          color: #999;
        }


        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(20, 15, 30, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 14px;
          box-shadow:
            0 20px 60px
            rgba(0,0,0,0.2);
        }


        .modal-header {
          padding: 22px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid #eeeaf2;
        }

        .modal-header h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .modal-header p {
          margin: 0;
          color: #99939f;
          font-size: 11px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 7px;
          background: #f5f3f7;
          font-size: 22px;
          cursor: pointer;
          color: #666;
        }


        /* FORM */

        form {
          padding: 22px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 17px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          font-size: 11px;
          font-weight: 700;
          color: #413b48;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 42px;
          border: 1px solid #ded9e5;
          border-radius: 7px;
          padding: 0 11px;
          outline: none;
          font-size: 11px;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #704cff;
          box-shadow:
            0 0 0 3px
            rgba(112,76,255,0.08);
        }


        /* MODAL BUTTONS */

        .modal-actions {
          margin-top: 25px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cancel-btn,
        .save-btn {
          height: 40px;
          padding: 0 18px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .cancel-btn {
          border: 1px solid #ddd8e3;
          background: white;
          color: #666;
        }

        .save-btn {
          border: none;
          background: #704cff;
          color: white;
        }

        .save-btn:hover {
          background: #5d3de0;
        }


        /* =========================
           RESPONSIVE
        ========================== */

        @media (max-width: 1000px) {

          .stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        @media (max-width: 700px) {

          .manage-events {
            padding: 18px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .add-event-btn {
            width: 100%;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
          }

          .toolbar select {
            width: 100%;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

        }

      `}</style>

    </div>
  );
};

export default ManageEvents