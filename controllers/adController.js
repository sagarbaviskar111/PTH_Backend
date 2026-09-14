const Ad = require('../models/Ad');

exports.getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(ads.map((ad) => ({ ...ad, id: ad._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error: error.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const { title, description, placement, link, imageUrl, isActive } = req.body;

    if (!placement || !['popup', 'inline'].includes(placement)) {
      return res.status(400).json({ message: 'A valid placement (popup or inline) is required' });
    }

    const ad = await Ad.create({
      title,
      description,
      placement,
      link,
      imageUrl,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json({ message: 'Ad created', data: { ...ad.toObject(), id: ad._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating ad', error: error.message });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const { id, title, description, placement, link, imageUrl, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Ad id is required' });
    }

    if (placement && !['popup', 'inline'].includes(placement)) {
      return res.status(400).json({ message: 'A valid placement (popup or inline) is required' });
    }

    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (placement !== undefined) update.placement = placement;
    if (link !== undefined) update.link = link;
    if (imageUrl !== undefined) update.imageUrl = imageUrl;
    if (typeof isActive === 'boolean') update.isActive = isActive;

    const ad = await Ad.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.status(200).json({ message: 'Ad updated', data: { ...ad.toObject(), id: ad._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ad', error: error.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Ad id is required' });
    }

    const deleted = await Ad.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ad', error: error.message });
  }
};
