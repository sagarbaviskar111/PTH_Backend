const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAdmissionOpen, createAdmissionOpen, deleteAdmissionOpen } = require('../controllers/admissionOpenController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage }).fields([{ name: 'image', maxCount: 1 }]);

router.get('/', getAdmissionOpen);
router.post('/', upload, createAdmissionOpen);
router.delete('/:id', deleteAdmissionOpen);

module.exports = router;
