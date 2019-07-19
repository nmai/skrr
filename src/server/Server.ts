import SocketIO from 'socket.io'
import Http from 'http'

const PORT = process.env.PORT || 3000
const http = Http.createServer().listen(PORT)
const io = SocketIO.listen(http)

io.on('connection', socket => {
  socket.on('disconnect', () => {
    console.log('disconnect')
  })
})