const EventBanner = require("../models/EventBanner");
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

exports.getEventBanner = async (req, res) => {
    try {
        const banner = await EventBanner.findOne().sort({ createdAt: -1 });
        if (!banner) return res.status(200).json({});
        res.status(200).json(banner);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event banner', error });
    }
};

exports.createEventBanner = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "Image is required" });
        }

        const { badgeText, eventName, description, date, time, link } = req.body;
        const { image } = req.files;

        if (!badgeText || !eventName || !description || !date || !time || !link) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const imageUpload = await uploadImage(image[0], "event_banner_images");

        const newData = {
            badgeText,
            eventName,
            description,
            date,
            time,
            link,
            imageUrl: imageUpload.secure_url,
        };

        const newBanner = new EventBanner(newData);
        await newBanner.save();

        res.status(201).json({ message: "Event banner created", data: newBanner });

        const imagePath = path.join(__dirname, "..", "uploads", image[0].filename);
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting image file:", err);
        });
    } catch (error) {
        console.error("Error creating event banner:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteEventBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBanner = await EventBanner.findByIdAndDelete(id);
        
        if (!deletedBanner) {
            return res.status(404).json({ message: 'Event banner not found' });
        }
        
        if (deletedBanner.imageUrl) {
            const publicId = deletedBanner.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`event_banner_images/${publicId}`);
        }
        
        res.status(200).json({ message: 'Event banner deleted successfully' });
    } catch (error) {
        console.error("Error deleting event banner:", error);
        res.status(500).json({ message: 'Error deleting event banner', error });
    }
};
