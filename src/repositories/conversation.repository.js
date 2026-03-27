const Conversation = require('../modules/conversation/conversation.model');

class ConversationRepository {
    async create(data) {
        return await Conversation.create(data);
    }

    async findById(id) {
        return await Conversation.findById(id).where({ isDeleted: false });
    }

    async findByUser(userId) {
        return await Conversation.find({ participants: userId, isDeleted: false })
            .populate('participants', 'username profileImage')
            .populate({
                path: 'messages',
                options: { sort: { createdAt: 1 } }
            })
            .sort({ updatedAt: -1 });
    }

    async findByParticipants(participants) {
        // Find a conversation where participants match exactly
        return await Conversation.findOne({
            participants: { $all: participants, $size: participants.length },
            isDeleted: false
        });
    }

    async findManyByParticipants(participants) {
        return await Conversation.find({
            participants: { $all: participants, $size: participants.length },
            isDeleted: false
        })
        .populate('participants', 'username profileImage')
        .populate({
            path: 'messages',
            options: { sort: { createdAt: 1 } }
        })
        .sort({ updatedAt: -1 });
    }

    async addMessage(conversationId, messageId) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { $push: { messages: messageId } },
            { new: true }
        );
    }
}

module.exports = new ConversationRepository();
