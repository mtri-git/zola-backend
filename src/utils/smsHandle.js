const client = require('../configs/twilio.config')

const sendSms = (OTP, phone) => client.messages
  .create({
    body: `OTP xác thực của bạn là: ${OTP}`,
    to: phone, // Text this number
    from: '+14242915663', // From a valid Twilio number
  })
  .then((message) => console.log(message.sid))

  module.exports = {sendSms}