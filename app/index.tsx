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
  },
});