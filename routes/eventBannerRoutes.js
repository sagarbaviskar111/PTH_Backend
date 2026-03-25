const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getEventBanner, createEventBanner, deleteEventBanner } = require('../controllers/eventBannerController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage }).fields([{ name: 'image', maxCount: 1 }]);

router.get('/', getEventBanner);
router.post('/', upload, createEventBanner);
router.delete('/:id', deleteEventBanner);

module.exports = router;
