const mongoose = require('mongoose');

const eventBannerSchema = new mongoose.Schema({
  badgeText: { type: String, required: true },
  eventName: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  link: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('EventBanner', eventBannerSchema);
