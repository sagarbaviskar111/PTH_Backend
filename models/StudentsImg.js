const mongoose = require('mongoose');

const studentsImgSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('StudentsImg', studentsImgSchema);
