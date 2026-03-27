const express = require('express');
const messageController = require('./message.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

// Public/Anonymous route (optional auth if sender has account)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return authMiddleware(req, res, next);
    }
    next();
};

router.post('/', optionalAuth, messageController.sendMessage);

// Protected routes
router.get('/inbox', authMiddleware, messageController.getInbox);
router.get('/sent', authMiddleware, messageController.getSentMessages);
router.get('/conversation/:id', authMiddleware, messageController.getConversationHistory);
router.delete('/:id', authMiddleware, messageController.deleteMessage);
router.patch('/:id/favorite', authMiddleware, messageController.toggleFavorite);
router.patch('/:id/read', authMiddleware, messageController.markAsRead);

module.exports = router;
