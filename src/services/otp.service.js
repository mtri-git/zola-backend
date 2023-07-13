const bcrypt = require('bcrypt')
const Otp = require('../models/Otp')


const addNewOtp = async (data) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const OTP = Math.floor(100000 + Math.random() * 900000).toString()
        console.log(OTP)
        console.log(data)
        const hashedOtp = await bcrypt.hash(OTP, salt)
        const otp = new Otp({ otp: hashedOtp, ...data, value: OTP})
        await otp.save()
        return OTP
        
    } catch (error) {
        console.log('Otp insert err: ', error)
        return false    
    }
}

const verifyOtp = async (OTP , data) => {
    try {
        const otp = await Otp.findOne(data)
        console.log(otp)
        const verify = bcrypt.compare(OTP, otp.otp)
        return verify
    } catch (error) {
        console.log('Error', error)
        return false    
    }
}

module.exports = {addNewOtp, verifyOtp}