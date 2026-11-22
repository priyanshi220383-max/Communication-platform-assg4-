require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public')); // chat test page

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/notes'));

// ---- Socket.IO: JWT-secured handshake ----
io.use((socket, next) => {
  try {
    socket.user = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
    io.to(room).emit('system', `${socket.user.username} joined ${room}`);
  });

  socket.on('chatMessage', ({ room, message }) => {
    console.log(`[${room}] ${socket.user.username}: ${message}`);
    io.to(room).emit('chatMessage', {
      user: socket.user.username,
      message,
      time: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`)))
  .catch((err) => console.error('DB connection failed:', err.message));