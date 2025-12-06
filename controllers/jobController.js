const Job = require('../models/job');
const cloudinary = require('../config/cloudinaryConfig');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const uploadImageAndLogo = (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, { folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
  
  // Create job route
  const createJob = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      if (!req.files || !req.files.image || !req.files.logo) {
        return res.status(400).json({ error: 'Both image and logo are required' });
      }
  

      const { image, logo } = req.files;
  
      const imageUpload = await uploadImageAndLogo(image[0], 'job_images');
      const logoUpload = await uploadImageAndLogo(logo[0], 'job_logos');
console.log(req.body)  

      const jobData = {
        ...req.body,
        imageUrl: imageUpload.secure_url,
        logo: logoUpload.secure_url,
      };

      const newJob = new Job(jobData);
      await newJob.save();

      res.status(201).json({ message: 'Job created successfully', job: newJob });

      const imagePath = path.join(__dirname,"..",'uploads', req.files.image[0].filename);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        } else {
          console.log('Image file deleted successfully');
        }
      });

      const imagePath2 = path.join(__dirname,"..",'uploads', req.files.logo[0].filename);
      fs.unlink(imagePath2, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        } else {
          console.log('Image file deleted successfully');
        }
      });

    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Server error while creating job' });
    }
  };


const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id).populate('department'); // Populate department details if needed

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error: error.message });
    }
};

const updateJob = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { id } = req.params;
  
      // Find job by ID
      const existingJob = await Job.findById(id);
      if (!existingJob) {
        return res.status(404).json({ error: 'Job not found' });
      }
  
      const updatedData = { ...existingJob.toObject(), ...req.body };
  
      console.log("req.files",req.files)
      if (req.files) {
        if (req.files.image) {
          const imageUpload = await uploadImageAndLogo(req.files.image[0], 'job_images');
          updatedData.imageUrl = imageUpload.secure_url;
  
          // Remove old image file if necessary
          const oldImagePath = path.join(__dirname, "..", 'uploads', req.files.image[0].filename);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Error deleting old image file:', err);
          });
        }
  
        if (req.files.logo) {
          const logoUpload = await uploadImageAndLogo(req.files.logo[0], 'job_logos');
          updatedData.logo = logoUpload.secure_url;
  
          // Remove old logo file if necessary

          const oldLogoPath = path.join(__dirname, "..", 'uploads', req.files.logo[0].filename);
          fs.unlink(oldLogoPath, (err) => {
            if (err) console.error('Error deleting old logo file:', err);
          });
        }
      }
  
console.log("updatedData",updatedData)
      const updatedJob = await Job.findByIdAndUpdate(id, updatedData, { new: true });
  
      res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ error: 'Server error while updating job' });
    }
  };



const getJobs = async (req, res) => {
    try {
        const { id, departmentId, query, page = 1, limit = 10 } = req.query; // Add `query` for search functionality
        let filter = {}; // Base filter object

        // Build filter based on query parameters
        if (id) {
            filter._id = id;
        } else if (departmentId) {
            filter.department = departmentId;
        }

        // Add search functionality using `$regex` for case-insensitive search
        if (query) {
            filter.$or = [
                { positionName: { $regex: query, $options: 'i' } }, // Search by position name
                { company: { $regex: query, $options: 'i' } },      // Search by company name
                { companyOverview: { $regex: query, $options: 'i' } }, // Search by overview
            ];
        }

        // Pagination calculations
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch jobs based on filter, pagination, and sorting
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        // Get the total number of jobs for pagination
        const totalJobs = await Job.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalJobs / limitNumber);

        res.status(200).json({
            totalJobs,
            totalPages,
            currentPage: pageNumber,
            jobs,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await Job.findByIdAndDelete(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        return res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};

module.exports = { createJob, getJobs, deleteJob,getJobById,updateJob };
