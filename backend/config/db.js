const mongoose = require('mongoose');

const getMongoURI = () => {
  // If running in Docker, the environment variable DOCKERIZED=1 will be set
  if (process.env.DOCKERIZED === '1') {
    return process.env.MONGO_URI_DOCKER;  // Docker Compose MongoDB
  }
  // Otherwise, use local MongoDB
  return process.env.MONGO_URI_LOCAL;     // Local MongoDB
};

const connectDB = async () => {
  try {
    const uri = getMongoURI();
    await mongoose.connect(uri);  // options are default in MongoDB driver v4+
    console.log('✅ MongoDB connected:', uri);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
