const BASE = "https://spire-codex.com/api";
const ROOT = "https://spire-codex.com";

async function fetchJSON(path, params = {}) {
    const url = new URL(`${BASE}${path}`);

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, String(value));
        }
    }

    const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;
    return res.json();
}

function normalizeString(value) {
    return String(value ?? "").trim();
}

function normalizeName(value) {
    return normalizeString(value).toLowerCase();
}

function formatText(text) {
    if (!text) return "";
    return text.replace(/\[[^\]]*\]/g, "").trim();
}

function toImageUrl(value) {
    if (!value) return null;
    return value.startsWith("http") ? value : `${ROOT}${value}`;
}

function pickFirst(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return null;
}

function arrayify(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
}

function candidateNames(item, extraKeys = []) {
    const keys = [
        "name",
        "title",
        "display_name",
        "event_name",
        "label",
        "slug",
        "id",
        "epithet",
        ...extraKeys,
    ];

    return [...new Set(
        keys
            .map((key) => item?.[key])
            .filter(Boolean)
            .map((value) => normalizeString(value))
    )];
}

function scoreName(name, query) {
    const n = normalizeName(name);
    const q = normalizeName(query);

    if (!n || !q) return -1;
    if (n === q) return 100;
    if (n.startsWith(q)) return 80;
    if (n.includes(q)) return 60;

    const tokens = n.split(/[^a-z0-9]+/).filter(Boolean);
    if (tokens.includes(q)) return 50;

    return -1;
}

function bestMatch(items, query, extraKeys = []) {
    if (!Array.isArray(items) || !items.length) return null;

    let bestItem = null;
    let bestScore = -1;

    for (const item of items) {
        const names = candidateNames(item, extraKeys);
        for (const name of names) {
            const score = scoreName(name, query);
            if (score > bestScore) {
                bestScore = score;
                bestItem = item;
            }
        }
    }

    return bestItem;
}

function titleCase(value) {
    const s = normalizeString(value);
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildKeywordSuffix(keywords) {
    const list = arrayify(keywords)
        .map((k) => (typeof k === "string" ? k : pickFirst(k?.name, k?.title)))
        .map((k) => normalizeString(k))
        .filter(Boolean);

    if (!list.length) return "";

    return list.map((k) => `${titleCase(k)}.`).join(" ");
}

function buildCardDescription(card) {
    const baseDescription = formatText(
        pickFirst(card.description, card.description_raw, card.text, card.raw_text)
    );

    const keywordSuffix = buildKeywordSuffix(card.keywords);

    if (!keywordSuffix) return baseDescription;
    if (!baseDescription) return keywordSuffix;

    const separator = /[.!?]$/.test(baseDescription) ? " " : ". ";
    return `${baseDescription}${separator}${keywordSuffix}`.trim();
}

function normalizeCost(card) {
    if (card?.is_x_cost === true) return "X";
    const cost = pickFirst(card?.cost, card?.base_cost);
    return cost ?? null;
}

function normalizeStarCost(card) {
    if (card?.is_x_star_cost === true) return "X";
    return pickFirst(
        card?.star_cost,
        card?.stars,
        card?.starCost,
        card?.base_star_cost
    );
}

function hasStarCost(card) {
    if (card?.is_x_star_cost === true) return true;
    const stars = normalizeStarCost(card);
    return stars !== null && stars !== undefined && stars !== "";
}

function extractImage(item) {
    return toImageUrl(
        pickFirst(
            item?.image,
            item?.image_url,
            item?.icon,
            item?.icon_url,
            item?.portrait,
            item?.portrait_icon,
            item?.sprite
        )
    );
}

function extractAncientRelics(item) {
    const raw = pickFirst(
        item?.relics,
        item?.relic_offerings,
        item?.relic_choices,
        item?.offerings,
        item?.pool
    );

    return arrayify(raw)
        .map((entry) => {
            if (typeof entry === "string") return entry;
            return pickFirst(entry?.name, entry?.title, entry?.relic, entry?.id);
        })
        .map((name) => normalizeString(name))
        .filter(Boolean);
}

function extractFloors(item) {
    const direct = pickFirst(
        item?.floors,
        item?.floor,
        item?.floor_range,
        item?.floorRange,
        item?.appear_floors,
        item?.appears_on_floors,
        item?.appearsOnFloors
    );

    if (Array.isArray(direct)) {
        return direct.map(String);
    }

    if (typeof direct === "object" && direct !== null) {
        const min = pickFirst(direct.min, direct.start, direct.from);
        const max = pickFirst(direct.max, direct.end, direct.to);

        if (min !== null && max !== null) return [`${min}-${max}`];
        if (min !== null) return [String(min)];
    }

    if (direct !== null && direct !== undefined && direct !== "") {
        return [String(direct)];
    }

    return [];
}

function isAncientLike(item) {
    const typeBits = [
        item?.type,
        item?.event_type,
        item?.category,
        item?.kind,
        item?.subtype,
    ]
        .map((v) => normalizeName(v))
        .filter(Boolean);

    if (typeBits.some((v) => v.includes("ancient"))) return true;
    if (extractAncientRelics(item).length > 0) return true;

    return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function findCard(query) {
    let cards = await fetchJSON("/cards", { search: query });
    if (!Array.isArray(cards) || !cards.length) {
        cards = await fetchJSON("/cards");
    }

    const card = bestMatch(cards, query);
    if (!card) return null;

    return {
        name: pickFirst(card.name, card.title),
        cost: normalizeCost(card),
        stars: hasStarCost(card) ? normalizeStarCost(card) : null,
        rarity: pickFirst(card.rarity, "Unknown"),
        type: pickFirst(card.type, ""),
        description: buildCardDescription(card),
        character: pickFirst(card.character, card.color, null),
        image_url: extractImage(card),
    };
}

export async function findRelic(query) {
    let relics = await fetchJSON("/relics", { search: query });
    if (!Array.isArray(relics) || !relics.length) {
        relics = await fetchJSON("/relics");
    }

    const relic = bestMatch(relics, query);
    if (!relic) return null;

    return {
        name: pickFirst(relic.name, relic.title),
        description: formatText(
            pickFirst(relic.description, relic.description_raw, relic.text)
        ),
        rarity: pickFirst(relic.rarity, null),
        character: pickFirst(relic.character, relic.pool, null),
        image_url: extractImage(relic),
    };
}

export async function findAncient(query) {
    const candidateSets = [];

    const searchedAncients = await fetchJSON("/events", {
        type: "Ancient",
        search: query,
    });
    if (Array.isArray(searchedAncients) && searchedAncients.length) {
        candidateSets.push(searchedAncients);
    }

    const searchedEvents = await fetchJSON("/events", { search: query });
    if (Array.isArray(searchedEvents) && searchedEvents.length) {
        candidateSets.push(searchedEvents);
    }

    const allEvents = await fetchJSON("/events");
    if (Array.isArray(allEvents) && allEvents.length) {
        candidateSets.push(allEvents);
    }

    const candidates = candidateSets
        .flat()
        .filter(Boolean)
        .filter(isAncientLike);

    const ancient = bestMatch(candidates, query);
    if (!ancient) return null;

    return {
        name: pickFirst(ancient.name, ancient.title),
        epithet: pickFirst(ancient.epithet, ancient.subtitle, ancient.tagline, null),
        relics: extractAncientRelics(ancient),
        floors: extractFloors(ancient),
        image_url: extractImage(ancient),
    };
}

export async function findPotion(query) {
    let potions = await fetchJSON("/potions", { search: query });
    if (!Array.isArray(potions) || !potions.length) {
        potions = await fetchJSON("/potions");
    }

    const potion = bestMatch(potions, query);
    if (!potion) return null;

    return {
        name: pickFirst(potion.name, potion.title),
        description: formatText(
            pickFirst(potion.description, potion.description_raw, potion.text)
        ),
        rarity: pickFirst(potion.rarity, null),
        image_url: extractImage(potion),
    };
}