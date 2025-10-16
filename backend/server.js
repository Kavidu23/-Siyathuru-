const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // <-- import cors
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const communityRoutes = require("./routes/communityRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const requestsRoutes = require("./routes/requestsRoutes");
const alertRoutes = require("./routes/alertRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Angular frontend
app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Middleware
app.use(express.json());

// Pick the right MongoDB URI automatically
let mongoUri;

if (process.env.DOCKERIZED === "1") {
  mongoUri = process.env.MONGO_URI_DOCKER;
} else {
  mongoUri = process.env.MONGO_URI_LOCAL;
}

// Connect to MongoDB
mongoose
  .connect(mongoUri, { dbName: "Siyathuru" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/feedbacks", feedbackRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
