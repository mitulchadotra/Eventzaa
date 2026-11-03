import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const categories = [
    {
      icon: "🎵",
      name: "Music",
      count: "120+ Events",
      description: "Concerts, festivals and live performances",
    },
    {
      icon: "🎭",
      name: "Entertainment",
      count: "85+ Events",
      description: "Comedy shows, theatre and fun activities",
    },
    {
      icon: "💻",
      name: "Technology",
      count: "65+ Events",
      description: "Tech conferences, workshops and meetups",
    },
    {
      icon: "⚽",
      name: "Sports",
      count: "50+ Events",
      description: "Matches, tournaments and sports activities",
    },
    {
      icon: "🎨",
      name: "Arts & Culture",
      count: "40+ Events",
      description: "Art exhibitions, culture and creative events",
    },
    {
      icon: "🍴",
      name: "Food & Drink",
      count: "35+ Events",
      description: "Food festivals, tasting and culinary events",
    },
    {
      icon: "💼",
      name: "Business",
      count: "45+ Events",
      description: "Business conferences and networking events",
    },
    {
      icon: "📚",
      name: "Education",
      count: "30+ Events",
      description: "Seminars, courses and educational workshops",
    },
  ];

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="categories-page">

        {/* ================= HEADER ================= */}

        <section className="categories-header">

          <div className="header-content">

            <span className="small-title">
              EXPLORE EVENTZA
            </span>

            <h1>
              Explore Event Categories
            </h1>

            <p>
              Discover events based on your interests.
              Choose a category and find your next
              unforgettable experience.
            </p>

          </div>

        </section>


        {/* ================= SEARCH ================= */}

        <section className="category-search-wrapper">

          <div className="category-search">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              maxLength={80}
              onChange={(e) => {
                if (e.target.value.length <= 80) {
                  setSearch(e.target.value);
                }
              }}
            />

            {search && (
              <button
                className="clear-btn"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </section>


        {/* ================= CATEGORY SECTION ================= */}

        <section className="category-section">

          <div className="category-top">

            <div>
              <span>
                FIND YOUR INTEREST
              </span>

              <h2>
                All Categories
              </h2>
            </div>

            <p>
              {filteredCategories.length} Categories
            </p>

          </div>


          {/* ================= CATEGORY GRID ================= */}

          {filteredCategories.length > 0 ? (

            <div className="category-grid">

              {filteredCategories.map((category, index) => (

                <div
                  className="category-card"
                  key={index}
                  onClick={() =>
                    navigate(
                      `/events?category=${encodeURIComponent(
                        category.name
                      )}`
                    )
                  }
                >

                  {/* ICON */}

                  <div className="category-icon">
                    {category.icon}
                  </div>


                  {/* CONTENT */}

                  <div className="category-content">

                    <h3>
                      {category.name}
                    </h3>

                    <span className="event-count">
                      {category.count}
                    </span>

                    <p>
                      {category.description}
                    </p>

                  </div>


                  {/* ARROW */}

                  <div className="category-arrow">
                    →
                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="no-results">

              <div>
                🔍
              </div>

              <h3>
                No Categories Found
              </h3>

              <p>
                Try searching for another category.
              </p>

              <button
                onClick={() => setSearch("")}
              >
                Show All Categories
              </button>

            </div>

          )}

        </section>


        {/* ================= CTA ================= */}

        <section className="category-cta">

          <div className="cta-content">

            <span>
              READY FOR YOUR NEXT EXPERIENCE?
            </span>

            <h2>
              Discover Events You'll Love
            </h2>

            <p>
              Browse thousands of events and find
              something amazing happening near you.
            </p>

            <button
              onClick={() => navigate("/events")}
            >
              Explore All Events →
            </button>

          </div>

        </section>

      </div>


      {/* ================= CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .categories-page {
          width: 100%;

          min-height: 750px;

          background: #faf9ff;

          color: #29242f;

          font-family: Arial, sans-serif;
        }


        /* ================= HEADER ================= */

        .categories-header {
          padding: 75px 20px 100px;

          text-align: center;

          background:
            linear-gradient(
              135deg,
              #faf9ff,
              #f2efff
            );
        }

        .header-content {
          max-width: 700px;

          margin: auto;
        }

        .small-title {
          color: #704cff;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 2px;
        }

        .categories-header h1 {
          margin: 15px 0;

          font-size: 46px;

          line-height: 1.1;

          letter-spacing: -1.5px;
        }

        .categories-header p {
          max-width: 600px;

          margin: auto;

          color: #85808b;

          font-size: 13px;

          line-height: 1.8;
        }


        /* ================= SEARCH ================= */

        .category-search-wrapper {
          position: relative;

          margin-top: -42px;

          padding: 0 7%;
        }

        .category-search {
          max-width: 700px;

          height: 75px;

          display: flex;

          align-items: center;

          gap: 14px;

          margin: auto;

          padding: 0 22px;

          border: 1px solid #eeeaf5;

          border-radius: 14px;

          background: white;

          box-shadow:
            0 15px 40px
            rgba(50, 30, 100, 0.12);
        }

        .search-icon {
          font-size: 19px;
        }

        .category-search input {
          width: 100%;

          height: 100%;

          border: none;

          outline: none;

          background: transparent;

          color: #333;

          font-size: 12px;
        }

        .category-search input::placeholder {
          color: #aaa4b0;
        }

        .clear-btn {
          width: 28px;

          height: 28px;

          border: none;

          border-radius: 50%;

          background: #f1eef7;

          color: #77717d;

          font-size: 18px;

          cursor: pointer;
        }


        /* ================= CATEGORY SECTION ================= */

        .category-section {
          padding: 75px 7% 90px;
        }

        .category-top {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 30px;
        }

        .category-top span {
          color: #704cff;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .category-top h2 {
          margin: 7px 0 0;

          font-size: 31px;
        }

        .category-top > p {
          color: #8d8794;

          font-size: 10px;
        }


        /* ================= GRID ================= */

        .category-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 18px;
        }


        /* ================= CARD ================= */

        .category-card {
          position: relative;

          min-height: 220px;

          display: flex;

          flex-direction: column;

          padding: 25px;

          border: 1px solid #eeeaf1;

          border-radius: 15px;

          background: white;

          cursor: pointer;

          overflow: hidden;

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .category-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: 0;

          width: 100%;

          height: 3px;

          background: #704cff;

          transform: scaleX(0);

          transform-origin: left;

          transition: 0.3s;
        }

        .category-card:hover {
          transform: translateY(-8px);

          border-color: #ddd5ff;

          box-shadow:
            0 18px 40px
            rgba(50, 30, 100, 0.12);
        }

        .category-card:hover::before {
          transform: scaleX(1);
        }


        /* ================= ICON ================= */

        .category-icon {
          width: 60px;

          height: 60px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          background: #f0edff;

          font-size: 28px;

          transition: 0.3s;
        }

        .category-card:hover .category-icon {
          transform: scale(1.08);
        }


        /* ================= CONTENT ================= */

        .category-content {
          margin-top: 20px;

          padding-right: 25px;
        }

        .category-content h3 {
          margin: 0 0 6px;

          font-size: 16px;
        }

        .event-count {
          display: inline-block;

          color: #704cff;

          font-size: 9px;

          font-weight: 700;
        }

        .category-content p {
          margin: 10px 0 0;

          color: #918b97;

          font-size: 10px;

          line-height: 1.6;
        }


        /* ================= ARROW ================= */

        .category-arrow {
          position: absolute;

          right: 20px;

          bottom: 20px;

          width: 30px;

          height: 30px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background: #f4f1ff;

          color: #704cff;

          font-size: 16px;

          transition: 0.3s;
        }

        .category-card:hover .category-arrow {
          background: #704cff;

          color: white;

          transform: translateX(3px);
        }


        /* ================= NO RESULTS ================= */

        .no-results {
          padding: 70px 20px;

          text-align: center;

          border: 1px solid #eeeaf1;

          border-radius: 15px;

          background: white;
        }

        .no-results > div {
          font-size: 35px;
        }

        .no-results h3 {
          margin: 15px 0 5px;

          font-size: 18px;
        }

        .no-results p {
          color: #8d8794;

          font-size: 11px;
        }

        .no-results button {
          margin-top: 15px;

          padding: 11px 18px;

          border: none;

          border-radius: 7px;

          background: #704cff;

          color: white;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;
        }


        /* ================= CTA ================= */

        .category-cta {
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

        .cta-content {
          max-width: 650px;

          margin: auto;
        }

        .cta-content > span {
          color: #dcd5ff;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .cta-content h2 {
          margin: 15px 0;

          font-size: 38px;
        }

        .cta-content p {
          margin: 0;

          color: #ddd7ef;

          font-size: 12px;

          line-height: 1.7;
        }

        .cta-content button {
          margin-top: 22px;

          padding: 13px 21px;

          border: none;

          border-radius: 7px;

          background: white;

          color: #704cff;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s;
        }

        .cta-content button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 20px
            rgba(0, 0, 0, 0.15);
        }


        /* ================= TABLET ================= */

        @media (max-width: 1000px) {

          .category-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        /* ================= MOBILE ================= */

        @media (max-width: 600px) {

          .categories-header {
            padding: 55px 20px 80px;
          }

          .categories-header h1 {
            font-size: 34px;
          }

          .categories-header p {
            font-size: 11px;
          }

          .category-search-wrapper {
            padding: 0 20px;
          }

          .category-search {
            height: 65px;

            padding: 0 16px;
          }

          .category-section {
            padding: 55px 20px 70px;
          }

          .category-top {
            align-items: flex-start;

            flex-direction: column;

            gap: 8px;
          }

          .category-top h2 {
            font-size: 27px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            min-height: 200px;
          }

          .cta-content h2 {
            font-size: 29px;
          }

        }

      `}</style>
    </>
  );
};

export default Categories;