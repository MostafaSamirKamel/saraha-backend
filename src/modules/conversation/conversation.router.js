const express = require('express');
const conversationController = require('./conversation.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware); // All conversation routes are protected

router.post('/', conversationController.createOrGetConversation);
router.get('/', conversationController.getConversations);
router.get('/with/:userId', conversationController.getConversationsWithUser);
router.post('/reply', conversationController.replyToMessage);

module.exports = router;
