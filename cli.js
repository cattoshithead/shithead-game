const readline = require('readline');
const { Game } = require('./game');

/*
 * Simple command‑line interface to play a two‑player game of Shithead
 * against a very naive AI.  This script demonstrates how the core
 * Game logic can be used without any graphical user interface.  To play,
 * run `node cli.js` from the project root.  You will be prompted to
 * select cards to play or type `pickup` to take the pile.  The AI will
 * respond automatically by choosing the first valid card in its hand
 * each turn or picking up the pile if it has no playable cards.
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Instantiate a new Game with two players.  The Game constructor
// expects an array of player names.
const game = new Game(['You', 'AI']);

// Determine starting player and begin the game loop.
function start() {
  console.log('Welcome to Shithead!');
  showState();
  nextTurn();
}

// Display current top of pile, your hand and face‑up cards.
function showState() {
  console.log('\nTop of pile:', game.getTopCard() ? game.getTopCard().toString() : 'Empty');
  const human = game.players[0];
  const handList = human.hand.map((c, i) => `${i}: ${c.toString()}`).join(' | ');
  console.log('Your hand:', handList);
  console.log('Your face‑up:', human.faceUp.map(c => c.toString()).join(', '));
  console.log('Cards remaining in deck:', game.deck.cards.length);
}

// Proceed to the next player's turn.
function nextTurn() {
  if (game.isGameOver()) {
    announceWinner();
    rl.close();
    return;
  }
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (currentPlayer.name === 'You') {
    promptHuman();
  } else {
    playAI(currentPlayer);
    // after AI plays we immediately move to next turn
    setImmediate(() => {
      game.nextTurn();
      nextTurn();
    });
  }
}

// Prompt the human player for a move.
function promptHuman() {
  showState();
  rl.question('Select card index to play or type "pickup": ', answer => {
    const trimmed = answer.trim().toLowerCase();
    const player = game.players[0];
    if (trimmed === 'pickup') {
      game.pickUpPile(player);
      console.log('You picked up the pile.');
      game.nextTurn();
      nextTurn();
      return;
    }
    const index = parseInt(trimmed, 10);
    if (isNaN(index) || index < 0 || index >= player.hand.length) {
      console.log('Invalid input.');
      promptHuman();
      return;
    }
    const card = player.hand[index];
    if (!game.isMoveValid(player, card)) {
      console.log('That card cannot be played.');
      promptHuman();
      return;
    }
    // play the selected card
    game.playCards(player, [card], false);
    console.log('You played', card.toString());
    // Replenish hand if necessary
    game.drawUpTo(player);
    game.nextTurn();
    nextTurn();
  });
}

// Very naive AI: play first valid card or pick up pile.
function playAI(player) {
  // try to find a playable card in hand
  let played = false;
  for (const card of player.hand) {
    if (game.isMoveValid(player, card)) {
      game.playCards(player, [card], false);
      console.log('AI plays', card.toString());
      game.drawUpTo(player);
      played = true;
      break;
    }
  }
  if (!played) {
    game.pickUpPile(player);
    console.log('AI picks up the pile.');
  }
}

function announceWinner() {
  const winners = game.players.filter(p => p.finished);
  if (winners.length > 0) {
    console.log(`\n${winners[0].name} wins!`);
  } else {
    console.log('\nGame over, no winner.');
  }
}

start();
