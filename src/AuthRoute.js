
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AuthRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();

  const savedToken = localStorage.getItem("token");
  const savedUser =
    localStorage.getItem("loggedInUser") ||
    localStorage.getItem("user");

  const token =
    savedToken &&
    savedToken !== "undefined" &&
    savedToken !== "null"
      ? savedToken.trim()
      : "";

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  // Login required
  if (!token) {
    return (
      <Navigate
        to="/Login"
        replace
        state={{ from: location }}
      />
    );
  }

  // User information required
  if (!user || typeof user !== "object") {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminProfile");

    return <Navigate to="/Login" replace />;
  }

  // Admin-only pages
  if (adminOnly && String(user.role).toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRoute;
