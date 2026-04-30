/**
 * Thin wrapper around the Spire Codex public API.
 * Docs: https://spire-codex.com/docs
 *
 * Every function fetches the full list for its entity type, then
 * performs a case-insensitive substring match on the name field.
 * The API is rate-limited to 60 req/min/IP and responses are
 * cached for 300s on the server side, so this is fine for a bot.
 */

const BASE = "https://spire-codex.com/api";

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

async function fetchJSON(path) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return res.json();
}

/**
 * Find the best match for `query` in `items` by comparing against
 * item.name (case-insensitive). Exact matches win; otherwise the
 * first item whose name contains the query wins.
 */
function bestMatch(items, query) {
    if (!items || !items.length) return null;
    const q = query.toLowerCase().trim();

    // Exact match first
    const exact = items.find((i) => i.name?.toLowerCase() === q);
    if (exact) return exact;

    // Substring / "starts with" match
    const startsWith = items.find((i) => i.name?.toLowerCase().startsWith(q));
    if (startsWith) return startsWith;

    // Contains
    const contains = items.find((i) => i.name?.toLowerCase().includes(q));
    return contains ?? null;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Look up a card by name.
 * Returns { name, cost, rarity, type, description, image_url } or null.
 */
export async function findCard(query) {
    const cards = await fetchJSON("/cards");
    if (!cards) return null;
    const card = bestMatch(cards, query);
    if (!card) return null;

    return {
        name: card.name,
        cost: card.cost ?? "?",
        rarity: card.rarity ?? "Unknown",
        type: card.type ?? "",
        description: card.description ?? card.description_raw ?? "No description.",
        character: card.character ?? null,
        image_url: card.image ? `${BASE.replace("/api", "")}${card.image}` : null,
        keywords: card.keywords ?? [],
    };
}

/**
 * Look up a relic by name.
 * Returns { name, description, rarity, image_url } or null.
 */
export async function findRelic(query) {
    const relics = await fetchJSON("/relics");
    if (!relics) return null;
    const relic = bestMatch(relics, query);
    if (!relic) return null;

    return {
        name: relic.name,
        description: relic.description ?? "No description.",
        rarity: relic.rarity ?? null,
        character: relic.character ?? relic.pool ?? null,
        image_url: relic.image ? `${BASE.replace("/api", "")}${relic.image}` : null,
    };
}

/**
 * Look up an ancient by name.
 * Returns { name, epithet, relics, floors, image_url } or null.
 */
export async function findAncient(query) {
    const ancients = await fetchJSON("/ancients");
    if (!ancients) return null;
    const ancient = bestMatch(ancients, query);
    if (!ancient) return null;

    return {
        name: ancient.name,
        epithet: ancient.epithet ?? null,
        relics: ancient.relics ?? ancient.relic_offerings ?? [],
        floors: ancient.floors ?? ancient.floor ?? null,
        image_url: ancient.image ? `${BASE.replace("/api", "")}${ancient.image}` : null,
    };
}

/**
 * Look up a potion by name.
 * Returns { name, description, rarity, image_url } or null.
 */
export async function findPotion(query) {
    const potions = await fetchJSON("/potions");
    if (!potions) return null;
    const potion = bestMatch(potions, query);
    if (!potion) return null;

    return {
        name: potion.name,
        description: potion.description ?? "No description.",
        rarity: potion.rarity ?? null,
        image_url: potion.image ? `${BASE.replace("/api", "")}${potion.image}` : null,
    };
}