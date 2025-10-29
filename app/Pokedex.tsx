import { 
    View, 
    Text, 
    Image, 
    FlatList, 
    TextInput, 
    ActivityIndicator, 
    TouchableOpacity, 
    StyleSheet 
  } from 'react-native';
  import { useEffect, useState } from 'react';
  
  // Tipos
  interface PokemonType {
    type: {
      name: string;
    };
  }
  
  interface PokemonStat {
    base_stat: number;
    stat: {
      name: string;
    };
  }
  
  interface Pokemon {
    id: number;
    name: string;
    types: PokemonType[];
    sprites: {
      other: {
        'official-artwork': {
          front_default: string;
        };
      };
    };
    stats: PokemonStat[];
    height: number;
    weight: number;
  }
  
  type TypeColors = {
    [key: string]: string;
  };
  
  const TYPE_COLORS: TypeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  
  export default function Pokedex() {
    // Estados con useState
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
  
    // Efecto para cargar los Pokémon al montar el componente
    useEffect(() => {
      fetchPokemon();
    }, []);
  
    // Efecto para filtrar cuando cambia la búsqueda
    useEffect(() => {
      if (search === '') {
        setFilteredPokemon(pokemon);
      } else {
        const filtered = pokemon.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toString().includes(search) ||
          p.types.some(type => type.type.name.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredPokemon(filtered);
      }
    }, [search, pokemon]);
  
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener lista de Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        
        // Obtener detalles de cada Pokémon
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
  
    const PokemonCard = ({ item }: { item: Pokemon }) => {
      const mainType = item.types[0].type.name;
      const backgroundColor = TYPE_COLORS[mainType] || '#A8A878';
  
      return (
        <TouchableOpacity style={[styles.card, { backgroundColor }]}>
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
                <View key={type.type.name} style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {type.type.name}
                  </Text>
                </View>
              ))}
            </View>
  
            <View style={styles.statsContainer}>
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
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>DEF</Text>
                <Text style={styles.statValue}>
                  {item.stats[2].base_stat}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Peso</Text>
                <Text style={styles.statValue}>
                  {(item.weight / 10).toFixed(1)} kg
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchPokemon}>
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
  
        <FlatList
          data={filteredPokemon}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <PokemonCard item={item} />}
        />
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
      paddingTop: 48,
      paddingBottom: 16,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 14,
      marginBottom: 12,
    },
    searchInput: {
      backgroundColor: '#fff',
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
    },
    listContent: {
      padding: 8,
    },
    card: {
      flex: 1,
      margin: 8,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    cardContent: {
      padding: 16,
    },
    pokemonNumber: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
      marginBottom: 4,
    },
    imageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 112,
    },
    pokemonImage: {
      width: 96,
      height: 96,
    },
    pokemonName: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 18,
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
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginHorizontal: 2,
    },
    typeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    statsContainer: {
      marginTop: 12,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 2,
    },
    statLabel: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
    },
    statValue: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
    },
  });