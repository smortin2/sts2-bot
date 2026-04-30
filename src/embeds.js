/**
 * Discord embed builders for each entity type.
 * All functions return a Discord embed object (or null).
 *
 * Color key:
 *   Cards  – 0x4e8df5 (blue)
 *   Relics – 0xf5a623 (amber)
 *   Ancients – 0x9b59b6 (purple)
 *   Potions  – 0x2ecc71 (green)
 */

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export function cardEmbed(card) {
    if (!card) return null;

    const fields = [
        { name: "Cost", value: `${card.cost}`, inline: true },
        { name: "Rarity", value: card.rarity, inline: true },
    ];

    if (card.type) {
        fields.push({ name: "Type", value: card.type, inline: true });
    }

    if (card.character) {
        fields.push({ name: "Character", value: card.character, inline: true });
    }

    if (card.keywords?.length) {
        fields.push({ name: "Keywords", value: card.keywords.join(", "), inline: false });
    }

    const embed = {
        title: card.name,
        description: card.description,
        color: 0x4e8df5,
        fields,
        footer: { text: "Data from Spire Codex · spire-codex.com" },
    };

    if (card.image_url) {
        embed.thumbnail = { url: card.image_url };
    }

    return embed;
}

// ---------------------------------------------------------------------------
// Relics
// ---------------------------------------------------------------------------

export function relicEmbed(relic) {
    if (!relic) return null;

    const fields = [];

    if (relic.rarity) {
        fields.push({ name: "Rarity", value: relic.rarity, inline: true });
    }

    if (relic.character) {
        fields.push({ name: "Character / Pool", value: relic.character, inline: true });
    }

    const embed = {
        title: relic.name,
        description: relic.description,
        color: 0xf5a623,
        fields,
        footer: { text: "Data from Spire Codex · spire-codex.com" },
    };

    if (relic.image_url) {
        embed.thumbnail = { url: relic.image_url };
    }

    return embed;
}

// ---------------------------------------------------------------------------
// Ancients
// ---------------------------------------------------------------------------

export function ancientEmbed(ancient) {
    if (!ancient) return null;

    const fields = [];

    if (ancient.epithet) {
        fields.push({ name: "Epithet", value: ancient.epithet, inline: false });
    }

    if (ancient.relics?.length) {
        // Each relic might be a string or an object with a .name
        const relicNames = ancient.relics.map((r) => (typeof r === "string" ? r : r.name ?? r)).join("\n• ");
        fields.push({ name: "Relic Offerings", value: `• ${relicNames}`, inline: false });
    }

    if (ancient.floors) {
        const floorsStr = Array.isArray(ancient.floors)
            ? ancient.floors.join(", ")
            : `${ancient.floors}`;
        fields.push({ name: "Appears On Floor(s)", value: floorsStr, inline: true });
    }

    const embed = {
        title: ancient.name,
        color: 0x9b59b6,
        fields,
        footer: { text: "Data from Spire Codex · spire-codex.com" },
    };

    if (ancient.image_url) {
        embed.thumbnail = { url: ancient.image_url };
    }

    return embed;
}

// ---------------------------------------------------------------------------
// Potions
// ---------------------------------------------------------------------------

export function potionEmbed(potion) {
    if (!potion) return null;

    const fields = [];

    if (potion.rarity) {
        fields.push({ name: "Rarity", value: potion.rarity, inline: true });
    }

    const embed = {
        title: potion.name,
        description: potion.description,
        color: 0x2ecc71,
        fields,
        footer: { text: "Data from Spire Codex · spire-codex.com" },
    };

    if (potion.image_url) {
        embed.thumbnail = { url: potion.image_url };
    }

    return embed;
}