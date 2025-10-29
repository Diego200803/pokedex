import { 
  View, 
  Text, 
  Image, 
  FlatList,
  TextInput, 
  ActivityIndicator, 
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
const { width } = Dimensions.get("window"); 
import { useEffect, useState, useRef } from 'react';
import { Pokemon } from '../types/Pokemon';
import { TYPE_COLORS, STAT_TRANSLATIONS } from '../constants/colors';

export default function Pokedex() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [searchNotFound, setSearchNotFound] = useState<boolean>(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPokemon();
  }, []);

  useEffect(() => {
    if (search === '') {
      setFilteredPokemon(pokemon);
      setSearchNotFound(false);
    } else {
      // Limpiar el # si el usuario lo incluye en la búsqueda
      const searchClean = search.replace('#', '');
      
      const filtered = pokemon.filter((p) => {
        const pokemonNumber = String(p.id).padStart(3, '0');
        
        return (
          p.name.toLowerCase().includes(searchClean.toLowerCase()) ||
          p.id.toString().includes(searchClean) ||
          pokemonNumber.includes(searchClean) ||
          p.types.some(type => type.type.name.toLowerCase().includes(searchClean.toLowerCase()))
        );
      });
      
      setFilteredPokemon(filtered);
      setSearchNotFound(filtered.length === 0);
    }
  }, [search, pokemon]);

  const fetchPokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await response.json();
      
      const pokemonDetails = await Promise.all(
        data.results.map(async (poke: { url: string }) => {
          const res = await fetch(poke.url);
          return await res.json();
        })
      );
      
      setPokemon(pokemonDetails);
      setFilteredPokemon(pokemonDetails);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      setError('Error al cargar los Pokémon. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const openPokemonDetail = (poke: Pokemon) => {
    setSelectedPokemon(poke);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedPokemon(null);
    });
  };

  const PokemonCard = ({ item }: { item: Pokemon }) => {
    const mainType = item.types[0].type.name;
    const colors = TYPE_COLORS[mainType] || TYPE_COLORS.normal;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.bg }]}
        onPress={() => openPokemonDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <Text style={styles.pokemonNumber}>
            #{String(item.id).padStart(3, '0')}
          </Text>
          
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.sprites.other['official-artwork'].front_default }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.pokemonName}>
            {item.name}
          </Text>
          
          <View style={styles.typesContainer}>
            {item.types.map((type) => (
              <View 
                key={type.type.name} 
                style={styles.typeBadge}
              >
                <Text style={styles.typeText}>
                  {type.type.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.miniStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>HP</Text>
              <Text style={styles.statValue}>
                {item.stats[0].base_stat}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>ATK</Text>
              <Text style={styles.statValue}>
                {item.stats[1].base_stat}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const PokemonDetailModal = () => {
    if (!selectedPokemon) return null;

    const mainType = selectedPokemon.types[0].type.name;
    const colors = TYPE_COLORS[mainType] || TYPE_COLORS.normal;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { backgroundColor: colors.bg, opacity: fadeAnim }
            ]}
          >
            <ScrollView>
              <TouchableOpacity 
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.modalHeader}>
                <Text style={styles.modalNumber}>
                  #{String(selectedPokemon.id).padStart(3, '0')}
                </Text>
                <Image
                  source={{ uri: selectedPokemon.sprites.other['official-artwork'].front_default }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalName}>
                  {selectedPokemon.name}
                </Text>
                
                <View style={styles.modalTypes}>
                  {selectedPokemon.types.map((type) => (
                    <View 
                      key={type.type.name}
                      style={styles.modalTypeBadge}
                    >
                      <Text style={styles.modalTypeText}>
                        {type.type.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Peso</Text>
                    <Text style={styles.infoValue}>
                      {(selectedPokemon.weight / 10).toFixed(1)} kg
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Altura</Text>
                    <Text style={styles.infoValue}>
                      {(selectedPokemon.height / 10).toFixed(1)} m
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>EXP Base</Text>
                    <Text style={styles.infoValue}>
                      {selectedPokemon.base_experience}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Habilidades</Text>
                <View style={styles.abilitiesContainer}>
                  {selectedPokemon.abilities.map((ability, index) => (
                    <View 
                      key={index}
                      style={[styles.abilityBadge, { backgroundColor: colors.light }]}
                    >
                      <Text style={styles.abilityText}>
                        {ability.ability.name.replace('-', ' ')}
                        {ability.is_hidden && ' (Oculta)'}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Estadísticas Base</Text>
                {selectedPokemon.stats.map((stat) => {
                  const percentage = (stat.base_stat / 255) * 100;
                  return (
                    <View key={stat.stat.name} style={styles.statContainer}>
                      <View style={styles.statHeader}>
                        <Text style={styles.statName}>
                          {STAT_TRANSLATIONS[stat.stat.name] || stat.stat.name}
                        </Text>
                        <Text style={styles.statNumber}>{stat.base_stat}</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View 
                          style={[
                            styles.progressBar,
                            { width: `${percentage}%`, backgroundColor: colors.bg }
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>
          Cargando Pokédex...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPokemon}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>
        <Text style={styles.subtitle}>
          {filteredPokemon.length} de {pokemon.length} Pokémon
        </Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, número o tipo..."
          value={search}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {searchNotFound ? (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundCode}>404</Text>
          <Text style={styles.notFoundTitle}>
            Pokémon no encontrado
          </Text>
          <Text style={styles.notFoundMessage}>
            No se encontraron resultados para "{search}"
          </Text>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearch('')}
          >
            <Text style={styles.clearButtonText}>Limpiar búsqueda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPokemon}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <PokemonCard item={item} />}
        />
      )}

      <PokemonDetailModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#DC2626',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    color: '#fff',
    fontSize: width < 380 ? 28 : 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: width < 380 ? 12 : 14,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: width < 380 ? 10 : 14,
    fontSize: width < 380 ? 14 : 16,
  },
  listContent: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 6,
    minWidth: width < 380 ? (width - 40) / 2 : 160,
    maxWidth: width / 2 - 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardContent: {
    padding: width < 380 ? 12 : 16,
  },
  pokemonNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width < 380 ? 10 : 12,
    marginBottom: 4,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width < 380 ? 80 : 112,
  },
  pokemonImage: {
    width: width < 380 ? 70 : 96,
    height: width < 380 ? 70 : 96,
  },
  pokemonName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width < 380 ? 14 : 18,
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: width < 380 ? 8 : 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  typeText: {
    color: '#fff',
    fontSize: width < 380 ? 10 : 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  miniStats: {
    marginTop: width < 380 ? 8 : 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: width < 380 ? 10 : 12,
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width < 380 ? 10 : 12,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notFoundCode: {
    color: '#fff',
    fontSize: width < 380 ? 72 : 96,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notFoundTitle: {
    color: '#fff',
    fontSize: width < 380 ? 20 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  notFoundMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: width < 380 ? 14 : 16,
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  modalNumber: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  modalImage: {
    width: width < 380 ? 150 : 192,
    height: width < 380 ? 150 : 192,
  },
  modalName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width < 380 ? 26 : 32,
    textTransform: 'capitalize',
    marginTop: 8,
  },
  modalTypes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  modalTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalTypeText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  abilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  abilityText: {
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  statContainer: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statName: {
    fontWeight: '600',
  },
  statNumber: {
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});