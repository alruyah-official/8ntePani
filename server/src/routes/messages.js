const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const messageController = require('../controllers/message');

router.get('/conversations', authenticate, messageController.getConversations);
router.post('/conversations', authenticate, messageController.createConversation);
router.get('/:conversationId', authenticate, messageController.getMessages);
router.post('/', authenticate, messageController.sendMessage);
router.patch('/:conversationId/read', authenticate, messageController.markRead);

module.exports = router;