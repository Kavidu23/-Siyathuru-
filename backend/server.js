const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const communityRoutes = require("./routes/communityRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const requestsRoutes = require("./routes/requestsRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Pick the right MongoDB URI automatically
let mongoUri;

if (process.env.DOCKERIZED === "1") {
  // Inside Docker Compose
  mongoUri = process.env.MONGO_URI_DOCKER;
} else {
  // Local development
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

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
