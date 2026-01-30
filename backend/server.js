const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const communityRoutes = require("./routes/communityRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const requestsRoutes = require("./routes/requestsRoutes");
const alertRoutes = require("./routes/alertRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Angular frontend
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware
app.use(express.json());

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

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
