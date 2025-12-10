// routes/jobRoutes.js
const express = require('express');
const { createJob, getJobs, deleteJob, updateJob, getJobById } = require('../controllers/jobController');
const authenticateToken = require('../middleware/authMiddleware');
const { validateJobCreate, validateJobUpdate } = require('../utils/jobValidator');
const upload = require('../middleware/fileUpload');

const router = express.Router();

// Use the shared multer upload instance and specify fields per-route
const uploadFields = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);

// Create job (image and logo expected)
router.post('/', uploadFields, validateJobCreate, createJob);

// List/search jobs
router.get('/', getJobs);

// Update job (protected)
router.put('/:id', authenticateToken, uploadFields, validateJobUpdate, updateJob);

// Get single job
router.get('/:id', getJobById);

// Delete job (protected)
router.delete('/:id', authenticateToken, deleteJob);

module.exports = router;
