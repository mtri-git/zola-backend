const mongoose = require('mongoose')

const DeviceSchema = new mongoose.Schema({
    fcm_token: { type: String, unique:true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    ip: String,
})

const Device = mongoose.model('Device', DeviceSchema)
module.exports = Device