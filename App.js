import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Game } from './game';

export default function App() {
  const [status, setStatus] = React.useState('Welcome to Shithead!');

  const startGame = () => {
    // instantiate a new game using the shared game logic
    const game = new Game(['You', 'Computer']);
    setStatus('New game created. Gameplay UI not yet implemented.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shithead</Text>
      <Text style={styles.status}>{status}</Text>
      <Button title="Start Game" onPress={startGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  status: { fontSize: 16, marginVertical: 10 },
});
