const mongoose = require('mongoose')

const OtpSchema = new mongoose.Schema({
    email: String,
    phone: String,
    otp: String,
    time: {type: Date, default: Date.now, }
})

const Otp = mongoose.model('otp', OtpSchema)
module.exports = Otp
