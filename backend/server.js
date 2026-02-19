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
const communityVerificationRouter = require("./routes/communityVerficationRouter");
const aiRoutes = require("./routes/aiRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN, // Your Angular frontend URL
  credentials: process.env.CORS_CREDENTIALS, // Allow credentials
  methods: process.env.CORS_METHODS, // Allowed HTTP methods
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
app.use("/api/community-verification", communityVerificationRouter);
app.use("/api/ai", aiRoutes);
app.use("/api/collaborations", collaborationRoutes);

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
