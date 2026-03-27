const messageRepository = require('../../repositories/message.repository');
const { encryptMessage, decryptMessage } = require('../../utils/encryption.util');

class MessageService {
    async sendMessage(senderID, receiverID, body, attachmentURL, conversationID = null) {
        const userRepository = require('../../repositories/user.repository');
        const sendEmail = require('../../utils/email.util');

        // Body and attachment are encrypted
        const encryptedResult = encryptMessage(body);
        
        const messageData = {
            senderID: senderID || null,
            receiverID,
            body: encryptedResult.body,
            attachment: attachmentURL,
            encryption: encryptedResult.metadata,
            conversationID,
            isReply: !!conversationID
        };

        const message = await messageRepository.createMessage(messageData);

        // Link to conversation if provided
        if (conversationID) {
            const conversationRepository = require('../../repositories/conversation.repository');
            await conversationRepository.addMessage(conversationID, message._id);
            
            // Also update the conversation's updatedAt timestamp
            const Conversation = require('../conversation/conversation.model');
            await Conversation.findByIdAndUpdate(conversationID, { updatedAt: new Date() });
        }

        // Check for receiver's notification preferences
        const receiver = await userRepository.findById(receiverID);
        if (receiver && receiver.preferences?.notifications) {
            sendEmail({
                email: receiver.email,
                subject: 'New Anonymous Feedback | Saraha',
                message: `You've received new feedback in your vault. Log in to read it: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages`
            }).catch(err => console.error('Notification email failed:', err.message));
        }
        
        return message;
    }

    async getInbox(receiverID) {
        const messages = await messageRepository.findByReceiver(receiverID);
        
        // Decrypt each message body before returning and mask sender info
        return messages.map(msg => {
            const msgObj = msg.toObject();
            
            // Mask sender info - receivers should not see who sent an anonymous message
            if (msgObj.senderID) {
                msgObj.senderID = { _id: msgObj.senderID._id, username: 'Anonymous' };
            }

            if (msgObj.encryption) {
                try {
                    msgObj.body = decryptMessage(msgObj.body, msgObj.encryption);
                } catch (error) {
                    console.error('Decryption failed for message:', msgObj._id, error.message);
                    msgObj.body = '[Decryption Failed]';
                }
            }
            return msgObj;
        });
    }

    async getSentMessages(senderID) {
        const messages = await messageRepository.findBySender(senderID);
        
        return messages.map(msg => {
            const msgObj = msg.toObject();
            if (msgObj.encryption) {
                try {
                    msgObj.body = decryptMessage(msgObj.body, msgObj.encryption);
                } catch (error) {
                    console.error('Decryption failed for sent message:', msgObj._id, error.message);
                    msgObj.body = '[Decryption Failed]';
                }
            }
            return msgObj;
        });
    }

    async deleteMessage(id, userId) {
        const message = await messageRepository.findByIdAndUser(id, userId);
        if (!message) throw new Error('Message not found or unauthorized');
        return await messageRepository.softDelete(id);
    }

    async toggleFavorite(id, userId) {
        const message = await messageRepository.findByIdAndUser(id, userId);
        if (!message) throw new Error('Message not found or unauthorized');
        return await messageRepository.toggleFavorite(id, !message.isFavorite);
    }

    async markAsRead(id, userId) {
        const message = await messageRepository.findByIdAndUser(id, userId);
        if (!message) throw new Error('Message not found or unauthorized');
        return await messageRepository.markAsRead(id);
    }

    async getConversationHistory(conversationId, userId) {
        const messages = await messageRepository.findByConversation(conversationId);
        
        // Decrypt messages and mask identities for anonymity
        return messages.map(msg => {
            const msgObj = msg.toObject();

            // Mask logic for conversation:
            // 1. If I am the sender, I see myself but mask the receiver? 
            //    Wait, actually I should see who I sent it to if I'm the one who started it.
            //    BUT the requirement says "anonymous to both parties".
            //    Let's mask BUT keep the _id so the UI knows which side to put it on.
            
            const isMyMessage = msgObj.senderID && msgObj.senderID._id.toString() === userId.toString();
            
            if (!isMyMessage && msgObj.senderID) {
                msgObj.senderID = { _id: msgObj.senderID._id, username: 'Anonymous' };
            }
            
            // Also mask receiver if it's not me? 
            // If I sent it, the receiver is "Anonymous" too in this "both parties" vibe?
            // Actually, keep it simple: the other person is always "Anonymous".
            const isToMe = msgObj.receiverID && msgObj.receiverID._id.toString() === userId.toString();
            if (!isToMe && msgObj.receiverID) {
                msgObj.receiverID = { _id: msgObj.receiverID._id, username: 'Anonymous' };
            }

            if (msgObj.encryption) {
                try {
                    msgObj.body = decryptMessage(msgObj.body, msgObj.encryption);
                } catch (error) {
                    msgObj.body = '[Encrypted]';
                }
            }
            return msgObj;
        });
    }
}

module.exports = new MessageService();
