const http = require('http')
const app = require('./app')
// const socketIo = require('socket.io');
// const configureSocketIO = require('./configs/socket-old.config')
const {initSocket} = require('./configs/socket.config')

const normalizePort = (val) => {
	const port = parseInt(val, 10)

	if (isNaN(port)) {
		return val
	}
	if (port >= 0) {
		return port
	}
	return false
}
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

const errorHandler = (error) => {
	if (error.syscall !== 'listen') {
		throw error
	}
	const address = server.address()
	const bind =
		typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges.')
			process.exit(1)
		case 'EADDRINUSE':
			console.error(bind + ' is already in use.')
			process.exit(1)
		default:
			throw error
	}
}

const server = http.createServer(app)

// create socket.io instance and attach it to the global object and config
// global._io = socketIo(server);

// configureSocketIO(global._io);

initSocket(server)

server.on('error', errorHandler)
server.on('listening', () => {
	const address = server.address()
	const bind =
		typeof address === 'string' ? 'pipe ' + address : 'port ' + port
	console.log('Listening on ' + bind)
})

server.listen(port)

module.exports = server