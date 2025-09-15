const express = require('express');
require('dotenv').config();
const connectDB = require('./db'); // Import MongoDB connection

const app = express(); // create express app

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON (optional)
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello from Express + MongoDB!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
