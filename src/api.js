const BASE = "https://spire-codex.com/api";
const ROOT = "https://spire-codex.com";

async function fetchJSON(path) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return res.json();
}

/**
 * Strip / convert STS2 inline formatting markers.
 *  - "NL"             -> newline
 *  - [color]x[/color] -> **x** (bold)
 *  - [E], [R], etc.   -> bracketless
 */
export function formatText(text) {
    if (!text) return "";
    return text
        .replace(/\s*NL\s*/g, "\n")
        .replace(/$$([a-zA-Z_]+)$$([\s\S]*?)$$\/\1$$/g, "**\$2**")
        .replace(/$$([^$$]+)\]/g, "\$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * Robust name match. Tries: exact → starts-with → contains → token-equals.
 * Token-equals handles names like "Vakuu, the Wanderer" matching "Vakuu".
 */
function bestMatch(items, query) {
    if (!items?.length) return null;
    const q = query.toLowerCase().trim();

    const lc = (i) => i.name?.toLowerCase() ?? "";

    return (
        items.find((i) => lc(i) === q) ??
        items.find((i) => lc(i).startsWith(q)) ??
        items.find((i) => lc(i).includes(q)) ??
        items.find((i) => lc(i).split(/[^a-z0-9]+/).includes(q)) ??
        null
    );
}

const imageUrl = (path) => (path ? (path.startsWith("http") ? path : `${ROOT}${path}`) : null);

// ---------------------------------------------------------------------------

export async function findCard(query) {
    const cards = await fetchJSON("/cards");
    const card = bestMatch(cards, query);
    if (!card) return null;

    // Append keywords to description, e.g. "...your Hand. Exhaust"
    let description = formatText(card.description ?? card.description_raw ?? "");
    const keywords = card.keywords ?? [];
    if (keywords.length) {
        const kwText = keywords
            .map((k) => (typeof k === "string" ? k : k.name ?? ""))
            .filter(Boolean)
            .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
            .join(". ");
        if (kwText) description = `${description.replace(/\.?\s*$/, ".")} ${kwText}`.trim();
    }

    return {
        name: card.name,
        cost: card.cost ?? "?",
        rarity: card.rarity ?? "Unknown",
        type: card.type ?? "",
        description,
        character: card.character ?? null,
        image_url: imageUrl(card.image),
    };
}

export async function findRelic(query) {
    const relics = await fetchJSON("/relics");
    const relic = bestMatch(relics, query);
    if (!relic) return null;

    return {
        name: relic.name,
        description: formatText(relic.description ?? ""),
        rarity: relic.rarity ?? null,
        character: relic.character ?? relic.pool ?? null,
        image_url: imageUrl(relic.image),
    };
}

export async function findAncient(query) {
    const ancients = await fetchJSON("/ancients");
    const ancient = bestMatch(ancients, query);
    if (!ancient) return null;

    return {
        name: ancient.name,
        epithet: ancient.epithet ?? null,
        relics: ancient.relics ?? ancient.relic_offerings ?? [],
        floors: ancient.floors ?? ancient.floor ?? null,
        image_url: imageUrl(ancient.image),
    };
}

export async function findPotion(query) {
    const potions = await fetchJSON("/potions");
    const potion = bestMatch(potions, query);
    if (!potion) return null;

    return {
        name: potion.name,
        description: formatText(potion.description ?? ""),
        rarity: potion.rarity ?? null,
        image_url: imageUrl(potion.image),
    };
}