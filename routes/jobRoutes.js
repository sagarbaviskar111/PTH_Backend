// routes/jobRoutes.js
const express = require('express');
const { createJob, getJobs, deleteJob, updateJob, getJobById } = require('../controllers/jobController');
const authenticateToken = require('../middleware/authMiddleware');
const { jobValidationRules } = require('../utils/validators');
const validate = require('../middleware/validate');
const validateJob = require('../utils/jobValidator');
const multer = require('multer');

const router = express.Router();



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/'); // Define the folder to temporarily store files
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Generate unique file name
    },
  });
  
const upload = multer({ storage }).fields([{ name: 'image', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);
  
router.post('/', upload, validateJob, createJob);

router.get('/', getJobs);

router.put('/:id', authenticateToken, upload, updateJob);

router.get('/:id', getJobById);

router.delete('/:id' ,authenticateToken, deleteJob);

module.exports = router;
