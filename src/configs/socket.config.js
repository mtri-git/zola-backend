const Message = require('../models/Message')
const Room = require('../models/Room')

function configureSocketIO(io) {
  console.log('configuring socket.io')
    io.on('connection', (socket) => {
        console.log('A user connected.');
        socket.on('join_room', (data) => {
          const { username, rooms } = data;
          console.log(rooms);
          rooms.forEach((room) => {
            console.log(`${username} joined room ${room}`);
            socket.join(room);
          });
        });

        
        socket.on('send_message', async(data) => {
          console.log(data);
          const { roomId, userId, message, nanoid } = data;
          
          io.to(roomId).emit('receive_message', data => {
            console.log('receive message')
          })

          const messageData = {nanoid, roomId, content: message, sender: userId}

          // save message to db
          const _message = new Message({
            ...messageData,
            reaction: [],
            seen_by: [],
            deleted_at: null,
          })
          await _message.save()
          await Room.updateOne(
            { _id: message.roomId },
            { $set: { last_message: message._id } }
          )
        });

        socket.on('typing', (data) => {
          console.log('typing')
          const { roomId } = data;
          io.to(roomId).emit('typing', data);
        });

        socket.on('stop_typing', (data) => {
          console.log('stop typing')
          const { roomId } = data;
          io.to(roomId).emit('stop_typing', data);
        });

        socket.on('delete_message', (data) => {
          const { roomId } = data;
          io.in(roomId).emit('recall_message', data);
        });
        socket.on('disconnect', () => {});
      });      
  }
  
module.exports = configureSocketIO;