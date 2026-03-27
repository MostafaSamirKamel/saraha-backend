const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: function() {
            return this.provider === 'system';
        },
        minlength: [8, 'Password must be at least 8 characters']
    },
    phone: {
        type: String,
        trim: true
    },
    provider: {
        type: String,
        enum: ['system', 'google', 'facebook'],
        default: 'system'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    profileImages: [{
        type: String
    }],
    coverImage: {
        type: String
    },
    address: {
        country: String,
        city: String,
        street: String,
        zip: String
    },
    OTP: {
        code: String,
        expiresAt: Date,
        trials: {
            type: Number,
            default: 0
        }
    },
    preferences: {
        notifications: { type: Boolean, default: true },
        privacy: { type: String, enum: ['high', 'standard', 'low'], default: 'standard' },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
