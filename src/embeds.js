const RARITY_META = {
    common: { abbr: "C", color: 0x95a5a6 },
    uncommon: { abbr: "U", color: 0x3498db },
    rare: { abbr: "R", color: 0xf1c40f },
    basic: { abbr: "B", color: 0x95a5a6 },
    starter: { abbr: "S", color: 0x95a5a6 },
    special: { abbr: "?", color: 0x9b59b6 },
    quest: { abbr: "Q", color: 0xe67e22 },
    curse: { abbr: "X", color: 0x9b59b6 },
};

const FOOTER = {
    text: "Data from Spire Codex · spire-codex.com",
};

function rarityMeta(rarity, fallbackColor = 0x4e8df5) {
    const key = String(rarity ?? "").toLowerCase();
    return RARITY_META[key] ?? { abbr: "?", color: fallbackColor };
}

function hasValue(value) {
    return value !== null && value !== undefined && value !== "";
}

export function cardEmbed(card) {
    if (!card) return null;

    const meta = rarityMeta(card.rarity);
    const fields = [];

    if (hasValue(card.cost) && card.cost !== -1) {
        fields.push({
            name: "Cost",
            value: String(card.cost),
            inline: true,
        });
    }

    if (hasValue(card.stars)) {
        fields.push({
            name: "Stars",
            value: String(card.stars),
            inline: true,
        });
    }

    if (hasValue(card.type)) {
        fields.push({
            name: "Type",
            value: String(card.type),
            inline: true,
        });
    }

    if (hasValue(card.character)) {
        fields.push({
            name: "Character",
            value: String(card.character),
            inline: true,
        });
    }

    const embed = {
        title: `${card.name} (${meta.abbr})`,
        description: card.description || "No description.",
        color: meta.color,
        fields,
        footer: FOOTER,
    };

    if (card.image_url) {
        embed.thumbnail = { url: card.image_url };
    }

    return embed;
}

export function relicEmbed(relic) {
    if (!relic) return null;

    const meta = rarityMeta(relic.rarity, 0xf5a623);
    const fields = [];

    if (hasValue(relic.character)) {
        fields.push({
            name: "Pool",
            value: String(relic.character),
            inline: true,
        });
    }

    const embed = {
        title: relic.name,
        description: relic.description || "No description.",
        color: meta.color,
        fields,
        footer: FOOTER,
    };

    if (relic.image_url) {
        embed.thumbnail = { url: relic.image_url };
    }

    return embed;
}

export function ancientEmbed(ancient) {
    if (!ancient) return null;

    const fields = [];

    if (hasValue(ancient.epithet)) {
        fields.push({
            name: "Epithet",
            value: String(ancient.epithet),
            inline: false,
        });
    }

    if (Array.isArray(ancient.relics) && ancient.relics.length) {
        fields.push({
            name: "Relic Offerings",
            value: `• ${ancient.relics.join("\n• ")}`,
            inline: false,
        });
    }

    if (Array.isArray(ancient.floors) && ancient.floors.length) {
        fields.push({
            name: "Floor(s)",
            value: ancient.floors.join(", "),
            inline: true,
        });
    }

    const embed = {
        title: ancient.name,
        color: 0x9b59b6,
        fields,
        footer: FOOTER,
    };

    if (ancient.image_url) {
        embed.thumbnail = { url: ancient.image_url };
    }

    return embed;
}

export function potionEmbed(potion) {
    if (!potion) return null;

    const meta = rarityMeta(potion.rarity, 0x2ecc71);

    const embed = {
        title: potion.name,
        description: potion.description || "No description.",
        color: meta.color,
        footer: FOOTER,
    };

    if (potion.image_url) {
        embed.thumbnail = { url: potion.image_url };
    }

    return embed;
}