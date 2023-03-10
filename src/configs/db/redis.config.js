const createClient = require('redis').createClient
require('dotenv/config')

const client = createClient({url: process.env.REDIS_URL})
module.exports = client