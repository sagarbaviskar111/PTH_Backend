const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getCourses, createOrUpdateCourse, deleteCourse } = require('../controllers/courseController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    },
});

const upload = multer({ storage }).fields([{ name: 'pdf', maxCount: 1 }, { name: 'feesPdf', maxCount: 1 }]);

router.get('/', getCourses);
router.post('/', upload, createOrUpdateCourse);
router.delete('/:courseName', deleteCourse);

module.exports = router;
