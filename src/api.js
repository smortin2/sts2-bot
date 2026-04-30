import { pickFirst, arrayify, formatText, extractString, bestMatch } from "./helpers.js";

const BASE = "https://spire-codex.com/api";
const ROOT = "https://spire-codex.com";

async function fetchJSON(path, params = {}) {
    const url = new URL(`${BASE}${path}`);
    for (const [key, value] of Object.entries(params)) {
        if (value != null && value !== "") url.searchParams.set(key, String(value));
    }
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    return res.ok ? res.json() : null;
}

function extractImage(item) {
    const url = pickFirst(item?.image, item?.image_url, item?.icon, item?.icon_url, item?.portrait, item?.portrait_icon, item?.sprite);
    return url ? (url.startsWith("http") ? url : `${ROOT}${url}`) : null;
}

async function fetchAndMatch(path, query, filterFn = Boolean) {
    let items = await fetchJSON(path, { search: query });
    if (!items?.length) items = await fetchJSON(path);
    return bestMatch((items || []).filter(filterFn), query);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function findCard(query) {
    const card = await fetchAndMatch("/cards", query);
    if (!card) return null;

    const baseDesc = formatText(pickFirst(card.description, card.description_raw, card.text, card.raw_text));
    const keywords = arrayify(card.keywords)
        .map(k => extractString(k))
        .filter(Boolean)
        .map(k => {
            const s = String(k).trim();
            return s.charAt(0).toUpperCase() + s.slice(1) + ".";
        })
        .join(" ");

    const description = [baseDesc, keywords].filter(Boolean).join(/[.!?]$/.test(baseDesc) ? " " : ". ").trim();
    const cost = card.is_x_cost ? "X" : pickFirst(card.cost, card.base_cost);
    const stars = card.is_x_star_cost ? "X" : pickFirst(card.star_cost, card.stars, card.starCost, card.base_star_cost);

    return {
        name: pickFirst(card.name, card.title),
        cost: cost ?? null,
        stars: card.is_x_star_cost || stars != null ? stars : null,
        rarity: extractString(pickFirst(card.rarity, card.tier)) || "Unknown",
        type: extractString(pickFirst(card.type)) || "",
        description,
        character: extractString(pickFirst(card.character, card.color, card.pool)) || null,
        image_url: extractImage(card),
    };
}

export async function findRelic(query) {
    const relic = await fetchAndMatch("/relics", query);
    if (!relic) return null;

    return {
        name: pickFirst(relic.name, relic.title),
        description: formatText(pickFirst(relic.description, relic.description_raw, relic.text)),
        rarity: pickFirst(extractString(relic.rarity), extractString(relic.tier)) || null,
        character: extractString(pickFirst(relic.character, relic.pool)) || null,
        ancient: extractString(pickFirst(relic.ancient, relic.ancient_name, relic.event)) || null,
        image_url: extractImage(relic),
    };
}

export async function findAncient(query) {
    const extractAncientRelics = item => arrayify(pickFirst(item?.relics, item?.relic_offerings, item?.relic_choices, item?.offerings, item?.pool))
        .map(entry => extractString(entry))
        .filter(Boolean)
        .map(name => String(name).trim());

    const isAncientLike = item => {
        const types = [item?.type, item?.event_type, item?.category, item?.kind, item?.subtype]
            .filter(Boolean).map(v => String(v).toLowerCase());
        return types.some(v => v.includes("ancient")) || extractAncientRelics(item).length > 0;
    };

    const ancient = await fetchAndMatch("/events", query, isAncientLike);
    if (!ancient) return null;

    let floors = [];
    const rawFloors = pickFirst(ancient.floors, ancient.floor, ancient.floor_range, ancient.floorRange, ancient.appear_floors, ancient.appears_on_floors, ancient.appearsOnFloors);

    if (Array.isArray(rawFloors)) floors = rawFloors.map(String);
    else if (typeof rawFloors === "object" && rawFloors !== null) {
        const min = pickFirst(rawFloors.min, rawFloors.start, rawFloors.from);
        const max = pickFirst(rawFloors.max, rawFloors.end, rawFloors.to);
        if (min != null && max != null) floors = [`${min}-${max}`];
        else if (min != null) floors = [String(min)];
    } else if (rawFloors != null && rawFloors !== "") {
        floors = [String(rawFloors)];
    }

    // Resolve raw IDs to actual Relic names
    const rawRelics = extractAncientRelics(ancient);
    const resolvedRelics = await Promise.all(rawRelics.map(async (id) => {
        const relic = await findRelic(id);
        return relic ? relic.name : id; // Fall back to ID if lookup fails
    }));

    return {
        name: pickFirst(ancient.name, ancient.title),
        epithet: pickFirst(ancient.epithet, ancient.subtitle, ancient.tagline, null),
        relics: resolvedRelics, // Now contains properly cased names like 'Fiddle'
        floors,
        image_url: extractImage(ancient),
    };
}

export async function findPotion(query) {
    const potion = await fetchAndMatch("/potions", query);
    if (!potion) return null;

    return {
        name: pickFirst(potion.name, potion.title),
        description: formatText(pickFirst(potion.description, potion.description_raw, potion.text)),
        rarity: pickFirst(extractString(potion.rarity), extractString(potion.tier)) || null,
        image_url: extractImage(potion),
    };
}