const conversationService = require('./conversation.service');
const messageService = require('../message/message.service');
const conversationRepository = require('../../repositories/conversation.repository');
const messageRepository = require('../../repositories/message.repository');

class ConversationController {
    async createOrGetConversation(req, res) {
        try {
            const { otherUserId } = req.body;
            const userId = req.user.id;

            // Strict independence: Always create a new conversation for ogni request
            // instead of finding an existing one between these two users.
            const participants = [userId, otherUserId].sort();
            const crypto = require('crypto');
            const symmetricKey = crypto.randomBytes(32).toString('hex');
            
            const conversation = await conversationRepository.create({
                participants,
                encryptedKey: symmetricKey
            });
            
            res.status(200).json({ conversation });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getConversations(req, res) {
        try {
            const conversations = await conversationService.getUserConversations(req.user.id);
            res.status(200).json({ conversations });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getConversationsWithUser(req, res) {
        try {
            const conversations = await conversationService.getConversationsBetweenUsers(req.user.id, req.params.userId);
            res.status(200).json({ conversations });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async replyToMessage(req, res) {
        try {
            const { messageId, body } = req.body;
            const currentUserId = req.user.id;

            // 1. Find the original message
            const originalMessage = await messageRepository.findById(messageId);
            if (!originalMessage) {
                return res.status(404).json({ error: 'Original message not found' });
            }

            // 2. The current user must be either the sender or receiver of this thread
            const isReceiver = originalMessage.receiverID.toString() === currentUserId;
            const isSender = originalMessage.senderID && originalMessage.senderID.toString() === currentUserId;
            if (!isReceiver && !isSender) {
                return res.status(403).json({ error: 'You are not part of this conversation' });
            }

            // 3. Check if the original sender has an account (for the initial reply)
            if (!originalMessage.senderID) {
                return res.status(400).json({ error: 'Cannot reply to anonymous senders who do not have an account' });
            }

            // 4. Determine the reply target (the other person)
            const replyToUserId = isReceiver 
                ? originalMessage.senderID.toString() 
                : originalMessage.receiverID.toString();

            // 5. Get or create a conversation FOR THIS SPECIFIC MESSAGE
            let conversationId = originalMessage.conversationID;
            
            if (!conversationId) {
                // First reply ever on this message — create a NEW conversation
                const crypto = require('crypto');
                const participants = [currentUserId, replyToUserId].sort();
                const symmetricKey = crypto.randomBytes(32).toString('hex');
                
                const newConversation = await conversationRepository.create({
                    participants,
                    encryptedKey: symmetricKey
                });
                conversationId = newConversation._id;
                
                // Link the ORIGINAL message to this new conversation
                const Message = require('../message/message.model');
                await Message.findByIdAndUpdate(originalMessage._id, { conversationID: conversationId });
                await conversationRepository.addMessage(conversationId, originalMessage._id);
            }


            // 6. Send the reply message linked to the conversation
            const replyMessage = await messageService.sendMessage(
                currentUserId,
                replyToUserId,
                body,
                null, // attachment
                conversationId
            );

            // 7. Add reply to conversation
            await conversationRepository.addMessage(conversationId, replyMessage._id);

            // 8. Decrypt body for response
            const { decryptMessage } = require('../../utils/encryption.util');
            const responseReply = replyMessage.toObject();
            if (responseReply.encryption) {
                try {
                    responseReply.body = decryptMessage(responseReply.body, responseReply.encryption);
                } catch (e) {}
            }

            res.status(201).json({ 
                message: 'Reply sent successfully', 
                reply: responseReply, 
                conversationID: conversationId 
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}

module.exports = new ConversationController();
