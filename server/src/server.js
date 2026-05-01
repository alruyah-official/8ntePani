require('dotenv').config();
require('./config/database');

const app = require('./app');
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Socket.io handlers
require('./sockets')(io);

const PORT = process.env.PORT;
console.log(`Server starting on port ${PORT}`);

server.listen(PORT, () => {
  console.log(`SkillHive server running on http://localhost:${PORT}`);
});

module.exports = { server, io };
