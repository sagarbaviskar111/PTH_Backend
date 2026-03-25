const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB. Ensure your connection string or local MongoDB instance is active. Detailed error:', err.message);
    // Removed process.exit(1) to prevent nodemon crash loop
  }
};

module.exports = connectDB;