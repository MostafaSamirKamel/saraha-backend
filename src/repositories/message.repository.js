const Message = require('../modules/message/message.model');
const mongoose = require('mongoose');

class MessageRepository {
    async createMessage(messageData) {
        return await Message.create(messageData);
    }

    async findByReceiver(receiverId) {
        return await Message.find({ receiverID: receiverId, isDeleted: false, isReply: { $ne: true } })
            .populate('senderID', 'username profileImage')
            .sort({ createdAt: -1 });
    }

    async findGroupsByReceiver(receiverId) {
        return await Message.aggregate([
            { $match: { receiverID: new mongoose.Types.ObjectId(receiverId), isDeleted: false } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: { $ifNull: ["$conversationID", "$_id"] },
                    latestMessage: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$latestMessage" } },
            { $sort: { createdAt: -1 } }
        ]);
    }

    async findBySender(senderId) {
        return await Message.find({ senderID: senderId, isDeleted: false, isReply: { $ne: true } })
            .populate('receiverID', 'username profileImage')
            .sort({ createdAt: -1 });
    }

    async findGroupsBySender(senderId) {
        return await Message.aggregate([
            { $match: { senderID: new mongoose.Types.ObjectId(senderId), isDeleted: false } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: { $ifNull: ["$conversationID", "$_id"] },
                    latestMessage: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$latestMessage" } },
            { $sort: { createdAt: -1 } }
        ]);
    }


    async findById(id) {
        return await Message.findById(id).where({ isDeleted: false });
    }

    async findByIdAndUser(id, userId) {
        return await Message.findOne({ _id: id, receiverID: userId, isDeleted: false });
    }

    async softDelete(id) {
        return await Message.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }

    async toggleFavorite(id, value) {
        return await Message.findByIdAndUpdate(id, { isFavorite: value }, { new: true });
    }

    async markAsRead(id) {
        return await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }

    async findByConversation(conversationId) {
        return await Message.find({ conversationID: conversationId, isDeleted: false })
            .populate('senderID', 'username profileImage')
            .populate('receiverID', 'username profileImage')
            .sort({ createdAt: 1 }); // Oldest first for threads
    }
}

module.exports = new MessageRepository();
