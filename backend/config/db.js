const mongoose = require('mongoose');

const getMongoURI = () => {
  // If running in Docker, the environment variable DOCKERIZED=1 will be set
  if (process.env.DOCKERIZED === '1') {
    return process.env.MONGO_URI_DOCKER; // Docker Compose MongoDB
  }
  // Otherwise, use local MongoDB
  return process.env.MONGO_URI_LOCAL; // Local MongoDB
};

const connectDB = async () => {
  try {
    const uri = getMongoURI();
    // If the URI doesn't include a database name (ends with '/'), append one.
    const dbName = process.env.MONGO_DB_NAME || 'Siyathuru';
    const finalUri = uri.endsWith('/') ? `${uri}${dbName}` : uri;

    await mongoose.connect(finalUri); // options are default in MongoDB driver v4+
    console.log('✅ MongoDB connected:', finalUri);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
