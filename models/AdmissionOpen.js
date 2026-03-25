const mongoose = require('mongoose');

const admissionOpenSchema = new mongoose.Schema({
  subheading: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  batchDate: { type: String, required: true },
  time: { type: String, required: true },
  formLink: { type: String, required: true },
  badgeText: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdmissionOpen', admissionOpenSchema);
