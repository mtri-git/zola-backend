const express = require('express')
const router = express.Router()
const otpController = require('../../app/controller/OtpController')


// request otp
router.post('/request-otp', otpController.requestVerifyOTP)

// request otp for forget password
router.post('/forget-otp', otpController.requestOtpForPassword)

// verify otp
router.post('/verify', otpController.verify)

router.post('/verify-register', otpController.verifyEmailForRegister)

module.exports = router