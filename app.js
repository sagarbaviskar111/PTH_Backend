// app.js
const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const newsRoutes = require('./routes/newsRoutes')

const app = express();

connectDB();

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/news', newsRoutes); // Add this line

// Error handler (must be after routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Only start server when file is run directly. This makes app importable for tests.
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
