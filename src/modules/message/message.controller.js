const messageService = require('./message.service');

class MessageController {
    async sendMessage(req, res) {
        try {
            const { receiverID, body, attachmentURL, conversationID } = req.body;
            const senderID = req.user ? req.user.id : null;

            // Resolve receiverID if it's a username (not a valid ObjectId)
            let finalReceiverID = receiverID;
            const mongoose = require('mongoose');
            if (!mongoose.Types.ObjectId.isValid(receiverID)) {
                const userRepository = require('../../repositories/user.repository');
                const user = await userRepository.findByUsername(receiverID);
                if (!user) {
                    return res.status(404).json({ error: 'Recipient user not found' });
                }
                finalReceiverID = user._id;
            }

            const message = await messageService.sendMessage(senderID, finalReceiverID, body, attachmentURL, conversationID);
            
            // Decrypt the body for the response so the frontend can show it immediately
            const { decryptMessage } = require('../../utils/encryption.util');
            const responseMessage = message.toObject();
            if (responseMessage.encryption) {
                try {
                    responseMessage.body = decryptMessage(responseMessage.body, responseMessage.encryption);
                } catch (e) {
                    // fall back to encrypted if decryption fails for some reason
                }
            }

            res.status(201).json({ 
                message: 'Message sent successfully', 
                messageId: message._id, 
                message: responseMessage 
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getInbox(req, res) {
        try {
            const messages = await messageService.getInbox(req.user.id);
            res.status(200).json({ messages });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getSentMessages(req, res) {
        try {
            const messages = await messageService.getSentMessages(req.user.id);
            res.status(200).json({ messages });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteMessage(req, res) {
        try {
            await messageService.deleteMessage(req.params.id, req.user.id);
            res.status(200).json({ message: 'Message deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async toggleFavorite(req, res) {
        try {
            const message = await messageService.toggleFavorite(req.params.id, req.user.id);
            res.status(200).json({ message: 'Message updated', isFavorite: message.isFavorite });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            await messageService.markAsRead(req.params.id, req.user.id);
            res.status(200).json({ message: 'Message marked as read' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getConversationHistory(req, res) {
        try {
            const messages = await messageService.getConversationHistory(req.params.id, req.user.id);
            res.status(200).json({ messages });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new MessageController();
