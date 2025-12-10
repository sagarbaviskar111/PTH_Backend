const multer = require('multer');

// Centralized error handler for Express
module.exports = (err, req, res, next) => {
  // multer file filter / size errors
  if (err instanceof multer.MulterError) {
    // map common multer error codes
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
    return res.status(400).json({ error: err.message });
  }

  // custom errors from fileFilter (we passed Error)
  if (err && err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({ error: err.message });
  }

  console.error('Unhandled error:', err && (err.stack || err));
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};
