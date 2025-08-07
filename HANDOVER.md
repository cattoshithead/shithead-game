# Handover Instructions

This file summarises the current state of the Shithead game project and provides instructions for how to continue the work.

## Current status

- Core game logic is implemented in `game.js` with support for custom house rules (2s wild/reset, 10 burns the pile, four-of-a-kind burn, 5s skip, 7s restrict, 8s transparent).
- A simple command-line interface is available in `cli.js` to play against a naive AI.
- A React Native UI in `App.js` lets you play on mobile via Expo. It has been polished to display the pile top, your face-up cards, face-down count and includes a “Pick up pile” button. AI behaviour has been improved to play multiple turns if necessary and the UI announces the winner.
- A socket.io server (`server.js`) supports online multiplayer by creating and joining rooms, making moves and broadcasting state.

## Next steps

1. **Repository cleanup:** Delete duplicate files with commit messages in their names (`App.js Update App.js with full React Native game UI.` and `server.js Implement makeMove logic and add game state serialization`). Keep only `App.js` and `server.js`.
2. **Local testing:** In the `shithead-game` folder run `npm install`. Use `npx expo start` to launch the React Native app and verify the UI works as intended (start game, play cards, pick up pile, AI turns, win/loss detection). Use `node cli.js` to test the core logic in the terminal.
3. **Server testing:** Run `node server.js` and test creating/joining rooms and making moves using a socket.io client. Extend as needed for tournaments or persistence.
4. **Final polish:** Update the README with installation and usage instructions. Improve AI strategy if desired. Add styling (colours, card borders) to the UI for a more polished look.

With these steps completed, the game should be ready for release.
