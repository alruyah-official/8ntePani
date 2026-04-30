const uploadService = require('../services/upload');

const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const result = await uploadService.uploadToCloudinary(req.file);
    res.json({ data: result, message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const results = await Promise.all(
      req.files.map(file => uploadService.uploadToCloudinary(file))
    );
    res.json({ data: results, message: 'Files uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
};