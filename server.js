const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Game } = require('./game');

const app = express();
const server = http.createServer(app);
// Allow CORS from any origin; in a real deployment you may want to
// restrict this to your own client origin(s)
const io = new Server(server, { cors: { origin: '*' } });

// In-memory storage for game rooms and tournaments. In a production
// environment you would likely want to persist this state in a database
// or other data store.
const rooms = {};
const tournaments = {};

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  // Handler for creating a new room. Expects a unique roomId and an array
  // of player names. A new Game instance is created and stored in the
  // rooms map. The creating socket joins the room and a notification is
  // emitted to all clients in the room.
  socket.on('createRoom', ({ roomId, players }) => {
    const game = new Game(players);
    rooms[roomId] = { game, players: [...players] };
    socket.join(roomId);
    io.to(roomId).emit('roomCreated', { roomId });
  });

  // Handler for a player joining an existing room. The player's name is
  // appended to the room's player list and a notification is emitted.
  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (room) {
      room.players.push(playerName);
      socket.join(roomId);
      io.to(roomId).emit('playerJoined', { playerName });
    }
  });

  // Handler for a move being made. The client sends the roomId, the
  // player index, and an array of card indices to play. The server
  // validates the current turn, converts indices to card objects and
  // executes the move via game.playTurn. Afterwards it constructs a
  // serialized representation of the game state and broadcasts it to
  // all clients in the room. Invalid moves result in an error event.
  socket.on('makeMove', ({ roomId, playerIndex, move }) => {
    const room = rooms[roomId];
    if (!room) return;
    const game = room.game;
    // Validate turn
    if (game.currentPlayer !== playerIndex) {
      socket.emit('invalidMove', { reason: 'Not your turn.' });
      return;
    }
    const player = game.players[playerIndex];
    try {
      // Convert indices to card objects
      const cardsToPlay = move.map(i => player.hand[i]);
      // Play the turn
      const status = game.playTurn(player, cardsToPlay);
      // Build serialized state
      const state = {
        currentPlayer: game.currentPlayer,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          hand: p.hand.map(c => c.toString()),
          faceUp: p.faceUp.map(c => c.toString()),
          faceDownCount: p.faceDown.length,
          finished: p.finished,
        })),
        pileTop: game.getTopCard() ? game.getTopCard().toString() : null,
        pileCount: game.pile.length,
        deckCount: game.deck.cards.length,
        status,
      };
      // Broadcast state
      io.to(roomId).emit('stateUpdate', state);
    } catch (err) {
      socket.emit('invalidMove', { reason: err.message || 'Invalid move.' });
    }
  });

  // Handle disconnections by simply logging. In the future you may
  // implement cleanup of rooms or tournaments here.
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
