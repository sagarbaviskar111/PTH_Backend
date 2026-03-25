const AdmissionOpen = require("../models/AdmissionOpen");
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

exports.getAdmissionOpen = async (req, res) => {
    try {
        const admission = await AdmissionOpen.findOne().sort({ createdAt: -1 });
        if (!admission) return res.status(200).json({});
        res.status(200).json(admission);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admission info', error });
    }
};

exports.createAdmissionOpen = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "Image is required" });
        }

        const { subheading, title, description, batchDate, time, formLink, badgeText } = req.body;
        const { image } = req.files;

        if (!subheading || !title || !description || !batchDate || !time || !formLink || !badgeText) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const imageUpload = await uploadImage(image[0], "admission_images");

        const newData = {
            subheading,
            title,
            description,
            batchDate,
            time,
            formLink,
            badgeText,
            imageUrl: imageUpload.secure_url,
        };

        const newAdmission = new AdmissionOpen(newData);
        await newAdmission.save();

        res.status(201).json({ message: "Admission announcement created", data: newAdmission });

        const imagePath = path.join(__dirname, "..", "uploads", image[0].filename);
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting image file:", err);
        });
    } catch (error) {
        console.error("Error creating admission info:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteAdmissionOpen = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAdmission = await AdmissionOpen.findByIdAndDelete(id);
        
        if (!deletedAdmission) {
            return res.status(404).json({ message: 'Admission info not found' });
        }
        
        // Optional: If you want to delete the image from cloudinary as well
        if (deletedAdmission.imageUrl) {
            const publicId = deletedAdmission.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`admission_images/${publicId}`);
        }
        
        res.status(200).json({ message: 'Admission info deleted successfully' });
    } catch (error) {
        console.error("Error deleting admission info:", error);
        res.status(500).json({ message: 'Error deleting admission info', error });
    }
};
