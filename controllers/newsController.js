const News = require("../models/Article");
const path = require("path");
const fs = require("fs");
const cloudinary = require('../config/cloudinaryConfig');


const uploadImageAndLogo = (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, { folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

exports.createNews = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { title, content, author } = req.body;
    const { image } = req.files;

    if (!title || !content || !author) {
      return res.status(400).json({ error: "All fields (title, content, author) are required" });
    }

    // Upload image to cloud storage or local server
    const imageUpload = await uploadImageAndLogo(image[0], "news_images");

    // Prepare news data
    const newsData = {
      title,
      content,
      author,
      imageUrl: imageUpload.secure_url,
    };

    // Save news entry in database
    const newNews = new News(newsData);
    await newNews.save();

    res.status(201).json({ message: "News created successfully", news: newNews });

    // Delete the image from local uploads folder after successful upload
    const imagePath = path.join(__dirname, "..", "uploads", image[0].filename);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
      } else {
        console.log("Image file deleted successfully");
      }
    });

  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ error: "Server error while creating news" });
  }
};



exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, author } = req.body;

    // Find existing news article
    const existingNews = await News.findById(id);
    if (!existingNews) {
      return res.status(404).json({ error: "News not found" });
    }

    let imageUrl = existingNews.imageUrl; // Keep old image if no new image uploaded

    // If a new image is uploaded, process it
    if (req.files && req.files.image) {
      const { image } = req.files;
      const imageUpload = await uploadImageAndLogo(image[0], "news_images");
      imageUrl = imageUpload.secure_url;

      // Delete the old image from local storage
      if (existingNews.imageUrl) {
        const oldImagePath = path.join(__dirname, "..", "uploads", path.basename(existingNews.imageUrl));
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
          else console.log("Old image deleted successfully");
        });
      }

      // Delete newly uploaded image from local storage after upload
      const newImagePath = path.join(__dirname, "..", "uploads", image[0].filename);
      fs.unlink(newImagePath, (err) => {
        if (err) console.error("Error deleting new image file:", err);
        else console.log("New image file deleted successfully");
      });
    }

    // Update news article in DB
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { title, content, author, imageUrl },
      { new: true }
    );

    res.status(200).json({ message: "News article updated successfully", news: updatedNews });

  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ error: "Server error while updating news" });
  }
};


