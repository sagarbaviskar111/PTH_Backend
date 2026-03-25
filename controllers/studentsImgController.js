const StudentsImg = require("../models/StudentsImg");
const path = require("path");
const fs = require("fs");
const cloudinary = require('../config/cloudinaryConfig');

const uploadImage = (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, { folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
};

exports.getStudentsImg = async (req, res) => {
    try {
        const images = await StudentsImg.find().sort({ createdAt: -1 });
        if (req.query.admin) {
            // Admin needs the full object including _id to be able to delete
            res.status(200).json(images);
        } else {
            // The endpoint should just return an array of image URLs for the public site
            const imageUrls = images.map(img => img.imageUrl);
            res.status(200).json(imageUrls);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students images', error });
    }
};

exports.createStudentsImg = async (req, res) => {
    try {
        if (!req.files || (!req.files.image && !req.files.images)) {
            return res.status(400).json({ error: "Image(s) are required" });
        }

        // Support both single "image" and multiple "images"
        const filesToUpload = req.files.images || req.files.image;
        if (!filesToUpload || filesToUpload.length === 0) {
            return res.status(400).json({ error: "Image(s) are required" });
        }

        const uploadedImages = [];

        for (const file of filesToUpload) {
            const imageUpload = await uploadImage(file, "students_images");
            
            const newImg = new StudentsImg({ imageUrl: imageUpload.secure_url });
            await newImg.save();
            uploadedImages.push(newImg.imageUrl);

            const imagePath = path.join(__dirname, "..", "uploads", file.filename);
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting image file:", err);
            });
        }

        res.status(201).json({ message: "Images uploaded successfully", data: uploadedImages });
    } catch (error) {
        console.error("Error creating students images:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteStudentsImg = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedImg = await StudentsImg.findByIdAndDelete(id);
        
        if (!deletedImg) {
            return res.status(404).json({ message: 'Student image not found' });
        }
        
        if (deletedImg.imageUrl) {
            const publicId = deletedImg.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`students_images/${publicId}`);
        }
        
        res.status(200).json({ message: 'Student image deleted successfully' });
    } catch (error) {
        console.error("Error deleting student image:", error);
        res.status(500).json({ message: 'Error deleting student image', error });
    }
};
