const { verifyToken } = require('../utils/jwtHandle')

const verifyMiddleware = async (req, res, next) => {
	let header = req.header('Authorization')
	let token
	if (header) {
		token = header.replace('Bearer ', '')
	}
	try {
		const { exp, ...data } = verifyToken('access', token)
		req.user = data
		next()
	} catch (error) {
		next()
	}
}
module.exports = verifyMiddleware
