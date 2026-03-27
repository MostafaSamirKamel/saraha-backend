const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'Message body is required']
    },
    attachment: {
        type: String
    },
    encryption: {
        iv: String,
        authTag: String,
        encryptedKey: String
    },
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for anonymous
    },
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Receiver is required']
    },
    conversationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isReply: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
