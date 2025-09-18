const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes"); // make sure this file exists

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Pick the right MongoDB URI
const mongoUri = process.env.DOCKERIZED === "1"
  ? process.env.MONGO_URI_DOCKER
  : process.env.MONGO_URI_LOCAL;

// Connect to MongoDB
mongoose.connect(mongoUri, { dbName: "Siyathuru" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
