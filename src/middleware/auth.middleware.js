const { verifyToken } = require('../utils/jwtHandle')
const redis = require('../services/redis.service')

const authMiddleware = async (req, res, next) => {
	let header = req.header('Authorization')
	let token
	if (header) {
		token = header.replace('Bearer ', '')
	}
	try {
		const { exp, ...data } = verifyToken('access', token)

		if (!data) throw new Error()

		if(Date.now() >= exp * 1000)
			return res.status(400).json({message: "Token expired"})

		req.user = data
		next()
	} catch (error) {
		res.status(401).send({
			error: 'Not authorized to access this resource',
		})
	}
}
module.exports = authMiddleware
