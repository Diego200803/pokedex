import { TypeColors, StatTranslations } from '../types/Pokemon';

export const TYPE_COLORS: TypeColors = {
  normal: { bg: '#A8A878', light: '#C6C6A7' },
  fire: { bg: '#F08030', light: '#F5AC78' },
  water: { bg: '#6890F0', light: '#9DB7F5' },
  electric: { bg: '#F8D030', light: '#FAE078' },
  grass: { bg: '#78C850', light: '#A7DB8D' },
  ice: { bg: '#98D8D8', light: '#BCE6E6' },
  fighting: { bg: '#C03028', light: '#D67873' },
  poison: { bg: '#A040A0', light: '#C183C1' },
  ground: { bg: '#E0C068', light: '#EBD69D' },
  flying: { bg: '#A890F0', light: '#C6B7F5' },
  psychic: { bg: '#F85888', light: '#FA92B2' },
  bug: { bg: '#A8B820', light: '#C6D16E' },
  rock: { bg: '#B8A038', light: '#D1C17D' },
  ghost: { bg: '#705898', light: '#A292BC' },
  dragon: { bg: '#7038F8', light: '#A27DFA' },
  dark: { bg: '#705848', light: '#A29288' },
  steel: { bg: '#B8B8D0', light: '#D1D1E0' },
  fairy: { bg: '#EE99AC', light: '#F4BDC9' },
};

export const STAT_TRANSLATIONS: StatTranslations = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};