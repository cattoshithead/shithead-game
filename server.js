const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Game } = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory storage for game rooms and tournaments
const rooms = {};
const tournaments = {};

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('createRoom', ({ roomId, players }) => {
    const game = new Game(players);
    rooms[roomId] = { game, players };
    socket.join(roomId);
    io.to(roomId).emit('roomCreated', { roomId });
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (room) {
      room.players.push(playerName);
      socket.join(roomId);
      io.to(roomId).emit('playerJoined', { playerName });
    }
  });

  socket.on('makeMove', ({ roomId, playerIndex, move }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.game.players[playerIndex];
    // TODO: validate and apply move using game logic
    // After applying move, send updated state to clients
    io.to(roomId).emit('stateUpdate', { /* send serialized game state here */ });
  });

  socket.on('disconnect', () => {
  console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
