const userService = require('./user.service');

class UserController {
    async signup(req, res) {
        try {
            console.log('Signup Attempt:', req.body);
            const user = await userService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your email.',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Signup Error:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async facebookLogin(req, res) {
        try {
            const { accessToken } = req.body;
            if (!accessToken) {
                return res.status(400).json({ error: 'Facebook access token is required' });
            }

            const result = await userService.facebookAuth(accessToken);
            res.status(200).json({
                message: 'Login successful via Facebook',
                ...result
            });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async googleLogin(req, res) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ error: 'Google ID token is required' });
            }

            const result = await userService.googleAuth(idToken);
            res.status(200).json({
                message: 'Login successful via Google',
                ...result
            });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async verifyOTP(req, res) {
        try {
            const { email, code } = req.body;
            await userService.verifyOTP(email, code);
            res.status(200).json({ success: true, message: 'Account verified successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { loginIdentifier, password } = req.body;
            console.log('Login Attempt:', loginIdentifier);
            
            const { user, accessToken, refreshToken } = await userService.login(loginIdentifier, password);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    fullName: user.fullName
                }
            });
        } catch (error) {
            console.error('Login Error:', error.message);
            res.status(401).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        res.status(200).json({ user: req.user });
    }

    async getUserByUsername(req, res) {
        try {
            const user = await userService.getUserByUsername(req.params.username);
            res.status(200).json({ user });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const updatedUser = await userService.updateProfile(req.user.id, req.body);
            res.status(200).json({ message: 'Profile updated', user: updatedUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async uploadProfileImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Please upload an image' });
            }
            const updatedUser = await userService.addProfileImage(req.user.id, req.file.path);
            res.status(200).json({ message: 'Image uploaded', user: updatedUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async logout(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader.split(' ')[1];
            
            // Get TTL from token to know how long to blacklist it
            const { verifyToken } = require('../../utils/token.util');
            const decoded = verifyToken(token, process.env.JWT_SECRET);
            
            if (decoded) {
                const now = Math.floor(Date.now() / 1000);
                const expirySeconds = decoded.exp - now;
                
                const { blacklistToken } = require('../../utils/redis.util');
                await blacklistToken(token, expirySeconds);
            }

            res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Logout failed: ' + error.message });
        }
    }

    async searchUsers(req, res) {
        try {
            const users = await userService.searchUsers(req.query.q, req.user.id);
            res.status(200).json({ users });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UserController();
