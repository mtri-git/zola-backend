const cloudinary2 = require('cloudinary').v2
require('dotenv/config')

cloudinary2.config({
    cloud_name: process.env.CLOUDINARY_NAME2,
    api_key: process.env.CLOUDINARY_API_KEY2,
    api_secret: process.env.CLOUDINARY_API_SECRET2,
    secure: true
});

module.exports = cloudinary2