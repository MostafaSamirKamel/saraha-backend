const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    encryptedKey: {
        type: String,
        required: true,
        description: 'Per-conversation symmetric key, encrypted for each participant'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
