const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        
        // Output format mapping as requested by user
        const formattedData = courses.map(course => {
            return {
                [course.courseName]: {
                    _id: course._id,
                    pdf: course.pdf,
                    feesPdf: course.feesPdf,
                    registerLink: course.registerLink,
                    youtubeLink: course.youtubeLink,
                    whatsappLink: course.whatsappLink,
                    enrollGoogleLink: course.enrollGoogleLink
                }
            };
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: 'Failed to find courses' });
    }
};

const createOrUpdateCourse = async (req, res) => {
    try {
        const { courseName, registerLink, youtubeLink, whatsappLink, enrollGoogleLink } = req.body;
        
        if (!['CRPV', 'CRDM', 'CRPVDM', 'CRRA', 'CRMW'].includes(courseName)) {
            return res.status(400).json({ error: 'Invalid courseName. Use CRPV, CRDM, CRPVDM, CRRA, or CRMW' });
        }

        let pdfPath = '';
        if (req.files && req.files.pdf && req.files.pdf[0]) {
            // Save local relative URL
            // Since app.js has app.use('/uploads', express.static('uploads'));
            pdfPath = `uploads/${req.files.pdf[0].filename}`;
        }

        let feesPdfPath = '';
        if (req.files && req.files.feesPdf && req.files.feesPdf[0]) {
            feesPdfPath = `uploads/${req.files.feesPdf[0].filename}`;
        }

        const updateData = {};
        if (pdfPath) updateData.pdf = pdfPath;
        if (feesPdfPath) updateData.feesPdf = feesPdfPath;
        if (registerLink) updateData.registerLink = registerLink;
        if (youtubeLink) updateData.youtubeLink = youtubeLink;
        if (whatsappLink) updateData.whatsappLink = whatsappLink;
        if (enrollGoogleLink) updateData.enrollGoogleLink = enrollGoogleLink;

        let course = await Course.findOne({ courseName });

        if (course) {
            // Check if there is an old PDF to delete locally
            if (pdfPath && course.pdf) {
                const oldPdfPath = path.join(__dirname, '..', course.pdf);
                fs.unlink(oldPdfPath, (err) => {
                    if (err) console.error("Error deleting old PDF file:", err);
                });
            }

            // Check if there is an old fees PDF to delete locally
            if (feesPdfPath && course.feesPdf) {
                const oldFeesPdfPath = path.join(__dirname, '..', course.feesPdf);
                fs.unlink(oldFeesPdfPath, (err) => {
                    if (err) console.error("Error deleting old fees PDF file:", err);
                });
            }

            course = await Course.findOneAndUpdate({ courseName }, updateData, { new: true });
        } else {
            course = new Course({
                courseName,
                ...updateData
            });
            await course.save();
        }

        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating/updating course:", error);
        res.status(500).json({ error: 'Failed to create/update course' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { courseName } = req.params;
        const course = await Course.findOneAndDelete({ courseName });
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.pdf) {
            const pdfPath = path.join(__dirname, '..', course.pdf);
            fs.unlink(pdfPath, (err) => {
                if (err) console.error("Error deleting old PDF file:", err);
            });
        }

        if (course.feesPdf) {
            const feesPdfPath = path.join(__dirname, '..', course.feesPdf);
            fs.unlink(feesPdfPath, (err) => {
                if (err) console.error("Error deleting old fees PDF file:", err);
            });
        }

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

module.exports = {
    getCourses,
    createOrUpdateCourse,
    deleteCourse
};
