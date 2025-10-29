import { View, StyleSheet } from 'react-native';
import Pokedex from './Pokedex';

export default function App() {
  return (
    <View style={styles.container}>
      <Pokedex />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EF4444', // Fondo rojo igual al de la pokédex
  },
});
