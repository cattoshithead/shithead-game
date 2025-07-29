import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity } from 'react-native';
import { Game } from './game';

export default function App() {
  const [status, setStatus] = useState('Welcome to Shithead!');
  const [game, setGame] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);

  const startGame = () => {
    const newGame = new Game(['you', 'computer']);
    setGame(newGame);
    // copy the player's starting hand
    setPlayerHand([...newGame.players[0].hand]);
    setStatus('Game started. Your turn!');
  };

  const playCard = (card) => {
    if (!game) return;
    try {
      // player plays the selected card
      const result = game.playTurn(game.players[0], [card]);
      // update player's hand after play
      setPlayerHand([...game.players[0].hand]);
      let newStatus = result;
      // simple AI: have the computer play its lowest card if it's their turn
      const ai = game.players[game.currentPlayer];
      if (ai !== game.players[0] && ai.hand.length > 0) {
        const aiCard = ai.hand[0];
        const aiResult = game.playTurn(ai, [aiCard]);
        newStatus += '\nAI: ' + aiResult;
      }
      setStatus(newStatus);
    } catch (err) {
      setStatus(err.message);
    }
  };

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
        <FlatList
          data={playerHand}
          renderItem={renderCard}
          keyExtractor={(_, index) => index.toString()}
          horizontal
        />
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
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
});
