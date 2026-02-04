const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const communityRoutes = require("./routes/communityRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const requestsRoutes = require("./routes/requestsRoutes");
const alertRoutes = require("./routes/alertRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const privateCommunityRoutes = require("./routes/privateCommunityRoutes");
const communityPhotoRouter = require("./routes/communityPhotoRouter");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:4200", // Your Angular frontend URL
  credentials: true, // Allow credentials
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (ONLY ONCE, via db.js)
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/private-communities", privateCommunityRoutes);
app.use("/api/community-photos", communityPhotoRouter);

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
