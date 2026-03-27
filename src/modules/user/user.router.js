const express = require('express');
const userController = require('./user.controller');
const { signupSchema, loginSchema } = require('./user.validation');
const validationMiddleware = require('../../middleware/validation.middleware');

const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

router.post('/signup', validationMiddleware(signupSchema), userController.signup);
router.post('/login', validationMiddleware(loginSchema), userController.login);
router.post('/facebook-login', userController.facebookLogin);
router.post('/google-login', userController.googleLogin);
router.post('/verify', userController.verifyOTP);
router.post('/logout', authMiddleware, userController.logout);

// Protected routes
router.get('/search', authMiddleware, userController.searchUsers);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/profile/upload', authMiddleware, upload.single('image'), userController.uploadProfileImage);

module.exports = router;
