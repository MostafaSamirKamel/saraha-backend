const userRepository = require('../../repositories/user.repository');
const { hashPassword, comparePassword } = require('../../utils/hash.util');
const { generateToken } = require('../../utils/token.util');
const sendEmail = require('../../utils/email.util');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await hashPassword(userData.password);
        
        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + process.env.OTP_EXPIRY_SECONDS * 1000);

        const newUser = await userRepository.createUser({
            ...userData,
            password: hashedPassword,
            OTP: {
                code: otpCode,
                expiresAt: otpExpiry
            }
        });

        // Send OTP via email (non-blocking in dev)
        const otpLog = `\n==========================================\nVERIFICATION OTP FOR ${newUser.email}: ${otpCode}\n==========================================\n`;
        console.log(otpLog);
        
        // Also write to a file in the root for easy access
        try {
            const logPath = path.join(__dirname, '../../../../latest_otp.txt');
            fs.writeFileSync(logPath, otpLog);
        } catch (err) {
            console.error('Failed to write OTP to file:', err.message);
        }
        
        sendEmail({
            email: newUser.email,
            subject: 'Verify your Saraha account',
            message: `Your OTP is ${otpCode}. It expires in 10 minutes.`
        }).catch(error => {
            console.error('CRITICAL: Verification email failed to send to', newUser.email);
            console.error('REASON:', error.message);
            console.error('Please verify your EMAIL_USER and EMAIL_PASS in .env');
        });
        
        return newUser;
    }

    async verifyOTP(email, code) {
        const user = await userRepository.findOne({ email });
        if (!user) throw new Error('User not found');

        if (user.isConfirmed) throw new Error('Account already verified');
        if (!user.OTP || user.OTP.code !== code) throw new Error('Invalid OTP');
        if (new Date() > user.OTP.expiresAt) throw new Error('OTP expired');

        await userRepository.updateById(user._id, {
            isConfirmed: true,
            'OTP.code': null // Clear OTP
        });

        return true;
    }

    async login(loginIdentifier, password) {
        // Search by email OR username
        const user = await userRepository.findOne({ 
            $or: [
                { email: loginIdentifier.toLowerCase() },
                { username: loginIdentifier.toLowerCase() }
            ]
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const accessToken = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, process.env.JWT_ACCESS_EXPIRY);
        const refreshToken = generateToken({ id: user._id }, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRY);

        return { user, accessToken, refreshToken };
    }

    async facebookAuth(accessToken) {
        try {
            // Verify token with Facebook Graph API
            const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${accessToken}`);
            
            if (!data.email) {
                throw new Error('Email is required for Facebook signup. Please check your Facebook permissions.');
            }

            let user = await userRepository.findByEmail(data.email);

            if (user) {
                // If user exists, ensure provider is updated/noted
                if (user.provider !== 'facebook') {
                    // Optionally link accounts or just allow login if email matches
                    user.provider = 'facebook';
                    await user.save();
                }
            } else {
                // Create new user for Facebook signup
                user = await userRepository.createUser({
                    firstName: data.first_name,
                    lastName: data.last_name,
                    email: data.email,
                    provider: 'facebook',
                    isConfirmed: true // Social auth verified by provider
                });
            }

            const appAccessToken = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, process.env.JWT_ACCESS_EXPIRY);
            const refreshToken = generateToken({ id: user._id }, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRY);

            return { user, accessToken: appAccessToken, refreshToken };
        } catch (error) {
            throw new Error('Facebook authentication failed: ' + (error.response?.data?.error?.message || error.message));
        }
    }

    async googleAuth(idToken) {
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

            if (!email) {
                throw new Error('Email is required for Google signup.');
            }

            let user = await userRepository.findByEmail(email);

            if (user) {
                if (user.provider !== 'google') {
                    user.provider = 'google';
                    await user.save();
                }
            } else {
                user = await userRepository.createUser({
                    firstName,
                    lastName,
                    email,
                    provider: 'google',
                    isConfirmed: true
                });
            }

            const appAccessToken = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, process.env.JWT_ACCESS_EXPIRY);
            const refreshToken = generateToken({ id: user._id }, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRY);

            return { user, accessToken: appAccessToken, refreshToken };
        } catch (error) {
            throw new Error('Google authentication failed: ' + error.message);
        }
    }

    async updateProfile(userId, updateData) {
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'bio', 'preferences', 'fullName'];
        const cleanData = {};
        allowedUpdates.forEach(key => {
            if (updateData[key] !== undefined) cleanData[key] = updateData[key];
        });

        // Split fullName into firstName and lastName if provided
        if (updateData.fullName) {
            const parts = updateData.fullName.split(' ');
            cleanData.firstName = parts[0];
            cleanData.lastName = parts.slice(1).join(' ') || '';
        }

        return await userRepository.updateById(userId, cleanData);
    }

    async addProfileImage(userId, filePath) {
        return await userRepository.updateById(userId, {
            $push: { profileImages: filePath }
        });
    }

    async getUserByUsername(username) {
        const user = await userRepository.findByUsername(username);
        if (!user) throw new Error('User not found');
        
        // Sanitize for public view
        return {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImages?.length > 0 ? user.profileImages[user.profileImages.length - 1] : null,
            preferences: user.preferences
        };
    }

    async searchUsers(query, excludeUserId) {
        if (!query || query.length < 2) return [];
        const users = await userRepository.searchUsers(query, excludeUserId);
        return users.map(user => ({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImages?.length > 0 ? user.profileImages[user.profileImages.length - 1] : null
        }));
    }
}

module.exports = new UserService();
