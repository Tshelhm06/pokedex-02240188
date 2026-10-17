// All PokeAPI calls live in this file.
import { STATS } from '../config';

const BASE_URL = 'https://pokeapi.co/api/v2';
const TIMEOUT_MS = 12000;

// PokeAPI has 1025 regular Pokémon (ids 1-1025).
export const MAX_POKEMON = 1025;

export const artworkUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// Small wrapper around fetch: timeout + friendly error messages.
async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`The server answered with an error (${response.status}).`);
    }
    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The request took too long. Please try again.');
    }
    if (err instanceof TypeError) {
      throw new Error('Could not connect. Check your internet connection.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// "https://pokeapi.co/api/v2/pokemon/25/" -> 25
const idFromUrl = (url) => Number(url.match(/\/(\d+)\/?$/)[1]);

const toListItem = (item) => ({ id: idFromUrl(item.url), name: item.name });

// One page of the Pokédex (id + name only, the image comes from the id).
export async function fetchPokemonPage(offset, limit) {
  const safeLimit = Math.min(limit, MAX_POKEMON - offset);
  if (safeLimit <= 0) return [];

  const data = await getJson(
    `${BASE_URL}/pokemon?offset=${offset}&limit=${safeLimit}`
  );
  return data.results.map(toListItem);
}

// Every Pokémon name, used for search and for the game.
// The request is cached so it only happens once per app launch.
let allNamesPromise = null;

export function fetchAllNames() {
  if (!allNamesPromise) {
    allNamesPromise = getJson(`${BASE_URL}/pokemon?limit=${MAX_POKEMON}`)
      .then((data) => data.results.map(toListItem))
      .catch((err) => {
        allNamesPromise = null; // allow a retry after a failure
        throw err;
      });
  }
  return allNamesPromise;
}

// Full details of a single Pokémon.
export async function fetchPokemonDetail(idOrName) {
  const data = await getJson(`${BASE_URL}/pokemon/${idOrName}`);

  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites?.other?.['official-artwork']?.front_default ||
      artworkUrl(data.id),
    types: data.types.map((t) => t.type.name),
    height: data.height / 10, // decimetres -> metres
    weight: data.weight / 10, // hectograms -> kilograms
    stats: STATS.map((stat) => ({
      ...stat,
      value: data.stats.find((s) => s.stat.name === stat.key)?.base_stat ?? 0,
    })),
  };
}
