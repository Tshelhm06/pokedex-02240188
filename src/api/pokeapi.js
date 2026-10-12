
const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

// Fetch one batch of Pokémon and retrieve details for their artwork.
export async function fetchPokemonBatch(offset = 188, limit = 20) {
  const response = await fetch(
    `${BASE_URL}?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Could not load the Pokémon list.');
  }

  const data = await response.json();

  // The list endpoint gives names and URLs.
  // Fetch each Pokémon's details to get its ID, types, and artwork.
  const pokemon = await Promise.all(
    data.results.map(async (item) => {
      const detailResponse = await fetch(item.url);

      if (!detailResponse.ok) {
        throw new Error(`Could not load ${item.name}.`);
      }

      const detail = await detailResponse.json();

      return {
        id: detail.id,
        name: detail.name,
        image:
          detail.sprites.other?.['official-artwork']?.front_default ??
          detail.sprites.front_default,
        types: detail.types.map((type) => type.type.name),
      };
    })
  );

  return pokemon;
}