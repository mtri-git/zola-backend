const Otp = require('../../models/Otp')
const User = require('../../models/User')
const bcrypt = require('bcrypt')
const { sendMail } = require('../../utils/mailHandler')
const { sendSms } = require('../../utils/smsHandle')
const { generateAccessToken } = require('../../utils/jwtHandle')
const otpService = require('../../services/otp.service')

class OtpController {
	async requestVerifyOTP(req, res) {
		// crypt otp in db
		const OTP = Math.floor(100000 + Math.random() * 900000).toString()

		try {
			const { email, phone } = req.body
			let isExistedUser = false

			// validate email or phone
			var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
			if ( !(email !== '' && email.match(emailFormat))) {
				return res.status(400).json({ message: 'Email is invalid' })
			}

			if (email)
				isExistedUser = await User.exists({email: email})

			if (phone)
				isExistedUser = await User.exists({phone: phone})

			if (isExistedUser) {
				if (email) {
					res.status(400).json({ message: 'This email have already used' })
					return
				}
				if (phone) {
					res.status(400).json({ message: 'This phone have already used' })
					return
				}
			}
			if (OTP) {
				if (email) {
					const salt = await bcrypt.genSalt(10)
					const hashedOtp = await bcrypt.hash(OTP, salt)
					const otp = new Otp({
						email: email,
						otp: hashedOtp,
						value: OTP,
					})
					await otp.save()
					console.log(OTP)
					// send otp to email
					sendMail(email, 'Mã xác thực OTP', OTP)
					return res.status(200).json({
						message: 'Check your email for OTP',
					})
				} else if (phone) {
					const salt = await bcrypt.genSalt(10)
					const hashedOtp = await bcrypt.hash(OTP, salt)
					const otp = new Otp({
						phone: phone,
						otp: hashedOtp,
						value: OTP,
					})
					await otp.save()
					console.log(OTP)
					await sendSms(OTP, phone)
					return res.status(200).json({
						message: 'Check your phone message for OTP',
					})
				} else res.status(400).json({ message: 'Check your input' })
			} else res.status(401).json({ message: 'OTP generate fail' })
		} catch (err) {
			console.log(err)
			res.status(400).json({ message: 'There an error' })
		}
	}

	async verifyEmailForRegister(req, res) {
		try {
			const { email, phone } = req.body

			//check if otp is 6 digits
			if (req.body.otp.length !== 6) {
				return res.status(400).json({ message: 'OTP is invalid' })
			}

			const otp = await Otp.findOne({
				$or: [{ email }, { phone }],
				value: req.body.otp,
			})

			if (!otp) {
				return res.status(400).json({ message: 'OTP is invalid' })
			}

			console.log(otp)

			const verify = bcrypt.compare(req.body.otp, otp.otp)

			if (verify) {
				// opt for verify if change password
				const token = generateAccessToken({ email } || { phone })
				await Otp.deleteOne({ _id: otp._id })
				res.status(200).json(token)
			} else res.status(401).json({ message: 'Invalid OTP' })
		} catch (error) {
			console.log('verify error:', error)
			res.status(500).json({ message: 'Error' })
		}
	}

	async requestOtpForPassword(req, res) {
		try {
			const { email, phone } = req.body
			// const identify = { email, phone }
			// check if email or phone is already exist
			const user = await User.findOne({email: email})
			if(!user) return res.status(400).json({message: "Email or phone not register yet"})

			const OTP = await otpService.addNewOtp({ email })
			if (email) {
				sendMail(email, 'Mã xác thực OTP', OTP)
				return res.status(200).json({
					message: 'Check your email for OTP',
				})
			} else if (phone) {
				return res.status(200).json({
					message: 'Check your phone message for OTP',
				})
			}
		} catch (error) {
			console.log('request error:', error.message)
			res.status(500).json({ message: 'Error' })
		}
	}

	async verify(req, res) {
		try {
			const { email, phone } = req.body

			const otp = await Otp.findOne({
				email: email,
				value: req.body.otp,
			})

			console.log(otp);

			if (otp) {
				// opt for verify if change password
				const user = await User.findOne({
					$or: [{ email: req.body.email }],
				}).lean()
				const { _id } = user
				const token = generateAccessToken({
					id: _id,
					otp: true,
				})
				res.status(200).json(token)
			} else res.status(401).json({ message: 'Invalid OTP' })
		} catch (error) {
			console.log('verify error:', error)
			res.status(500).json({ message: 'Error' })
		}
	}
}

module.exports = new OtpController()
