const mongoose = require('mongoose')
const cloudinary = require('../configs/cloudinary.config')
const cloudinary2 = require('../configs/cloudinary2.config')

const MessageFileSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    },
    cloudinary: {type: String, default: "dmeufji3d"},
    public_id: {type: String, default: ""},
    resource_type: {type: String, default: ""},
    format: {type: String, default: ""},
    url: {type: String, default: ""},
    created_at: {type: Date, default: Date.now()},
    deleted_at: {type: Date, default: null}
})

MessageFileSchema.pre('remove',async function(next) {
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
    

MessageFileSchema.pre('deleteOne', async function(next) {
    try {
        await cloudinary.uploader.destroy(this.public_id)
        next()
    } catch (error) {
        next(error)
    }
})

const File =  mongoose.model('MessageFile', MessageFileSchema)
module.exports = File
