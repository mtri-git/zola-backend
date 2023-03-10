const mongoose = require('mongoose')

const DeviceSchema = new mongoose.Schema({
    device_id: { type: String, unique:true },
    ip: String
})

const Device = mongoose.model('Device', DeviceSchema)
module.exports = Device