const nodeMailer = require('nodemailer')
const mailConfig = require('../configs/mail.config')
require('dotenv/config')

const sendMail = (to, subject, otp) => {
	try {
		const transport = nodeMailer.createTransport({
			host: mailConfig.HOST,
			port: mailConfig.PORT,
			secure: false,
			auth: {
				user: mailConfig.USERNAME,
				pass: mailConfig.PASSWORD,
			},
		})
	
		const options = {
			from: mailConfig.FROM_ADDRESS,
			to: to,
			subject: subject,
			html: otpTemplate('Zola', otp),
		}
		return transport.sendMail(options)	
	} catch (error) {
		throw new Error(error)
	}
	
}

const otpTemplate = (appName, OTP) => {
	return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${appName}</a>
      </div>
      <p style="font-size:1.1em">Xin chào,</p>
      <p> Đây là mã xác thực email cho tài khoản Zola của bạn. OTP có hiệu lực trong 15 phút</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
      <p style="font-size:0.9em;">${appName}</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>${appName} Inc</p>
        <p>1 Võ Văn Ngân</p>
        <p>TP Hồ Chí Minh</p>
      </div>
    </div>
  </div>`
}

module.exports = { sendMail }
