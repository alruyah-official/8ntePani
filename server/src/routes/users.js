const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const userController = require('../controllers/user');
const upload = require('../middlewares/upload');

router.put('/me', authenticate, userController.updateMe);
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/stats', authenticate, userController.getMyStats);
router.get('/:username', userController.getUserByUsername);

module.exports = router;