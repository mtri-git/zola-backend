const mongoose = require('mongoose')
const cloudinary = require('../configs/cloudinary.config')
const cloudinary2 = require('../configs/cloudinary2.config')

const FileSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    cloudinary: {type: String, default: "dmeufji3d"},
    public_id: {type: String, default: ""},
    isFromPost: {type: Boolean, default: false},
    isPrivate: {type: Boolean, default: false},
    resource_type: {type: String, default: ""},
    format: {type: String, default: ""},
    url: {type: String, default: ""},
    created_at: {type: Date, default: Date.now()},
    deleted_at: {type: Date, default: null, index: {expires: 604800}}
})

FileSchema.pre('remove',async function(next) {
    try {
        if(this.cloudinary === 'dmeufji3d')
            await cloudinary2.uploader.destroy(this.public_id)
        else
            await cloudinary.uploader.destroy(this.public_id)
        next()
    } catch (error) {
        next(error)
    }
  });

FileSchema.pre('deleteOne', async function(next) {
    try {
        await cloudinary.uploader.destroy(this.public_id)
        next()
    } catch (error) {
        next(error)
    }
})

const File =  mongoose.model('File', FileSchema)
module.exports = File
