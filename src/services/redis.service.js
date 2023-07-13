const {
	CODE_SUCCESS,
	CODE_ERROR,
	CODE_FAIL,
} = require('../constants/serviceCode')
const client = require('../configs/db/redis.config')

const type = {
	refreshToken: (id) => `common:refreshToken:${id}`,
	accessToken: (id) => `common:accessToken:${id}`,
	adminRefreshToken: (id) => `admin:refreshToken:${id}`,
	adminAccessToken: (id) => `admin:accessToken:${id}`,
}

const connect = async () => {
	try {
		if (process.env.NODE_ENV !== 'test')
			console.log('Redis connecting...')
		await client.connect()
		if (process.env.NODE_ENV !== 'test')
			console.log('Redis connected!')
	} catch (error) {
        console.error('Redis: ', error)
    }
}

const setRefreshToken = async (userId, refreshToken, forAdmin = false) => {
	try {
		const tokenKey = forAdmin
			? type.adminRefreshToken(userId)
			: type.refreshToken(userId)

    	return await client.setEx(tokenKey, 60 * 60 * 24 * 2, refreshToken)

	} catch (error) {
		console.error('Redis: ', error)
		throw new Error(CODE_ERROR)
	}
}

const getRefreshToken = async (userId, forAdmin = false) => {
	try {
		const tokenKey = forAdmin
			? type.adminRefreshToken(userId)
			: type.refreshToken(userId)

		return await client.get(tokenKey)
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Get refresh token error")
	}
}

const deleteRefreshToken = async (userId, forAdmin = false) => {
	try {
		const tokenKey = forAdmin
			? type.adminRefreshToken(userId)
			: type.refreshToken(userId)

		const res = await client.del(tokenKey)
		if (res === 1 || res === 0) return true
		throw new Error("Delete refresh token error")
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Delete refresh token error")
	}
}

const verifyRefreshToken = async (userId, refreshToken, forAdmin = false) => {
	try {
		const tokenKey = forAdmin
			? type.adminRefreshToken(userId)
			: type.refreshToken(userId)
		const refreshRedis = await client.get(tokenKey)
		if (refreshRedis === refreshToken) {
			return true
		} else {
			return false
		}
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Verify refresh token error")
	}
}

const createAnInstance = async (key, value) => {
	try {
		return await client.set(key, value)
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Create an instance error")
	}	
}

const getAnInstance = async (key) => {
	try {
		return await client.get(key)
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Get an instance error")
	}
}

const modifyAnInstance = async (key, value) => {
	try {
		return await client.set(key, value)
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Modify an instance error")
	}
}

const deleteAnInstance = async (key) => {
	try {
		const res = await client.del(key)
		if (res === 1 || res === 0) return true
	} catch (error) {
		console.error('Redis: ', error)
		throw new Error("Delete an instance error")
	}
}

module.exports = {
	connect,
	setRefreshToken,
	getRefreshToken,
	verifyRefreshToken,
	deleteRefreshToken,
	createAnInstance,
	getAnInstance,
	modifyAnInstance,
	deleteAnInstance,
}
