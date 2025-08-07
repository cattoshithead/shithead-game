import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity } from 'react-native';
import { Game } from './game';

/**
 * A simple React Native interface for playing a two player game of
 * Shithead against a very naive AI. When the user taps "Start Game"
 * a new Game instance is created with two named players. Cards in
 * the user's hand are displayed horizontally and may be tapped to
 * play them. After the user plays a card the AI will immediately
 * respond by playing its lowest card if possible. Status messages
 * describing the last moves are shown above the cards.
 */
export default function App() {
  const [status, setStatus] = useState('Welcome to Shithead!');
  const [game, setGame] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);

  /**
   * Helper to update the local hand state from the underlying Game
   * instance.  This reads the human player's current hand and copies
   * the array so that React will trigger a re-render.  We wrap this
   * logic in a function to avoid repeating it in multiple places.
   */
  const refreshHand = () => {
    if (!game) return;
    setPlayerHand([...game.players[0].hand]);
  };

  /**
   * Initialise a new game with two named players. The Game class now
   * accepts an array of names so the players will be identified as
   * "You" and "Computer". After creating the game we copy the human
   * player's starting hand into component state for rendering.
   */
  const startGame = () => {
    const newGame = new Game(['You', 'Computer']);
    setGame(newGame);
    // Copy the player's starting hand into state
    setPlayerHand([...newGame.players[0].hand]);
    setStatus('Game started. Your turn!');
  };

  /**
   * Attempt to play a card from the human player's hand. The card
   * object itself is passed in from the renderItem callback. If the
   * move is invalid an error will be caught and displayed. After the
   * human plays a card the AI responds if it is their turn. The
   * player's hand is updated from the Game instance after each turn.
   */
  const playCard = (card) => {
    if (!game) return;
    try {
      // Human plays the selected card
      const result = game.playTurn(game.players[0], [card]);
      // Update the human player's hand after playing
      refreshHand();
      let newStatus = result;
      // If it's now the computer's turn, have the AI take its turn
      handleAITurn(newStatus);
    } catch (err) {
      setStatus(err.message);
    }
  };

  /**
   * Handle the AI's turn.  If the current player after the human's move
   * is the AI, attempt to play the first playable card in its hand.  If
   * no cards are playable, the AI will pick up the pile.  The status
   * message passed in will be appended with the AI's action.  After the
   * AI finishes its turn the human player's hand is refreshed and the
   * status is updated.  If the game is over a final message is shown.
   *
   * @param {string} baseStatus Text describing the human player's move.
   */
  const handleAITurn = (baseStatus) => {
    if (!game) {
      setStatus(baseStatus);
      return;
    }
    let newStatus = baseStatus;
    // Continue AI turns while it's the AI's turn
    while (true) {
      const aiPlayer = game.players[game.currentPlayer];
      if (aiPlayer === game.players[0]) {
        // Back to the human player's turn
        break;
      }
      // Determine a playable card or pick up
      let played = false;
      for (const c of aiPlayer.hand) {
        if (game.isPlayable(c)) {
          const aiResult = game.playTurn(aiPlayer, [c]);
          newStatus += '\nAI: ' + aiResult;
          played = true;
          break;
        }
      }
      if (!played) {
        // AI picks up the pile
        const aiResult = game.playTurn(aiPlayer, []);
        newStatus += '\nAI: ' + aiResult;
      }
      // If game over after AI move break
      if (game.isGameOver()) {
        break;
      }
      // Check if AI gets another turn (e.g. burned pile or played 2)
      // If so, loop again; otherwise break when turn passes to next player
      if (game.players[game.currentPlayer] === game.players[0]) {
        break;
      }
    }
    // Refresh human's hand after AI turn
    refreshHand();
    // If the game has ended, announce the winner
    if (game.isGameOver()) {
      const winners = game.players.filter(p => p.finished);
      if (winners.length > 0) {
        newStatus += `\n${winners[0].name} wins!`;
      } else {
        newStatus += '\nGame over.';
      }
    }
    setStatus(newStatus);
  };

  /**
   * Allow the human player to pick up the pile voluntarily.  This
   * corresponds to passing their turn or being unable to play.  We
   * delegate to playTurn with an empty array to trigger the pick up
   * behaviour.  Afterwards the AI will take its turn if applicable.
   */
  const pickUp = () => {
    if (!game) return;
    const result = game.playTurn(game.players[0], []);
    refreshHand();
    let newStatus = result;
    handleAITurn(newStatus);
  };

  /**
   * Render an individual card as a touchable element. When tapped the
   * associated card is passed to playCard.
   */
  const renderCard = ({ item }) => (
    <TouchableOpacity onPress={() => playCard(item)} style={styles.card}>
      <Text>{item.toString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shithead</Text>
      <Text style={styles.status}>{status}</Text>
      {!game && (
        <Button title="Start Game" onPress={startGame} />
      )}
      {game && (
        <>
          {/* Display pile top, face up and face down info */}
          <View style={{ marginVertical: 10, alignItems: 'center' }}>
            <Text>Top of pile: {game.getTopCard() ? game.getTopCard().toString() : 'Empty'}</Text>
            <Text>Your face up: {game.players[0].faceUp.map(c => c.toString()).join(', ') || 'None'}</Text>
            <Text>Face down count: {game.players[0].faceDown.length}</Text>
            {/* Provide a button to pick up the pile */}
            <Button title="Pick up pile" onPress={pickUp} />
          </View>
          {/* Display the player's hand horizontally */}
          <FlatList
            data={playerHand}
            renderItem={renderCard}
            keyExtractor={(_, index) => index.toString()}
            horizontal
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  card: {
    padding: 10,
    marginRight: 5,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
});
