const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const uploadController = require('../controllers/upload');
const upload = require('../middlewares/upload');

router.post('/', authenticate, upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', authenticate, upload.array('files', 10), uploadController.uploadMultiple);

module.exports = router;