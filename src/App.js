
import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import AuthRoute from "./AuthRoute";
import "./App.css";

const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));

const ManageEvents = lazy(() => import("./components/ManageEvent"));
const ManageBooking = lazy(() => import("./components/ManageBooking"));
const AdminManageBooking = lazy(() => import("./components/AdminManageBooking"));

const UserProfile = lazy(() => import("./components/UserProfile"));
const MyProfile = lazy(() => import("./components/Myprofile"));

const Payment = lazy(() => import("./components/Payment"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));

const About = lazy(() => import("./components/About"));
const Categories = lazy(() => import("./components/Categories"));
const Events = lazy(() => import("./components/Events"));
const Contact = lazy(() => import("./components/Contact"));
const Home = lazy(() => import("./components/Home"));

const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));

const AIChatbot = lazy(() => import("./components/AIChatbot"));

const App = () => {
  const location = useLocation();

  const pathname = location.pathname.toLowerCase();

  const isPaymentPage = pathname === "/payment";
  const isAdminPanel = pathname === "/adminpanel";

  return (
    <>
      <Suspense
        fallback={
          <div className="loading">
            Loading...
          </div>
        }
      >
        {!isPaymentPage && <Header />}

        <Routes>
          {/* Public Pages */}

          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />

          {/* Protected User Pages */}

          <Route
            path="/"
            element={
              <AuthRoute>
                <Home />
              </AuthRoute>
            }
          />

          <Route
            path="/About"
            element={
              <AuthRoute>
                <About />
              </AuthRoute>
            }
          />

          <Route
            path="/Categories"
            element={
              <AuthRoute>
                <Categories />
              </AuthRoute>
            }
          />

          <Route
            path="/Events"
            element={
              <AuthRoute>
                <Events />
              </AuthRoute>
            }
          />

          <Route
            path="/Contact"
            element={
              <AuthRoute>
                <Contact />
              </AuthRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <AuthRoute>
                <UserProfile />
              </AuthRoute>
            }
          />

          <Route
            path="/MyProfile"
            element={
              <AuthRoute>
                <MyProfile />
              </AuthRoute>
            }
          />

          <Route
            path="/ManageBooking"
            element={
              <AuthRoute>
                <ManageBooking />
              </AuthRoute>
            }
          />

          <Route
            path="/Payment"
            element={
              <AuthRoute>
                <Payment />
              </AuthRoute>
            }
          />

          {/* Admin Only Pages */}

          <Route
            path="/Adminpanel"
            element={
              <AuthRoute adminOnly>
                <AdminPanel />
              </AuthRoute>
            }
          />

          <Route
            path="/ManageEvent"
            element={
              <AuthRoute adminOnly>
                <ManageEvents />
              </AuthRoute>
            }
          />

          <Route
            path="/AdminManageBooking"
            element={
              <AuthRoute adminOnly>
                <AdminManageBooking />
              </AuthRoute>
            }
          />

          {/* 404 Page */}

          <Route
            path="*"
            element={
              <div className="not-found">
                <h2>404 - Page Not Found</h2>
                <p>
                  The page you are looking for does not exist.
                </p>
              </div>
            }
          />
        </Routes>

        {!isAdminPanel && <Footer />}

        <AIChatbot />
      </Suspense>
    </>
  );
};

export default App;
