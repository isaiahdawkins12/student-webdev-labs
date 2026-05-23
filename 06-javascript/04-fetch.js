const pokemonColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#ea7ce8",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const POKEMON_COUNT = 25;
const API_URL = `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_COUNT}`;

const container = document.getElementById("pokemon-container");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("search-input");

let allPokemons = [];

function showLoader() {
  statusEl.innerHTML = `
    <img src="../images/loader.gif" alt="Loading" />
    <span>Fetching data...</span>
  `;
}

function clearStatus() {
  statusEl.innerHTML = "";
}

function showMessage(message) {
  statusEl.textContent = message;
}

function createCard(pokemon) {
  const card = document.createElement("article");
  card.className = "pokemon-card";

  const name = document.createElement("h2");
  name.className = "pokemon-name";
  name.textContent = pokemon.name;

  const img = document.createElement("img");
  img.src = pokemon.image;
  img.alt = pokemon.name;
  img.loading = "lazy";

  const types = document.createElement("div");
  types.className = "pokemon-types";
  pokemon.types.forEach((type) => {
    const pill = document.createElement("span");
    pill.className = "pokemon-type";
    pill.textContent = type;
    pill.style.backgroundColor = pokemonColors[type] || "#777";
    types.appendChild(pill);
  });

  card.append(name, img, types);
  return card;
}

function render(list) {
  container.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No Pokémon matched your search.";
    container.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach((pokemon) => fragment.appendChild(createCard(pokemon)));
  container.appendChild(fragment);
}

async function fetchPokemons() {
  showLoader();
  try {
    const listResponse = await fetch(API_URL);
    if (!listResponse.ok) throw new Error("Failed to fetch list");
    const listData = await listResponse.json();

    const details = await Promise.all(
      listData.results.map((p) => fetch(p.url).then((r) => r.json())),
    );

    allPokemons = details.map((p) => ({
      id: p.id,
      name: p.name,
      image:
        p.sprites.other?.["official-artwork"]?.front_default ||
        p.sprites.front_default,
      types: p.types.map((t) => t.type.name),
    }));

    clearStatus();
    render(allPokemons);
  } catch (error) {
    showMessage("Could not load Pokémon. Please try again later.");
    console.error(error);
  }
}

function handleSearch(event) {
  const query = event.target.value.trim().toLowerCase();
  if (!query) {
    render(allPokemons);
    return;
  }
  const filtered = allPokemons.filter(
    (pokemon) =>
      pokemon.name.toLowerCase().includes(query) ||
      pokemon.types.some((type) => type.toLowerCase().includes(query)),
  );
  render(filtered);
}

searchInput.addEventListener("input", handleSearch);
fetchPokemons();
