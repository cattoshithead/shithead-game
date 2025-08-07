# Shithead Game

A cross platform implementation of the Shithead card game with custom house rules. Play against a basic AI in the terminal or on your phone, or host network games with a Node/Socket.IO server. Rules include special powers for 2s, 5s, 7s, 8s, 10s and four of a kind.

## Features

- Offline play against a simple AI (CLI or React Native)
- Supports custom house rules: 2 resets pile, 10 burns pile, 8s transparent, 7s restrict next card ≤7, 5s skip next player, four‑of‑a‑kind burns.
- React Native UI shows your hand, face‑up cards, face‑down count and top of pile; includes a pick‑up button.
- Socket.IO server for online multiplayer (room based).
- Extensible game logic to implement tournaments or improved AI.

## Installation

Clone this repository and install dependencies:

```
git clone https://github.com/cattoshithead/shithead-game.git
cd shithead-game
npm install
```

## Playing in the Terminal

A simple two‑player game can be played in your terminal against an AI:

```
node cli.js
```

You'll be shown your hand and the top of the pile. Type the index of the card(s) you wish to play or `pickup` to take the pile. The AI plays its lowest valid card each turn.

## Running the React Native App

The React Native UI uses Expo:

```
npm install
npx expo start
```

Scan the QR code with the Expo Go app on iOS/Android or run in an emulator. Press **Start Game** to begin. Tap a card to play it or use the **Pick up pile** button if you can't play. The status area shows both your and the AI's moves as well as the winner.

## Running the Server

To support online play, start the Socket.IO server:

```
node server.js
```

By default it listens on port 3000. Clients can emit `createRoom`, `joinRoom` and `makeMove` events. See `server.js` for details. You could deploy this to a hosting provider to enable multiplayer from the mobile app.

## Development Notes

- The core game logic is in `game.js`. It has no UI dependencies and can be used in any environment.
- The AI is intentionally simple – it plays the first playable card. You can improve this by sorting the hand or applying heuristics.
- The codebase includes duplicate files with commit messages in the filename. These should be deleted in a future cleanup.
