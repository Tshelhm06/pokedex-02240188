// Personalisation settings (change these to make the app yours).
export const OWNER_NAME = 'Tshering';
export const STUDENT_NUMBER = '02240188';

// Pokédex list starts at the last three digits of the student number
// (02240188 -> offset 188).
export const START_OFFSET = parseInt(STUDENT_NUMBER.slice(-3), 10);

export const PAGE_SIZE = 20;
export const MAX_TEAM = 6;

// The six base stats shown as bars.
export const STATS = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'special-attack', label: 'Sp. Atk' },
  { key: 'special-defense', label: 'Sp. Def' },
  { key: 'speed', label: 'Speed' },
];
