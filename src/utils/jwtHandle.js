const jwt = require('jsonwebtoken');
require("dotenv").config();


// generate Access Token and Refresh token
const generateAllToken = (user, forAdmin = false) => {
	try {
		let access_key = process.env.ACCESS_TOKEN_SECRET
		let refresh_key = process.env.REFRESH_TOKEN_SECRET
		if(forAdmin)
		{
			access_key = process.env.ADMIN_ACCESS_TOKEN_SECRET
			refresh_key = process.env.ADMIN_REFRESH_TOKEN_SECRET
		}
		const accessToken = jwt.sign( user, access_key, {expiresIn: process.env.ACCESS_TOKEN_LIFE})
        const refreshToken = jwt.sign(user, refresh_key, {expiresIn:process.env.REFRESH_TOKEN_LIFE})
		
		return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }

	} catch (error) {
		console.log(`Error in generate access token:  + ${error}`);
		return null;
	}
}

// generate a single access token
const generateAccessToken = (user, forAdmin=false) => {
	try {
		let key = process.env.ACCESS_TOKEN_SECRET
		if(forAdmin)
		{
			key = process.env.ADMIN_ACCESS_TOKEN_SECRET
		}

		const accessToken = jwt.sign( user, key, {expiresIn: process.env.ACCESS_TOKEN_LIFE})
		
		return {
            accessToken: accessToken
        }

	} catch (error) {
		console.log(`Error in generate access token:   ${error}`);
		return null;
	}
}

const verifyToken = (type='access', token, forAdmin=false) => {
	try {
		let access_key = process.env.ACCESS_TOKEN_SECRET
		let refresh_key = process.env.REFRESH_TOKEN_SECRET
		if(forAdmin)
		{
			access_key = process.env.ADMIN_ACCESS_TOKEN_SECRET
			refresh_key = process.env.ADMIN_REFRESH_TOKEN_SECRET
		}
		if(type === 'access')
        	return jwt.verify(token, access_key)
		else if(type === 'refresh')
			return jwt.verify(token, refresh_key)

	} catch (error) {
		console.log(`Can't: ${error}`);
		return null;
	}
}

module.exports = {generateAllToken, verifyToken, generateAccessToken}