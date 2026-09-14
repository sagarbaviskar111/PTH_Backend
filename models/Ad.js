const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    placement: { type: String, enum: ['popup', 'inline'], required: true },
    link: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);
