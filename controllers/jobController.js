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

const parseArrayField = (val) => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    // split by comma and trim
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return undefined;
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

      // Build job data and parse array-like fields
      const jobData = {
        ...req.body,
        responsibilities: parseArrayField(req.body.responsibilities) || undefined,
        skills: parseArrayField(req.body.skills) || undefined,
        tags: req.body.tags || undefined,
        imageUrl: imageUpload.secure_url,
        logo: logoUpload.secure_url,
        imagePublicId: imageUpload.public_id,
        logoPublicId: logoUpload.public_id,
      };

      // Convert applicationDeadline if present
      if (req.body.applicationDeadline) {
        const d = new Date(req.body.applicationDeadline);
        if (!isNaN(d)) jobData.applicationDeadline = d;
      }

      const newJob = new Job(jobData);
      await newJob.save();

      res.status(201).json({ message: 'Job created successfully', job: newJob });

      // Remove temporary files created by multer
      try {
        if (image[0] && image[0].path) fs.unlink(image[0].path, () => {});
        if (logo[0] && logo[0].path) fs.unlink(logo[0].path, () => {});
      } catch (e) {
        console.error('Error removing temp files:', e);
      }

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
  
      // Build update payload only from provided fields
      const updatedPayload = {};
      // Copy basic fields when provided
      const allowedFields = ['positionName','company','salary','experience','location','type','qualification','companyOverview','applylink','department','email','driveLocation','driveDate','driveTime','driveContactPerson','driveContactNumber'];
      allowedFields.forEach(f => {
        if (req.body[f] !== undefined) updatedPayload[f] = req.body[f];
      });

      // Parse array-like fields
      if (req.body.responsibilities !== undefined) updatedPayload.responsibilities = parseArrayField(req.body.responsibilities);
      if (req.body.skills !== undefined) updatedPayload.skills = parseArrayField(req.body.skills);
      if (req.body.tags !== undefined) updatedPayload.tags = req.body.tags;

      // Convert applicationDeadline if present
      if (req.body.applicationDeadline) {
        const d = new Date(req.body.applicationDeadline);
        if (!isNaN(d)) updatedPayload.applicationDeadline = d;
      }

      // Handle uploaded files (if any)
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
            // if there was an old cloudinary image, remove it
            if (existingJob.imagePublicId) {
              try { await cloudinary.uploader.destroy(existingJob.imagePublicId); } catch (e) { console.error('Error destroying old image on cloudinary', e); }
            }
            const imageUpload = await uploadImageAndLogo(req.files.image[0], 'job_images');
            updatedPayload.imageUrl = imageUpload.secure_url;
            updatedPayload.imagePublicId = imageUpload.public_id;
            // remove temp uploaded file
            try { if (req.files.image[0].path) fs.unlink(req.files.image[0].path, () => {}); } catch (e) {}
          }

        if (req.files.logo && req.files.logo[0]) {
          if (existingJob.logoPublicId) {
            try { await cloudinary.uploader.destroy(existingJob.logoPublicId); } catch (e) { console.error('Error destroying old logo on cloudinary', e); }
          }
          const logoUpload = await uploadImageAndLogo(req.files.logo[0], 'job_logos');
          updatedPayload.logo = logoUpload.secure_url;
          updatedPayload.logoPublicId = logoUpload.public_id;
          try { if (req.files.logo[0].path) fs.unlink(req.files.logo[0].path, () => {}); } catch (e) {}
        }
      }

      // Merge with existing to preserve unspecified fields
      const updatedJob = await Job.findByIdAndUpdate(id, { $set: updatedPayload }, { new: true });
  
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
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // destroy cloudinary assets if present
    try {
      if (job.imagePublicId) await cloudinary.uploader.destroy(job.imagePublicId);
    } catch (e) { console.error('Error destroying job image on cloudinary', e); }
    try {
      if (job.logoPublicId) await cloudinary.uploader.destroy(job.logoPublicId);
    } catch (e) { console.error('Error destroying job logo on cloudinary', e); }

    await Job.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};

module.exports = { createJob, getJobs, deleteJob,getJobById,updateJob };
