// Tipos relacionados con Pokémon

export interface PokemonType {
    type: {
      name: string;
    };
  }
  
  export interface PokemonStat {
    base_stat: number;
    stat: {
      name: string;
    };
  }
  
  export interface PokemonAbility {
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }
  
  export interface Pokemon {
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
    abilities: PokemonAbility[];
    base_experience: number;
  }
  
  export type TypeColors = {
    [key: string]: { bg: string; light: string };
  };
  
  export type StatTranslations = {
    [key: string]: string;
  };