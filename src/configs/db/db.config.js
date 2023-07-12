const mongoose = require('mongoose')
require('dotenv/config')

async function connect(){
    try{
        console.log('Connecting to mongodb...')
        mongoose.set("strictQuery", false)
        await mongoose.connect(process.env.DB_ONLINE)
        console.log('Connect to mongodb successfully!')
    }
    catch(error)
    {
        console.log('Fail to connect to database...')
    }
}

module.exports = {connect}