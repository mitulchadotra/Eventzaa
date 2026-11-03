import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidText,
} from "../utils/formValidation";

const API_URL = (
  process.env.REACT_APP_API_URL || "https://eventza-backend-7uxv.onrender.com/api"
).replace(/\/+$/, "");

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...getHeaders() };
  return config;
});

// GET ARRAY FROM API RESPONSE
const getList = (response, key) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.[key])) return data.data[key];

  return [];
};

// SAFE VALUE
const safeValue = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return (
      value
        .map((item) => safeValue(item, ""))
        .filter(Boolean)
        .join(", ") || fallback
    );
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.userName ||
      value.fullName ||
      value.eventTitle ||
      value._id ||
      fallback
    );
  }

  return fallback;
};

const getId = (item) =>
  String(item?._id ?? item?.id ?? "");

const getError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error.message ||
  "Something went wrong";

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  if (
    /^https?:\/\//i.test(path) ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
};

// DATE
const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN");
};

// MONEY
const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

// PAYMENT HELPERS
const getPaymentStatus = (payment) =>
  safeValue(
    payment?.paymentStatus ||
      payment?.status ||
      payment?.payment_status,
    "Pending"
  );

const getPaymentAmount = (payment) =>
  Number(
    payment?.totalAmount ??
      payment?.amount ??
      payment?.price ??
      payment?.booking?.totalAmount ??
      0
  );

const getPaymentUser = (payment) =>
  safeValue(
    payment?.user?.name ||
      payment?.userName ||
      payment?.name ||
      payment?.user?.fullName
  );

const getPaymentEmail = (payment) =>
  safeValue(payment?.user?.email || payment?.email);

const getPaymentEvent = (payment) =>
  safeValue(
    payment?.event?.title ||
      payment?.eventTitle ||
      payment?.eventName ||
      payment?.event?.name ||
      payment?.booking?.eventTitle
  );

const getPaymentDate = (payment) =>
  payment?.createdAt ||
  payment?.paymentDate ||
  payment?.date ||
  null;

const getPaymentMethod = (payment) =>
  safeValue(
    payment?.paymentMethod ||
      payment?.method ||
      payment?.paymentType
  );

const getTransactionId = (payment) =>
  safeValue(
    payment?.transactionId ||
      payment?.transactionID ||
      payment?._id ||
      payment?.id
  );

const getBookingId = (payment) =>
  safeValue(
    payment?.bookingId ||
      payment?.booking?.bookingId ||
      payment?.booking?._id
  );

const getReferenceId = (payment) =>
  safeValue(
    payment?.referenceId ||
      payment?.transactionReferenceId ||
      payment?.razorpayPaymentId ||
      payment?.paymentId
  );

export default function AdminPanel() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");

  // TRANSACTION STATES
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // EVENT STATES
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const emptyEventForm = {
    title: "",
    category: "",
    location: "",
    date: "",
    price: "",
    status: "Published",
    image: null,
  };

  const [eventForm, setEventForm] = useState(emptyEventForm);

  // CATEGORY STATES
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "",
  });

  // PROFILE
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminProfile")) || {
        name: "",
        email: "",
        phone: "",
      };
    } catch {
      return {
        name: "",
        email: "",
        phone: "",
      };
    }
  });

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // LOAD EVENTS
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/events");

      setEvents(
        getList(response, "events").map((event) => ({
          ...event,
          id: getId(event),
          title: safeValue(event.title ?? event.name, ""),
          category: safeValue(event.category, ""),
          location: safeValue(event.location, ""),
          date: event.date ? String(event.date).slice(0, 10) : "",
          price: event.price ?? "",
          status: safeValue(event.status, "Published"),
          imagePath:
            event.imageUrl ||
            event.image ||
            event.imagePath ||
            "",
        }))
      );
    } catch (error) {
      setErrorMessage(
        `Could not load events: ${getError(error)}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD CATEGORIES
  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");

      setCategories(
        getList(response, "categories").map((category) => ({
          ...category,
          id: getId(category),
          name: safeValue(category.name ?? category.title, ""),
          icon: safeValue(category.icon, ""),
        }))
      );
    } catch (error) {
      setErrorMessage(
        `Could not load categories: ${getError(error)}`
      );
    }
  }, []);

  // LOAD BOOKINGS
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/bookings");

      setBookings(
        getList(response, "bookings").filter(
          (booking) =>
            booking && typeof booking === "object"
        )
      );
    } catch (error) {
      setBookings([]);
      setErrorMessage(
        `Could not load bookings: ${getError(error)}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD USERS
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      setUsers(getList(response, "users"));
    } catch (error) {
      setUsers([]);
      setErrorMessage(
        `Could not load users: ${getError(error)}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD TRANSACTIONS
  // FIXED API: /payments/all
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/payments/all");

      setTransactions(
        response.data?.payments || []
      );
    } catch (error) {
      console.error("LOAD TRANSACTIONS ERROR:", error);

      setTransactions([]);
      setErrorMessage(
        `Could not load transactions: ${getError(error)}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD DASHBOARD DATA
  useEffect(() => {
    loadEvents();
    loadCategories();
    loadBookings();
    loadUsers();
    loadTransactions();
  }, [
    loadEvents,
    loadCategories,
    loadBookings,
    loadUsers,
    loadTransactions,
  ]);
    // EVENT FORM
  const openNewEvent = () => {
    setEditingEventId("");
    setEventForm({ ...emptyEventForm });
    setImagePreview("");
    setEventFormOpen(true);
  };

  const openEditEvent = (event) => {
    setEditingEventId(event.id);

    setEventForm({
      title: event.title || "",
      category: event.category || "",
      location: event.location || "",
      date: event.date || "",
      price: event.price ?? "",
      status: event.status || "Published",
      image: null,
    });

    setImagePreview(getImageUrl(event.imagePath));
    setEventFormOpen(true);
  };

  const updateEventField = (event) => {
    const { name, value } = event.target;

    setEventForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // IMAGE UPLOAD
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setEventForm((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  // SAVE EVENT
  const saveEvent = async (event) => {
    event.preventDefault();

    const title = eventForm.title.trim();
    const category = eventForm.category.trim();
    const location = eventForm.location.trim();
    const date = eventForm.date;
    const price = Number(eventForm.price);

    if (!isValidText(title, 2, 120)) {
      alert("Event title must be between 2 and 120 characters.");
      return;
    }

    if (!isValidText(location, 2, 200)) {
      alert("Location must be between 2 and 200 characters.");
      return;
    }

    if (category && !isValidText(category, 2, 80)) {
      alert("Category must be between 2 and 80 characters.");
      return;
    }

    if (!isValidDate(date)) {
      alert("Please enter a valid event date.");
      return;
    }

    if (
      eventForm.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert("Enter a valid event price.");
      return;
    }

    if (!["Published", "Draft"].includes(eventForm.status)) {
      alert("Please select a valid event status.");
      return;
    }

    if (!editingEventId && !eventForm.image) {
      alert("Please upload an event image.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("price", String(price));
    formData.append("status", eventForm.status);

    if (eventForm.image) {
      formData.append("image", eventForm.image);
    }

    try {
      setLoading(true);
      setErrorMessage("");

      if (editingEventId) {
        await api.put(
          `/events/${encodeURIComponent(editingEventId)}`,
          formData
        );

        alert("Event updated successfully.");
      } else {
        await api.post("/events", formData);

        alert("Event and image uploaded successfully.");
      }

      setEventFormOpen(false);
      setEditingEventId("");
      setEventForm({ ...emptyEventForm });
      setImagePreview("");

      await loadEvents();
    } catch (error) {
      const message = getError(error);

      setErrorMessage(`Failed to save event: ${message}`);
      alert(`Failed to save event: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // DELETE EVENT
  const deleteEvent = async (eventId) => {
    if (!eventId) {
      alert("Event database ID is missing.");
      return;
    }

    if (!window.confirm("Do you want to delete this event?")) {
      return;
    }

    try {
      setLoading(true);

      await api.delete(
        `/events/${encodeURIComponent(eventId)}`
      );

      alert("Event deleted successfully.");

      await loadEvents();
    } catch (error) {
      alert(`Failed to delete event: ${getError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // CATEGORY FORM
  const openNewCategory = () => {
    setEditingCategoryId("");

    setCategoryForm({
      name: "",
      icon: "",
    });

    setCategoryFormOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategoryId(category.id);

    setCategoryForm({
      name: category.name || "",
      icon: category.icon || "",
    });

    setCategoryFormOpen(true);
  };

  // SAVE CATEGORY
  const saveCategory = async (event) => {
    event.preventDefault();

    const name = categoryForm.name.trim();

    if (!isValidText(name, 2, 80)) {
      alert("Category name must be between 2 and 80 characters.");
      return;
    }

    if (!isValidText(categoryForm.icon, 0, 20)) {
      alert("Category icon must be 20 characters or fewer.");
      return;
    }

    try {
      const data = {
        name,
        icon: categoryForm.icon.trim(),
      };

      if (editingCategoryId) {
        await api.put(
          `/categories/${encodeURIComponent(editingCategoryId)}`,
          data
        );
      } else {
        await api.post("/categories", data);
      }

      setCategoryFormOpen(false);
      setEditingCategoryId("");

      await loadCategories();

      alert("Category saved successfully.");
    } catch (error) {
      alert(`Failed to save category: ${getError(error)}`);
    }
  };

  // DELETE CATEGORY
  const deleteCategory = async (categoryId) => {
    if (!categoryId) {
      alert("Category database ID is missing.");
      return;
    }

    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await api.delete(
        `/categories/${encodeURIComponent(categoryId)}`
      );

      await loadCategories();

      alert("Category deleted successfully.");
    } catch (error) {
      alert(`Failed to delete category: ${getError(error)}`);
    }
  };
    // PROFILE
  const saveProfile = (event) => {
    event.preventDefault();

    const name = typeof profile.name === "string" ? profile.name.trim() : "";
    const email = typeof profile.email === "string" ? profile.email.trim() : "";
    const phone = typeof profile.phone === "string" ? profile.phone.trim() : "";

    if (!isValidText(name, 2, 80)) {
      alert("Name must be between 2 and 80 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    const updatedProfile = {
      ...profile,
      name,
      email: email.toLowerCase(),
      phone,
    };

    setProfile(updatedProfile);
    localStorage.setItem(
      "adminProfile",
      JSON.stringify(updatedProfile)
    );

    alert("Profile saved successfully.");
  };

  // LOGOUT
  const logout = () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    [
      "admin",
      "adminProfile",
      "token",
      "loggedInUser",
      "user",
      "isLoggedIn",
    ].forEach((key) => localStorage.removeItem(key));

    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  // SEARCH EVENTS
  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase();

    return (
      String(event.title || "").toLowerCase().includes(query) ||
      String(event.category || "").toLowerCase().includes(query) ||
      String(event.location || "").toLowerCase().includes(query)
    );
  });

  // FILTER TRANSACTIONS
  const filteredTransactions = transactions.filter((payment) => {
    const query = transactionSearch.toLowerCase();

    const searchable = [
      getTransactionId(payment),
      getBookingId(payment),
      getPaymentUser(payment),
      getPaymentEmail(payment),
      getPaymentEvent(payment),
      getReferenceId(payment),
    ]
      .join(" ")
      .toLowerCase();

    const status = getPaymentStatus(payment).toLowerCase();

    const matchesSearch = searchable.includes(query);

    const matchesStatus =
      transactionStatus === "All" ||
      status === transactionStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // STATUS COLORS
  const getStatusColor = (status) => {
    const value = String(status).toLowerCase();

    if (["success", "paid"].includes(value)) {
      return {
        background: "#123c2a",
        color: "#4ade80",
      };
    }

    if (value === "pending") {
      return {
        background: "#493817",
        color: "#facc15",
      };
    }

    if (value === "refunded") {
      return {
        background: "#263a60",
        color: "#93c5fd",
      };
    }

    return {
      background: "#491f29",
      color: "#fb7185",
    };
  };
    // STYLES
  const styles = `
    * {
      box-sizing: border-box;
    }

    .admin-layout {
      min-height: 100vh;
      display: flex;
      background: #111111;
      color: #e5e5e5;
      font-family: Arial, sans-serif;
    }

    /* SIDEBAR */
    .admin-sidebar {
      width: 245px;
      min-height: 100vh;
      background: #191919;
      color: white;
      padding: 24px 14px;
      flex-shrink: 0;
      border-right: 1px solid #303030;
    }

    .admin-logo {
      font-size: 25px;
      font-weight: 800;
      padding: 5px 14px 28px;
      color: #fff;
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .admin-nav button {
      width: 100%;
      border: 0;
      border-radius: 6px;
      padding: 12px 14px;
      text-align: left;
      color: #a9a9a9;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      transition: .2s;
    }

    .admin-nav button.active,
    .admin-nav button:hover {
      background: #292929;
      color: #fff;
      border-left: 3px solid #3286f7;
    }

    /* MAIN */
    .admin-main {
      min-width: 0;
      flex: 1;
      padding: 28px;
      background: #111111;
    }

    .admin-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin: -28px -28px 26px;
      padding: 20px 28px;
      background: #191919;
      border-bottom: 1px solid #303030;
    }

    .admin-topbar h1 {
      margin: 0;
      font-size: 25px;
      color: #f5f5f5;
    }

    .admin-topbar p {
      margin: 7px 0 0;
      color: #888;
      font-size: 12px;
    }

    /* CARDS */
    .admin-card {
      background: #191919;
      color: #eee;
      padding: 20px;
      border: 1px solid #303030;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 18px rgba(0,0,0,.12);
    }

    .admin-card h2 {
      color: #f5f5f5;
      font-size: 18px;
      margin-top: 0;
    }

    .admin-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }

    .admin-stat {
      background: #1d1d1d;
      border: 1px solid #303030;
      padding: 19px;
      border-radius: 9px;
      min-width: 0;
      transition: .2s;
    }

    .admin-stat:hover {
      border-color: #3286f7;
      transform: translateY(-2px);
    }

    .admin-stat h2 {
      margin: 12px 0 4px;
      font-size: 26px;
      color: #fff;
      overflow-wrap: anywhere;
    }

    .admin-muted {
      color: #929292;
      font-size: 12px;
    }

    /* TOOLBAR */
    .admin-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }

    .admin-input,
    .admin-select {
      width: 100%;
      min-width: 0;
      border: 1px solid #383838;
      background: #222;
      color: #eee;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
    }

    .admin-input::placeholder {
      color: #888;
    }

    .admin-input:focus,
    .admin-select:focus {
      border-color: #3286f7;
      box-shadow: 0 0 0 2px rgba(50,134,247,.12);
    }

    .admin-input[type="date"] {
      color-scheme: dark;
    }

    .admin-select option {
      background: #222;
      color: white;
    }

    .admin-search {
      max-width: 330px;
    }

    /* BUTTONS */
    .admin-btn {
      border: 1px solid #3286f7;
      background: #3286f7;
      color: white;
      border-radius: 6px;
      padding: 9px 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      transition: .2s;
    }

    .admin-btn:hover {
      background: #216fdf;
    }

    .admin-btn:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .admin-btn.secondary {
      background: #292929;
      border-color: #414141;
      color: #ddd;
    }

    .admin-btn.secondary:hover {
      background: #383838;
    }

    .admin-btn.danger {
      background: #a92e3e;
      border-color: #a92e3e;
    }

    .admin-btn.danger:hover {
      background: #cc354a;
    }

    /* TABLE */
    .admin-table-wrap {
      width: 100%;
      overflow-x: auto;
      border: 1px solid #303030;
      border-radius: 7px;
      background: #191919;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 700px;
    }

    .admin-table th,
    .admin-table td {
      padding: 12px 13px;
      border-bottom: 1px solid #2c2c2c;
      font-size: 12px;
      white-space: nowrap;
    }

    .admin-table th {
      color: #c4c4c4;
      background: #222;
      font-weight: 600;
      font-size: 12px;
    }

    .admin-table td {
      color: #bdbdbd;
    }

    .admin-table tbody tr {
      background: #191919;
      transition: background .15s;
    }

    .admin-table tbody tr:hover {
      background: #252525;
    }

    .admin-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .admin-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .admin-actions button {
      padding: 6px 9px;
      font-size: 11px;
    }

    /* STATUS */
    .transaction-status {
      display: inline-block;
      padding: 4px 9px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* FORMS */
    .admin-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 15px;
    }

    .admin-form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }

    .admin-form-group label {
      color: #ccc;
      font-weight: 600;
      font-size: 12px;
    }

    .admin-form-group.full {
      grid-column: 1 / -1;
    }

    /* MODALS */
    .admin-modal-bg {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.82);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      z-index: 1000;
      overflow-y: auto;
    }

    .admin-modal {
      width: 100%;
      max-width: 650px;
      background: #1c1c1c;
      color: #eee;
      border: 1px solid #383838;
      border-radius: 10px;
      padding: 23px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
    }

    .admin-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid #333;
      gap: 12px;
    }

    .admin-modal-header h2 {
      margin: 0;
      color: #fff;
    }

    .admin-error {
      color: #ffb9c2;
      background: #321b23;
      border: 1px solid #73313c;
      padding: 12px 15px;
      border-radius: 7px;
      margin-bottom: 18px;
      overflow-wrap: anywhere;
    }

    .admin-empty {
      padding: 30px 10px;
      text-align: center;
      color: #929292 !important;
    }

    .admin-event-image {
      width: 60px;
      height: 44px;
      object-fit: cover;
      border: 1px solid #383838;
      border-radius: 5px;
    }

    .admin-image-preview {
      width: 100%;
      max-width: 300px;
      height: 180px;
      object-fit: cover;
      border-radius: 7px;
      margin-top: 10px;
      border: 1px solid #383838;
      background: #222;
    }

    /* TRANSACTION DETAILS */
    .transaction-detail-row {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding: 12px 0;
      border-bottom: 1px solid #303030;
      font-size: 13px;
    }

    .transaction-detail-row span:first-child {
      color: #929292;
    }

    .transaction-detail-row span:last-child {
      text-align: right;
      overflow-wrap: anywhere;
    }

    /* RESPONSIVE */
    @media(max-width: 1100px) {
      .admin-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media(max-width: 900px) {
      .admin-sidebar {
        width: 190px;
      }

      .admin-main {
        padding: 18px;
      }

      .admin-topbar {
        margin: -18px -18px 22px;
        padding: 18px;
      }
    }

    @media(max-width: 650px) {
      .admin-layout {
        flex-direction: column;
      }

      .admin-sidebar {
        width: 100%;
        min-height: auto;
        padding: 12px;
      }

      .admin-logo {
        padding: 5px 8px 12px;
      }

      .admin-nav {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .admin-nav button {
        width: auto;
        padding: 9px;
      }

      .admin-main {
        padding: 14px;
      }

      .admin-topbar {
        margin: -14px -14px 18px;
        padding: 15px 14px;
      }

      .admin-stats,
      .admin-form-grid {
        grid-template-columns: 1fr;
      }

      .admin-form-group.full {
        grid-column: auto;
      }

      .admin-modal-bg {
        padding: 12px;
      }

      .admin-modal {
        padding: 17px;
        max-height: 95vh;
      }

      .transaction-detail-row {
        flex-direction: column;
        gap: 5px;
      }

      .transaction-detail-row span:last-child {
        text-align: left;
      }
    }
  `;
    // RENDER
  return (
    <div className="admin-layout">
      <style>{styles}</style>

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">Eventzaa</div>

        <nav className="admin-nav">
          {[
            "Dashboard",
            "Events",
            "Bookings",
            "Transactions",
            "Users",
            "Categories",
            "Profile",
          ].map((page) => (
            <button
              key={page}
              className={activePage === page ? "active" : ""}
              onClick={() => {
                setActivePage(page);

                if (page === "Bookings") loadBookings();
                if (page === "Transactions") loadTransactions();
                if (page === "Users") loadUsers();
                if (page === "Categories") loadCategories();
                if (page === "Events") loadEvents();
              }}
            >
              {page === "Dashboard" && "📊 "}
              {page === "Events" && "🎫 "}
              {page === "Bookings" && "📋 "}
              {page === "Transactions" && "💳 "}
              {page === "Users" && "👥 "}
              {page === "Categories" && "🏷️ "}
              {page === "Profile" && "👤 "}
              {page}
            </button>
          ))}

          <button onClick={logout}>🚪 Logout</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Manage your Eventzaa platform</p>
          </div>
        </header>

        {errorMessage && (
          <div className="admin-error">
            {errorMessage}

            <button
              className="admin-btn secondary"
              style={{ marginLeft: 12 }}
              onClick={() => setErrorMessage("")}
            >
              Close
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <>
            <div className="admin-card">
              <h2>Welcome to Eventzaa Admin Panel</h2>

              <p className="admin-muted">
                Manage events, bookings, users and transactions.
              </p>

              <button
                className="admin-btn"
                onClick={openNewEvent}
              >
                + Create Event
              </button>
            </div>

            <div className="admin-stats">
              <div className="admin-stat">
                <div className="admin-muted">Total Events</div>
                <h2>{events.length}</h2>
              </div>

              <div className="admin-stat">
                <div className="admin-muted">Total Bookings</div>
                <h2>{bookings.length}</h2>
              </div>

              <div className="admin-stat">
                <div className="admin-muted">Total Users</div>
                <h2>{users.length}</h2>
              </div>

              <div className="admin-stat">
                <div className="admin-muted">
                  Total Payment Transactions
                </div>
                <h2>{transactions.length}</h2>
              </div>
            </div>
          </>
        )}

        {/* EVENTS */}
        {activePage === "Events" && (
          <div className="admin-card">
            <div className="admin-toolbar">
              <input
                className="admin-input admin-search"
                placeholder="Search title, category, location..."
                value={search}
                maxLength={100}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button
                className="admin-btn"
                onClick={openNewEvent}
              >
                + Add Event
              </button>
            </div>

            {loading && <p>Loading...</p>}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td>
                        {event.imagePath ? (
                          <img
                            className="admin-event-image"
                            src={getImageUrl(event.imagePath)}
                            alt={event.title}
                          />
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>{event.title}</td>
                      <td>{event.category || "—"}</td>
                      <td>{event.location}</td>
                      <td>{event.date}</td>
                      <td>{formatMoney(event.price)}</td>
                      <td>{event.status}</td>

                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-btn secondary"
                            onClick={() => openEditEvent(event)}
                          >
                            Edit
                          </button>

                          <button
                            className="admin-btn danger"
                            onClick={() => deleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan="8" className="admin-empty">
                        No events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activePage === "Bookings" && (
          <div className="admin-card">
            <div className="admin-toolbar">
              <h2>Bookings Management</h2>

              <button
                className="admin-btn"
                onClick={loadBookings}
                disabled={loading}
              >
                {loading ? "Loading..." : "↻ Refresh Bookings"}
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>Booking Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={getId(booking) || index}>
                      <td>{safeValue(booking._id || booking.id)}</td>

                      <td>
                        {safeValue(
                          booking.userName ||
                            booking.user?.name ||
                            booking.name
                        )}
                      </td>

                      <td>
                        {safeValue(
                          booking.email || booking.user?.email
                        )}
                      </td>

                      <td>
                        {safeValue(
                          booking.eventTitle ||
                            booking.eventName ||
                            booking.event?.title ||
                            booking.event?.name ||
                            booking.event ||
                            booking.eventId
                        )}
                      </td>

                      <td>
                        {formatDate(booking.date || booking.createdAt)}
                      </td>

                      <td>{safeValue(booking.location)}</td>
                      <td>{Number(booking.quantity || 0)}</td>

                      <td>
                        {formatMoney(
                          booking.totalAmount ??
                            booking.amount ??
                            booking.price ??
                            0
                        )}
                      </td>

                      <td>{safeValue(booking.status, "Pending")}</td>

                      <td>
                        {safeValue(booking.paymentStatus, "Pending")}
                      </td>
                    </tr>
                  ))}

                  {!loading && bookings.length === 0 && (
                    <tr>
                      <td colSpan="10" className="admin-empty">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="admin-muted" style={{ marginTop: 15 }}>
              Total Bookings: {bookings.length}
            </p>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activePage === "Transactions" && (
          <div className="admin-card">
            <div className="admin-toolbar">
              <h2>Transaction Management</h2>

              <button
                className="admin-btn"
                onClick={loadTransactions}
                disabled={loading}
              >
                {loading ? "Loading..." : "↻ Refresh Transactions"}
              </button>
            </div>

            <div className="admin-toolbar">
              <input
                className="admin-input admin-search"
                placeholder="Search Transaction ID, User, Event..."
                value={transactionSearch}
                maxLength={100}
                onChange={(event) =>
                  setTransactionSearch(event.target.value)
                }
              />

              <select
                className="admin-select"
                style={{ maxWidth: 200 }}
                value={transactionStatus}
                onChange={(event) =>
                  setTransactionStatus(event.target.value)
                }
              >
                <option value="All">All Payments</option>
                <option value="Success">Success</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Booking ID</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Event Name</th>
                    <th>Transaction Date</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Reference ID</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((payment, index) => {
                    const status = getPaymentStatus(payment);

                    return (
                      <tr key={getId(payment) || index}>
                        <td>{getTransactionId(payment)}</td>
                        <td>{getBookingId(payment)}</td>
                        <td>{getPaymentUser(payment)}</td>
                        <td>{getPaymentEmail(payment)}</td>
                        <td>{getPaymentEvent(payment)}</td>
                        <td>{formatDate(getPaymentDate(payment))}</td>
                        <td>{formatMoney(getPaymentAmount(payment))}</td>
                        <td>{getPaymentMethod(payment)}</td>
                        <td>{getReferenceId(payment)}</td>

                        <td>
                          <span
                            className="transaction-status"
                            style={getStatusColor(status)}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="admin-btn secondary"
                            onClick={() =>
                              setSelectedTransaction(payment)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="11" className="admin-empty">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="admin-muted" style={{ marginTop: 15 }}>
              Showing {filteredTransactions.length} of{" "}
              {transactions.length} transactions
            </p>
          </div>
        )}

        {/* USERS */}
        {activePage === "Users" && (
          <div className="admin-card">
            <div className="admin-toolbar">
              <h2>Users</h2>

              <button
                className="admin-btn"
                onClick={loadUsers}
                disabled={loading}
              >
                Refresh Users
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <tr key={getId(user) || index}>
                      <td>{safeValue(user.name || user.fullName)}</td>
                      <td>{safeValue(user.email)}</td>
                      <td>{safeValue(user.role, "User")}</td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="3" className="admin-empty">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {activePage === "Categories" && (
          <div className="admin-card">
            <div className="admin-toolbar">
              <h2>Categories</h2>

              <button
                className="admin-btn"
                onClick={openNewCategory}
              >
                + Add Category
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{safeValue(category.icon)}</td>
                      <td>{safeValue(category.name)}</td>

                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-btn secondary"
                            onClick={() => openEditCategory(category)}
                          >
                            Edit
                          </button>

                          <button
                            className="admin-btn danger"
                            onClick={() => deleteCategory(category.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="3" className="admin-empty">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activePage === "Profile" && (
          <div className="admin-card">
            <h2>Admin Profile</h2>

            <form noValidate onSubmit={saveProfile}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Name</label>

                  <input
                    className="admin-input"
                    value={profile.name}
                    maxLength={80}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        name: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email</label>

                  <input
                    className="admin-input"
                    type="email"
                    value={profile.email}
                    maxLength={254}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        email: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone</label>

                  <input
                    className="admin-input"
                    type="tel"
                    value={profile.phone}
                    maxLength={20}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        phone: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                className="admin-btn"
                style={{ marginTop: 18 }}
                type="submit"
              >
                Save Profile
              </button>
            </form>
          </div>
        )}
      </main>

      {/* EVENT MODAL */}
      {eventFormOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {editingEventId ? "Edit Event" : "Add Event"}
              </h2>

              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => {
                  setEventFormOpen(false);
                  setImagePreview("");
                }}
              >
                Close
              </button>
            </div>

            <form noValidate onSubmit={saveEvent}>
              <div className="admin-form-grid">
                <div className="admin-form-group full">
                  <label>Event Title *</label>

                  <input
                    className="admin-input"
                    name="title"
                    value={eventForm.title}
                    onChange={updateEventField}
                    required
                    maxLength={120}
                  />
                </div>

                <div className="admin-form-group full">
                  <label>Upload Event Image</label>

                  <input
                    id="eventImage"
                    className="admin-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImageChange}
                    required={!editingEventId}
                  />

                  <small className="admin-muted">
                    Maximum 5 MB.
                  </small>

                  {imagePreview && (
                    <img
                      className="admin-image-preview"
                      src={imagePreview}
                      alt="Event preview"
                    />
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Category</label>

                  <input
                    className="admin-input"
                    name="category"
                    list="event-categories"
                    value={eventForm.category}
                    onChange={updateEventField}
                    maxLength={80}
                  />

                  <datalist id="event-categories">
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      />
                    ))}
                  </datalist>
                </div>

                <div className="admin-form-group">
                  <label>Location *</label>

                  <input
                    className="admin-input"
                    name="location"
                    value={eventForm.location}
                    onChange={updateEventField}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Date *</label>

                  <input
                    className="admin-input"
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={updateEventField}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Price (₹) *</label>

                  <input
                    className="admin-input"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={eventForm.price}
                    onChange={updateEventField}
                    required
                  />
                </div>

                <div className="admin-form-group full">
                  <label>Status</label>

                  <select
                    className="admin-select"
                    name="status"
                    value={eventForm.status}
                    onChange={updateEventField}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div
                className="admin-actions"
                style={{ marginTop: 22 }}
              >
                <button
                  className="admin-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingEventId
                    ? "Update Event"
                    : "Save Event"}
                </button>

                <button
                  className="admin-btn secondary"
                  type="button"
                  onClick={() => {
                    setEventFormOpen(false);
                    setImagePreview("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryFormOpen && (
        <div className="admin-modal-bg">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {editingCategoryId ? "Edit Category" : "Add Category"}
              </h2>

              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setCategoryFormOpen(false)}
              >
                Close
              </button>
            </div>

            <form noValidate onSubmit={saveCategory}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Category Name *</label>

                  <input
                    className="admin-input"
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: event.target.value,
                      })
                    }
                    required
                    maxLength={80}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Icon</label>

                  <input
                    className="admin-input"
                    value={categoryForm.icon}
                    onChange={(event) =>
                      setCategoryForm({
                        ...categoryForm,
                        icon: event.target.value,
                      })
                    }
                    placeholder="e.g. 🎵"
                    maxLength={20}
                  />
                </div>
              </div>

              <button
                className="admin-btn"
                style={{ marginTop: 20 }}
                type="submit"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTransaction && (
        <div
          className="admin-modal-bg"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTransaction(null);
            }
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Transaction Details</h2>

              <button
                className="admin-btn secondary"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>
            </div>

            <div>
              <div className="transaction-detail-row">
                <span>Transaction ID</span>
                <span>{getTransactionId(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>Booking ID</span>
                <span>{getBookingId(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>User Name</span>
                <span>{getPaymentUser(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>Email</span>
                <span>{getPaymentEmail(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>Event Name</span>
                <span>{getPaymentEvent(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>Transaction Date</span>
                <span>
                  {formatDate(getPaymentDate(selectedTransaction))}
                </span>
              </div>

              <div className="transaction-detail-row">
                <span>Amount</span>
                <strong>
                  {formatMoney(getPaymentAmount(selectedTransaction))}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Payment Method</span>
                <span>{getPaymentMethod(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>Reference ID</span>
                <span>{getReferenceId(selectedTransaction)}</span>
              </div>

              <div className="transaction-detail-row">
                <span>Payment Status</span>

                <span
                  className="transaction-status"
                  style={getStatusColor(
                    getPaymentStatus(selectedTransaction)
                  )}
                >
                  {getPaymentStatus(selectedTransaction)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}