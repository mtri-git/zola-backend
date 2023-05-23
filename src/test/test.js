const Device = require('../models/Device')

const room = await Room.findOne({ _id: message.roomId })
//get user device exept sender