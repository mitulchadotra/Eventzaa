
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ================= DATABASE =================

import connectDB from "./config/db.js";

// ================= ROUTES =================

import userRouter from "./route/userRoute.js";
import eventRouter from "./route/eventRoute.js";
import categoryRouter from "./route/categoryRoute.js";
import bookingRoute from "./route/bookingRoute.js";
import authOtpRouter from "./route/authOtpRoute.js";
import paymentRoute from "./route/paymentRoute.js";
import aiRoute from "./route/aiRoute.js";

// ================= APP CONFIGURATION =================

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// ================= CORS CONFIGURATION =================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://eventzaa-nine.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin (e.g. server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend URLs and Vercel deployments
      const isVercelDeployment =
        /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);

      if (
        allowedOrigins.includes(origin) ||
        isVercelDeployment
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
  })
);

// ================= BODY PARSER =================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================= STATIC IMAGE FOLDER =================

// Images uploaded by Admin will be accessible through:
// https://eventza-backend-7uxv.onrender.com/uploads/filename.jpg

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eventzaa Backend is running successfully",
  });
});

// ================= AUTH TEST =================

app.get("/api/auth/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication API is working",
  });
});

// ================= API ROUTES =================

// User routes
app.use(userRouter);

// Authentication routes
// Router should define POST /login for POST /api/auth/login
app.use("/api/auth", authOtpRouter);

// Event routes
app.use(eventRouter);

// Category routes
app.use(categoryRouter);

// Booking routes
app.use(bookingRoute);

// Payment routes
app.use(paymentRoute);

// AI Chatbot routes
app.use(aiRoute);

// ================= 404 HANDLER =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("Backend Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SERVER START =================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Eventzaa Backend running on port ${PORT}`);
      console.log("MongoDB connected successfully");
      console.log("Uploads folder is configured");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export default app;
