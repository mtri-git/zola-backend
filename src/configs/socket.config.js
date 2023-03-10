function configureSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('a user connected.');
        socket.on('join_room', (data) => {
          const { username, rooms } = data;
          console.log(rooms);
          rooms.forEach((room) => {
            console.log(`${username} joined room ${room}`);
            socket.join(room);
          });
        });
        socket.on('send_message', (data) => {
          console.log(data);
          const { roomId } = data;
          io.to(roomId).emit('receive_message', data);
          // save message
        });
        socket.on('delete_message', (data) => {
          const { roomId } = data;
          io.in(roomId).emit('recall_message', data);
        });
        socket.on('disconnect', () => {});
      });      
  }
  
module.exports = configureSocketIO;