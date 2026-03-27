const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'saraha-profile-images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return file.fieldname + '-' + uniqueSuffix;
        },
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
