const express = require('express');
const router = express.Router();
const { getAds, createAd, deleteAd } = require('../controllers/adController');

router.get('/', getAds);
router.post('/', createAd);
router.delete('/', deleteAd);

module.exports = router;
