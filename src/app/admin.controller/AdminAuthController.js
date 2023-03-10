const bcrypt = require('bcrypt')
const {
	generateAllToken,
	verifyToken,
	generateAccessToken,
} = require('../../utils/jwtHandle')
const redis = require('../../services/redis.service')
const { CODE_SUCCESS, CODE_ERROR } = require('../../constants/serviceCode')
const Admin = require('../../models/Admin')

require('dotenv/config')

class AdminAuthController {
	async login(req, res) {
		try {
			const { username: _username, password: _password } = req.body

			const user = await Admin.findOne({ username: _username })

			// if user is null mean not registered yet
			if (!user) {
				return res.status(400).json({
					message: 'This account has not existed',
				})
			}

			const { id, username, avatarUrl } = user
			const validPassword = await bcrypt.compare(_password, user.password)

			if (validPassword) {
				const token = generateAllToken(
					{
						id,
						username,
						avatarUrl,
					},
					true
				)

				// set refresh token in redis db
				redis.deleteRefreshToken(id, true)
				const redisResponse = redis.setRefreshToken(
					id,
					token.refreshToken,
					true
				)
				if (redisResponse === CODE_ERROR) {
					res.status(500).json({ error: 'Server error' })
					return
				}

				res.cookie('refreshToken', token.refreshToken, {
					httpOnly: true,
					sameSite: 'none',
					// process.env.NODE_ENV === 'development' ? true : 'none',
					secure: true,
						// process.env.NODE_ENV === 'development' ? false : true,
					maxAge: 60 * 60 * 24 * 300 * 1000
				})

				res.status(200).json({
					token: token.accessToken,
					user: { id, username, avatarUrl },
				})
			} else {
				res.status(400).json({
					message: 'Invalid Phone, Email, Username or Password',
				})
			}
		} catch (err) {
			console.log('Login:', err.message)
			res.status(500).json({ message: 'Error' })
		}
	}

	async logout(req, res) {
		const refreshToken = req.cookies.refreshToken
		if (refreshToken == null) return res.sendStatus(401)
		try {
			// verify if this is a refresh token
			const user = verifyToken('refresh', refreshToken, true)
			if (user) {
				const response = redis.deleteRefreshToken(req.user.id, true)
				if (response === CODE_SUCCESS) {
					res.clearCookie('refreshToken')
					res.status(200).json({ message: 'logout success' })
				}
			}
			return res.status(401).json({ message: 'Not authorize' })
		} catch (err) {
			res.sendStatus(500)
		}
	}
	async changePassword(req, res) {
		try {
			// check accessToken
			const userData = req.user
			if (!userData) {
				//hash password
				const salt = await bcrypt.genSalt(10)
				const hashPassword = await bcrypt.hash(req.body.password, salt)

				const user = await new Admin.find(
					{ _id: userData.id },
					{ $set: { password: hashPassword } }
				)
				await user.save()
				res.json({ message: 'Change password successfully' })
			} else {
				res.status(401).json({ message: 'Authentication' })
			}
		} catch (error) {
			console.log('Change Password: ', error.message)
			res.status(500).json({ message: 'Change password fail' })
		}
	}

	getAccessToken(req, res) {
		const refreshToken = req.cookies.refreshToken
		if (refreshToken == null) return res.sendStatus(401)
		try {
			// verify if this is a refresh token
			const user = verifyToken('refresh', refreshToken)
			const { id, username, avatarUrl } = user
			if (!redis.verifyRefreshToken(id, refreshToken, true))
				return res
					.status(403)
					.json({ message: 'Invalid refresh token' })
			const accessToken = generateAccessToken({
				id,
				username,
				fullname,
				avatarUrl
			})
			res.status(200).json(accessToken)
		} catch (err) {
			console.error('Reset token', err)
			res.status(500).json({ error: 'Error' })
		}
	}

	async getInfo(req, res){
		try {
			const data = await Admin.findById(req.user.id).select('username avatarUrl')
			res.status(200).json({data: data})
			
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Error' })
		}
	}

	async createAdmin(req, res) {
		try {
			const {username, password} = req.body
			const salt = await bcrypt.genSalt(10)
			const hashPassword = await bcrypt.hash(password, salt)
			const admin = new Admin({username, password: hashPassword})
			await admin.save()
			res.status(201).json("Create")
			
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Error' })
		}

	}
}

module.exports = new AdminAuthController()
