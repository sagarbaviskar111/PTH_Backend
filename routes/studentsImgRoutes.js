const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getStudentsImg, createStudentsImg, deleteStudentsImg } = require('../controllers/studentsImgController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Allow multiple images, frontend could send up to 10 images at once under 'images' or 'image'
const upload = multer({ storage }).fields([
    { name: 'image', maxCount: 10 },
    { name: 'images', maxCount: 10 }
]);

router.get('/', getStudentsImg);
router.post('/', upload, createStudentsImg);
router.delete('/:id', deleteStudentsImg);

module.exports = router;
