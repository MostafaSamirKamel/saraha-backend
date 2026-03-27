const conversationRepository = require('../../repositories/conversation.repository');
const crypto = require('crypto');

class ConversationService {
    async getOrCreateConversation(user1Id, user2Id) {
        const participants = [user1Id, user2Id].sort();
        let conversation = await conversationRepository.findByParticipants(participants);

        if (!conversation) {
            // Generate a random symmetric key for the conversation
            const symmetricKey = crypto.randomBytes(32).toString('hex');
            
            // In a real implementation, this key should be encrypted with the public keys of the participants.
            // For now, we'll store it as a placeholder string to follow the schema.
            
            conversation = await conversationRepository.create({
                participants,
                encryptedKey: symmetricKey // Placeholder for "encrypted symmetric key"
            });
        }

        return conversation;
    }

    async getUserConversations(userId) {
        const { decryptMessage } = require('../../utils/encryption.util');
        const conversations = await conversationRepository.findByUser(userId);
        
        return conversations.map(conv => {
            const convObj = conv.toObject();
            if (convObj.messages) {
                convObj.messages = convObj.messages.map(msg => {
                    if (msg.encryption) {
                        try {
                            msg.body = decryptMessage(msg.body, msg.encryption);
                        } catch (error) {
                            msg.body = '[Decryption Failed]';
                        }
                    }
                    return msg;
                });
            }
            return convObj;
        });
    }

    async getConversationsBetweenUsers(user1Id, user2Id) {
        const { decryptMessage } = require('../../utils/encryption.util');
        const conversations = await conversationRepository.findManyByParticipants([user1Id, user2Id]);
        
        return conversations.map(conv => {
            const convObj = conv.toObject();
            if (convObj.messages) {
                convObj.messages = convObj.messages.map(msg => {
                    if (msg.encryption) {
                        try {
                            msg.body = decryptMessage(msg.body, msg.encryption);
                        } catch (error) {
                            msg.body = '[Decryption Failed]';
                        }
                    }
                    return msg;
                });
            }
            return convObj;
        });
    }
}

module.exports = new ConversationService();
