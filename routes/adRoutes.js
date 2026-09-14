const express = require('express');
const router = express.Router();
const { getAds, createAd, updateAd, deleteAd } = require('../controllers/adController');

router.get('/', getAds);
router.post('/', createAd);
router.put('/', updateAd);
router.delete('/', deleteAd);

module.exports = router;
