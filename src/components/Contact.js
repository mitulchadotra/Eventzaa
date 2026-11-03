import React, { useState } from "react";
import {
  isValidEmail,
  isValidText,
} from "../utils/formValidation";

const Contact = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!isValidText(form.name, 2, 80)) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidText(form.subject, 3, 120)) {
      setError("Subject must be between 3 and 120 characters.");
      return;
    }

    if (!isValidText(form.message, 10, 2000)) {
      setError("Message must be between 10 and 2000 characters.");
      return;
    }

    alert("Message sent successfully!");

    setError("");
    setForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });

  };

  return (
    <>
      <main className="contact-page">

        <section className="contact-header">

          <span>
            GET IN TOUCH
          </span>

          <h1>
            Contact Eventza
          </h1>

          <p>
            Have a question? We'd love to hear from you.
          </p>

        </section>


        <section className="contact-container">

          <div className="contact-info">

            <h2>
              Let's Talk
            </h2>

            <p>
              Contact our team for questions,
              support or event-related information.
            </p>


            <div className="contact-item">

              <strong>
                📧 Email
              </strong>

              <span>
                support@eventza.com
              </span>

            </div>


            <div className="contact-item">

              <strong>
                📞 Phone
              </strong>

              <span>
                +91 98765 43210
              </span>

            </div>


            <div className="contact-item">

              <strong>
                📍 Location
              </strong>

              <span>
                Ahmedabad, Gujarat, India
              </span>

            </div>

          </div>


          <form
            className="contact-form"
            noValidate
            onSubmit={handleSubmit}
          >

            {error && <p role="alert">{error}</p>}

            <input
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={80}
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              maxLength={254}
            />

            <input
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              required
              maxLength={120}
            />

            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
              maxLength={2000}
            />

            <button type="submit">
              Send Message →
            </button>

          </form>

        </section>

      </main>


      <style>{`

        .contact-page {
          min-height: 750px;

          padding-bottom: 80px;

          background: #faf9ff;
        }

        .contact-header {
          padding: 80px 20px;

          text-align: center;
        }

        .contact-header span {
          color: #704cff;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .contact-header h1 {
          margin: 12px 0;

          font-size: 42px;
        }

        .contact-header p {
          color: #88828e;

          font-size: 13px;
        }

        .contact-container {
          max-width: 1000px;

          margin: auto;

          display: grid;

          grid-template-columns:
            0.8fr 1.2fr;

          gap: 30px;

          padding: 0 20px;
        }

        .contact-info,
        .contact-form {
          padding: 30px;

          border-radius: 15px;

          background: white;

          border: 1px solid #eeeaf1;
        }

        .contact-info h2 {
          margin-top: 0;

          font-size: 25px;
        }

        .contact-info > p {
          color: #88828e;

          font-size: 11px;

          line-height: 1.7;
        }

        .contact-item {
          display: flex;

          flex-direction: column;

          gap: 5px;

          margin-top: 25px;
        }

        .contact-item strong {
          font-size: 11px;
        }

        .contact-item span {
          color: #88828e;

          font-size: 10px;
        }

        .contact-form {
          display: flex;

          flex-direction: column;

          gap: 13px;
        }

        .contact-form input,
        .contact-form textarea {
          width: 100%;

          padding: 13px;

          border: 1px solid #e5e1ea;

          border-radius: 7px;

          outline: none;

          font-size: 11px;
        }

        .contact-form textarea {
          height: 130px;

          resize: vertical;
        }

        .contact-form button {
          height: 43px;

          border: none;

          border-radius: 7px;

          background: #704cff;

          color: white;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;
        }

        @media (max-width: 700px) {

          .contact-container {
            grid-template-columns: 1fr;
          }

          .contact-header h1 {
            font-size: 34px;
          }

        }

      `}</style>
    </>
  );
};

export default Contact;