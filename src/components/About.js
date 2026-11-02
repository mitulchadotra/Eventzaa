import React from "react";

const About = () => {

  return (
    <>
      <main className="about-page">

        <section className="about-hero">

          <span>
            ABOUT EVENTZA
          </span>

          <h1>
            Making Every Event
            <br />
            <strong>Unforgettable</strong>
          </h1>

          <p>
            Eventza is an event discovery and booking
            platform that connects people with amazing
            experiences.
          </p>

        </section>


        <section className="about-content">

          <div>

            <h2>
              What is Eventza?
            </h2>

            <p>
              Eventza makes it simple to discover,
              explore and book events from one place.
            </p>

            <p>
              From music festivals and conferences
              to sports and entertainment, users can
              find events that match their interests.
            </p>

          </div>


          <div className="about-stats">

            <div>
              <strong>500+</strong>
              <span>Events</span>
            </div>

            <div>
              <strong>50K+</strong>
              <span>Users</span>
            </div>

            <div>
              <strong>100+</strong>
              <span>Cities</span>
            </div>

            <div>
              <strong>4.8</strong>
              <span>Rating</span>
            </div>

          </div>

        </section>

      </main>


      <style>{`

        .about-page {
          min-height: 750px;

          background: #ffffff;
        }

        .about-hero {
          padding: 100px 20px;

          text-align: center;

          background: #faf9ff;
        }

        .about-hero span {
          color: #704cff;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .about-hero h1 {
          margin: 15px 0;

          font-size: 50px;

          line-height: 1.1;
        }

        .about-hero h1 strong {
          color: #704cff;
        }

        .about-hero p {
          max-width: 600px;

          margin: auto;

          color: #85808b;

          font-size: 13px;

          line-height: 1.8;
        }

        .about-content {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;

          padding: 90px 7%;
        }

        .about-content h2 {
          font-size: 30px;
        }

        .about-content p {
          color: #85808b;

          font-size: 12px;

          line-height: 1.8;
        }

        .about-stats {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 15px;
        }

        .about-stats div {
          padding: 25px;

          border: 1px solid #eeeaf1;

          border-radius: 12px;

          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        .about-stats strong {
          color: #704cff;

          font-size: 25px;
        }

        .about-stats span {
          color: #88828e;

          font-size: 10px;
        }

        @media (max-width: 700px) {

          .about-hero h1 {
            font-size: 38px;
          }

          .about-content {
            grid-template-columns: 1fr;

            padding: 60px 20px;
          }

        }

      `}</style>
    </>
  );
};

export default About;