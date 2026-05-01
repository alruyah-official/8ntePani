const userService = require('../services/user');

const getUserByUsername = async (req, res) => {
  try {
    const user = await userService.findUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.json({ data: user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const uploadService = require('../services/upload');
    const result = await uploadService.uploadToCloudinary(req.file);
    await userService.updateUser(req.user.id, { avatar: result.url });
    res.json({ data: result, message: 'Avatar uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

const getMyStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats(req.user.id);
    res.json({ data: stats, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserByUsername,
  updateMe,
  uploadAvatar,
  getMyStats,
};