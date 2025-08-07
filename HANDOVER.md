# Handover Instructions

This file summarises the current state of the Shithead game project and provides instructions for how to continue the work.

## Current status

- Core game logic is implemented in `game.js` with support for custom house rules (2s wild/reset, 10 burns the pile, four-of-a-kind burn, 5s skip, 7s restrict, 8s transparent).
- - The new `server.js` file has been added with a complete Socket.IO server implementation supporting room creation, joining, move validation and state broadcasting.
- `App.js` has been updated to show the top of the pile, face-up cards, face-down counts and includes a "Pick up pile" button. The AI now plays multiple turns when able.
- `README.md` has been expanded with full installation and usage instructions for the CLI, React Native app and server.
- A simple command-line interface is available in `cli.js` to play against a naive AI.
- A React Native UI in `App.js` lets you play on mobile via Expo. It has been polished to display the pile top, your face-up cards, face-down count and includes a “Pick up pile” button. AI behaviour has been improved to play multiple turns if necessary and the UI announces the winner.
- A socket.io server (`server.js`) supports online multiplayer by creating and joining rooms, making moves and broadcasting state.

## Next steps

1. **Repository cleanup:** Delete duplicate files with commit messages in their names (`App.js Update App.js with full React Native game UI.` and `server.js
2. 2. **Replace `game.js`:** The current `game.js` file in the repository is outdated. Copy the improved version from your local development environment (see the latest `game.js` in this repository) and overwrite the GitHub file. This ensures support for custom rules, face-down/face-up cards, replenishing hands, and all card powers. After updating, adjust any imports accordingly.
   3. 3. **Local testing:** In the `shithead-game` folder run `npm install`, then `npx expo start` to launch the React Native app and verify the UI works as intended. Use the CLI via `node cli.js` to test the core logic in the terminal. Use the server by running `node server.js` and connecting clients via socket.io.
      4. 4. **Server testing:** Run `node server.js` and test creating/joining rooms and making moves using a socket.io client. Extend as needed for tournaments or persistence.
         5. 5. **Final polish:** Update the README with installation and usage instructions if needed. Improve AI strategy if desired. Add styling (colours, card borders) to the UI for a more polished look.Implement makeMove logic and add game state serialization`). Keep only `App.js` and `server.js`.
3. **Local testing:** In the `shithead-game` folder run `npm install`. Use `npx expo start` to launch the React Native app and verify the UI works as intended (start game, play cards, pick up pile, AI turns, win/loss detection). Use `node cli.js` to test the core logic in the terminal.
4. **Server testing:** Run `node server.js` and test creating/joining rooms and making moves using a socket.io client. Extend as needed for tournaments or persistence.
5. **Final polish:** Update the README with installation and usage instructions. Improve AI strategy if desired. Add styling (colours, card borders) to the UI for a more polished look.

With these steps completed, the game should be ready for release.
