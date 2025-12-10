const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    positionName: { type: String, required: false },
    company: { type: String, required: false },
    salary: { type: String, required: false },
    experience: { type: String, required: false },
    location: { type: String, required: false },
    type: { type: String, required: false }, // Job type (e.g., Full-time, Part-time)
    applicationDeadline: { type: Date, required: false }, // Optional deadline
    qualification: { type: String, required: false },
    responsibilities: { type: [String], required: false },
    skills: { type: [String], required: false },
    companyOverview: { type: String, required: false },
    imageUrl: { type: String, required: false },
    logo: { type: String, required: false }, // Company logo
    imagePublicId: { type: String, required: false },
    logoPublicId: { type: String, required: false },
    tags: { type: String, required: false }, // Tags (e.g., #remote, #developer)
    applylink: { type: String, required: false },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    email: { type: String, required: false }, // Optional email field
    driveLocation: { type: String, required: false },
    driveDate: { type: String, required: false },
    driveTime: { type: String, required: false },
    driveContactPerson: { type: String, required: false },
    driveContactNumber: { type: String, required: false },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
