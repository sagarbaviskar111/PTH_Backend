// app.js
const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const newsRoutes = require('./routes/newsRoutes');
const admissionOpenRoutes = require('./routes/admissionOpenRoutes');
const eventBannerRoutes = require('./routes/eventBannerRoutes');
const studentsImgRoutes = require('./routes/studentsImgRoutes');
const courseRoutes = require('./routes/courseRoutes');

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
app.use('/api/admissionopen', admissionOpenRoutes);
app.use('/api/eventbanner', eventBannerRoutes);
app.use('/api/studentsimg', studentsImgRoutes);
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
