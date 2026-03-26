const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        enum: ['CRPV', 'CRDM', 'CRPVDM', 'CRRA', 'CRMW'],
        unique: true
    },
    pdf: {
        type: String,
    },
    feesPdf: {
        type: String,
    },
    registerLink: {
        type: String,
    },
    youtubeLink: {
        type: String,
    },
    whatsappLink: {
        type: String,
    },
    enrollGoogleLink: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
