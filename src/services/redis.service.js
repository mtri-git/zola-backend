const {CODE_SUCCESS, CODE_ERROR, CODE_FAIL} = require('../constants/serviceCode')
const client = require('../configs/db/redis.config')

const type = {
    refreshToken: (id) => `common:refreshToken:${id}`,
    accessToken: (id) => `common:accessToken:${id}`,
    adminRefreshToken: (id) => `admin:refreshToken:${id}`,
    adminAccessToken: (id) => `admin:accessToken:${id}`
}

const connect = async() => {
    console.log('Redis connecting...');
    await client.connect();
    console.log('Redis connected!');
}


const setRefreshToken = async(userId, refreshToken, forAdmin = false) => {
    try {
        const tokenKey = forAdmin ? type.adminRefreshToken(userId) : type.refreshToken(userId)

        await client.setEx(tokenKey, 60*60*24*2 ,refreshToken)
        return CODE_SUCCESS
    } catch (error) {
        console.error('Redis: ',error)
        return CODE_ERROR
    }
}

const getRefreshToken = async(userId, forAdmin = false) => {
    try {
        const tokenKey = forAdmin ? type.adminRefreshToken(userId) : type.refreshToken(userId)
        
        return await client.get(tokenKey)

    } catch (error) {
        console.error('Redis: ',error)
        return CODE_ERROR
    }
}

const deleteRefreshToken = async(userId, forAdmin = false) => {
    try {
        const tokenKey = forAdmin ? type.adminRefreshToken(userId) : type.refreshToken(userId)

        const res = await client.del(tokenKey)
        if(res === 1 || res === 0)
            return CODE_SUCCESS
        

    } catch (error) {
        console.error('Redis: ',error)
        return CODE_ERROR
    }
}

const verifyRefreshToken = async(userId, refreshToken, forAdmin = false) => {
    try {
        const tokenKey = forAdmin ? type.adminRefreshToken(userId) : type.refreshToken(userId)
        const refreshRedis = await client.get(tokenKey)
        return refreshRedis === refreshToken ? CODE_SUCCESS : CODE_FAIL

    } catch (error) {
        console.error('Redis: ',error)
        return CODE_ERROR
    }
}

module.exports = {connect, setRefreshToken, getRefreshToken, verifyRefreshToken, deleteRefreshToken}

