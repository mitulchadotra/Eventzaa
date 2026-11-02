import React, { useState } from "react";

const UserProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
  const [user, setUser] = useState(storedUser);
  const [formData, setFormData] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    const updatedUser = {
      ...user,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));

    const registeredUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (registeredUser) {
      localStorage.setItem(
        "registeredUser",
        JSON.stringify({ ...registeredUser, ...updatedUser })
      );
    }

    setUser(updatedUser);
    setFormData(updatedUser);
    setError("");
    setIsEditing(false);
    window.dispatchEvent(new Event("authChanged"));
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setError("");
    setIsEditing(false);
  };

  return (
    <main className="user-profile-page">
      <section className="user-profile-card">
        <div className="user-profile-heading">
          <div className="user-profile-avatar">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <span className="user-profile-eyebrow">ACCOUNT</span>
            <h1>My Profile</h1>
            <p>Manage your Eventza account details</p>
          </div>
        </div>

        {isEditing ? (
          <form className="user-profile-form" onSubmit={handleSave}>
            <label>
              Full name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
            </label>
            <label>
              Phone number
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
              />
            </label>
            {error && <p className="user-profile-error">{error}</p>}
            <div className="user-profile-actions">
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="user-profile-details">
            <div className="user-profile-detail">
              <span>Full name</span>
              <strong>{user.name || "User"}</strong>
            </div>
            <div className="user-profile-detail">
              <span>Email address</span>
              <strong>{user.email || "Not provided"}</strong>
            </div>
            <div className="user-profile-detail">
              <span>Phone number</span>
              <strong>{user.phone || "Not provided"}</strong>
            </div>
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </section>

      <style>{`
        .user-profile-page {
          min-height: 65vh;
          padding: 64px 20px;
          display: flex;
          justify-content: center;
          background: linear-gradient(135deg, #f7f4ff 0%, #fff9f2 100%);
        }

        .user-profile-card {
          width: min(100%, 620px);
          height: fit-content;
          padding: 36px;
          border: 1px solid #ebe5f5;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 18px 45px rgba(62, 42, 112, 0.12);
        }

        .user-profile-heading {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-bottom: 28px;
          border-bottom: 1px solid #eeeaf4;
        }

        .user-profile-avatar {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #704cff, #9b63ff);
          color: #ffffff;
          font-size: 30px;
          font-weight: 800;
        }

        .user-profile-eyebrow {
          color: #704cff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .user-profile-heading h1 {
          margin: 5px 0 4px;
          color: #27232f;
          font-size: 28px;
        }

        .user-profile-heading p {
          margin: 0;
          color: #77717f;
          font-size: 13px;
        }

        .user-profile-details,
        .user-profile-form {
          display: grid;
          gap: 16px;
          padding-top: 26px;
        }

        .user-profile-detail {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 0;
          border-bottom: 1px solid #f0edf5;
        }

        .user-profile-detail span,
        .user-profile-form label {
          color: #77717f;
          font-size: 13px;
          font-weight: 600;
        }

        .user-profile-detail strong {
          color: #27232f;
          font-size: 14px;
          text-align: right;
        }

        .user-profile-form label {
          display: grid;
          gap: 8px;
        }

        .user-profile-form input {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #ddd9e5;
          border-radius: 8px;
          color: #27232f;
          font: inherit;
          outline: none;
        }

        .user-profile-form input:focus {
          border-color: #704cff;
          box-shadow: 0 0 0 3px rgba(112, 76, 255, 0.12);
        }

        .user-profile-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 8px;
        }

        .edit-profile-btn,
        .save-btn,
        .cancel-btn {
          border: 0;
          border-radius: 8px;
          padding: 12px 18px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .edit-profile-btn,
        .save-btn {
          background: #704cff;
          color: #ffffff;
        }

        .edit-profile-btn {
          margin-top: 10px;
          justify-self: start;
        }

        .cancel-btn {
          background: #f3f0f8;
          color: #625b6e;
        }

        .user-profile-error {
          margin: 0;
          color: #d44747;
          font-size: 12px;
        }

        @media (max-width: 520px) {
          .user-profile-page {
            padding: 32px 14px;
          }

          .user-profile-card {
            padding: 24px 18px;
          }

          .user-profile-heading h1 {
            font-size: 23px;
          }

          .user-profile-detail {
            display: grid;
            gap: 6px;
          }

          .user-profile-detail strong {
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
};

export default UserProfile;
