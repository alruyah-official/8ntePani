const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const userController = require('../controllers/user');
const upload = require('../middlewares/upload');

router.get('/:username', userController.getUserByUsername);
router.put('/me', authenticate, userController.updateMe);
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/stats', authenticate, userController.getMyStats);

module.exports = router;