const express = require('express');
const router = express.Router();
const News = require('../models/Article');
const multer = require('multer');
const path = require("path");
const { createNews, updateNews } = require('../controllers/newsController');


// ✅ Get all news articles
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/'); // Define the folder to temporarily store files
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Generate unique file name
    },
  });
  


router.get('/', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 }); // Latest news first
        console.log("sagar")
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: 'Error news', error });
    }
});


const upload = multer({ storage }).fields([{ name: 'image', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);

router.post("/",upload, createNews);


// ✅ Get a single news article by ID
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News not found' });
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error });
    }
});

router.put('/:id', upload ,updateNews);

// ✅ Delete a news article
router.delete('/:id', async (req, res) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        if (!deletedNews) return res.status(404).json({ message: 'News not found' });
        res.status(200).json({ message: 'News article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting news', error });
    }
});

module.exports = router;
