
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://eventza-backend-7uxv.onrender.com/api",

  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

// ================= JWT INTERCEPTOR =================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= USER APIs =================

export const registerUser = (data) =>
  api.post("/register", {
    name: data.name?.trim(),
    email: data.email?.trim().toLowerCase(),
    password: data.password,
    phone: data.phone || "",
    address: data.address || "",
  });

// ================= OTP LOGIN APIs =================

// Step 1: Verify password and send OTP
export const loginUser = (data) =>
  api.post("/auth/login", {
    email: data.email?.trim().toLowerCase(),
    password: data.password,
    role: data.role,
  });

// Step 2: Verify OTP and receive JWT
export const verifyLoginOtp = (data) =>
  api.post("/auth/verify-login-otp", {
    email: data.email?.trim().toLowerCase(),
    otp: String(data.otp).trim(),
  });

// Step 3: Resend OTP
export const resendLoginOtp = (data) =>
  api.post("/auth/resend-login-otp", {
    email: data.email?.trim().toLowerCase(),
  });

// ================= USER PROFILE APIs =================

export const getUser = () => api.get("/users");

export const getSingleUser = (id) =>
  api.get(`/users/${encodeURIComponent(id)}`);

export const updateUser = (id, data) =>
  api.put(`/users/${encodeURIComponent(id)}`, data);

export const deleteUser = (id) =>
  api.delete(`/users/${encodeURIComponent(id)}`);

// ================= EVENT APIs =================

export const getEvents = () => api.get("/events");

export const createEvent = (data) =>
  api.post("/events", data);

export const createEventWithImage = (formData) =>
  api.post("/events", formData);

export const updateEvent = (id, data) =>
  api.put(`/events/${encodeURIComponent(id)}`, data);

export const updateEventWithImage = (id, formData) =>
  api.put(`/events/${encodeURIComponent(id)}`, formData);

export const removeEvent = (id) =>
  api.delete(`/events/${encodeURIComponent(id)}`);

// ================= CATEGORY APIs =================

export const getCategories = () =>
  api.get("/categories");

export const addCategory = (data) =>
  api.post("/categories", data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${encodeURIComponent(id)}`, data);

export const removeCategory = (id) =>
  api.delete(`/categories/${encodeURIComponent(id)}`);

// ================= BOOKING APIs =================

export const getBookings = () =>
  api.get("/bookings");

export const getBookingById = (id) =>
  api.get(`/bookings/${encodeURIComponent(id)}`);

export const addBooking = (data) =>
  api.post("/bookings", data);

export const updateBooking = (id, data) =>
  api.put(`/bookings/${encodeURIComponent(id)}`, data);

export const cancelBooking = (id) =>
  api.patch(`/bookings/${encodeURIComponent(id)}/cancel`);

export const removeBooking = (id) =>
  api.delete(`/bookings/${encodeURIComponent(id)}`);

// ================= PAYMENT APIs =================

export const getPayments = () =>
  api.get("/payments");

export const getPaymentById = (id) =>
  api.get(`/payments/${encodeURIComponent(id)}`);

export const addPayment = (data) =>
  api.post("/payments", data);

export const updatePayment = (id, data) =>
  api.put(`/payments/${encodeURIComponent(id)}`, data);

export const removePayment = (id) =>
  api.delete(`/payments/${encodeURIComponent(id)}`);

export const getBookingPayments = (bookingId) =>
  api.get(
    `/payments/bookings/${encodeURIComponent(bookingId)}/payments`
  );

export const getMyPayments = () =>
  api.get("/payments/my-payments");

// ================= EXPORT AXIOS INSTANCE =================

export default api;
