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
    const { title, description, placement, link, imageUrl } = req.body;

    if (!placement || !['popup', 'inline'].includes(placement)) {
      return res.status(400).json({ message: 'A valid placement (popup or inline) is required' });
    }

    const ad = await Ad.create({
      title,
      description,
      placement,
      link,
      imageUrl,
      isActive: true,
    });

    res.status(201).json({ message: 'Ad created', data: { ...ad.toObject(), id: ad._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating ad', error: error.message });
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
