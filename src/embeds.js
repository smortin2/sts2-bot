const RARITY_COLORS = {
    common: 0x95a5a6,    // gray
    uncommon: 0x3498db,  // blue
    rare: 0xf1c40f,      // gold
    basic: 0x95a5a6,
    starter: 0x95a5a6,
    special: 0x9b59b6,   // purple fallback
};

const rarityColor = (rarity, fallback = 0x4e8df5) =>
    RARITY_COLORS[rarity?.toLowerCase?.()] ?? fallback;

const FOOTER = { text: "Data from Spire Codex · spire-codex.com" };

// ---------------------------------------------------------------------------

const RARITY_MAP = {
    common: { abbr: "C", color: 0x95a5a6 },
    uncommon: { abbr: "U", color: 0x3498db },
    rare: { abbr: "R", color: 0xf1c40f },
    basic: { abbr: "B", color: 0x95a5a6 },
    starter: { abbr: "S", color: 0x95a5a6 },
    curse: { abbr: "X", color: 0x9b59b6 },
    quest: { abbr: "Q", color: 0xe67e22 },
};

export function cardEmbed(card) {
    if (!card) return null;
    const r = RARITY_MAP[card.rarity?.toLowerCase?.()] ?? { abbr: "?", color: 0x4e8df5 };

    const fields = [];

    // Logic: Hide Cost if -1
    if (card.cost !== -1) {
        fields.push({ name: "Cost", value: `${card.cost}`, inline: true });
    }

    // Conditional Star cost
    if (card.stars) {
        fields.push({ name: "Stars", value: `${card.stars}`, inline: true });
    }

    fields.push({ name: "Type", value: card.type || "—", inline: true });

    const embed = {
        title: `${card.name} (${r.abbr})`,
        description: card.description,
        color: r.color,
        fields,
        footer: FOOTER,
    };
    if (card.image_url) embed.thumbnail = { url: card.image_url };
    return embed;
}

export function relicEmbed(relic) {
    if (!relic) return null;
    const title = relic.rarity ? `(${relic.rarity}) ${relic.name}` : relic.name;

    const embed = {
        title,
        description: relic.description,
        color: rarityColor(relic.rarity, 0xf5a623),
        footer: FOOTER,
    };
    if (relic.character) {
        embed.fields = [{ name: "Pool", value: relic.character, inline: true }];
    }
    if (relic.image_url) embed.thumbnail = { url: relic.image_url };
    return embed;
}

export function ancientEmbed(ancient) {
    if (!ancient) return null;

    const fields = [];
    if (ancient.epithet) {
        fields.push({ name: "Epithet", value: ancient.epithet, inline: false });
    }
    if (ancient.relics?.length) {
        const relicNames = ancient.relics
            .map((r) => (typeof r === "string" ? r : r.name ?? ""))
            .filter(Boolean)
            .join("\n• ");
        if (relicNames) {
            fields.push({ name: "Relic Offerings", value: `• ${relicNames}`, inline: false });
        }
    }
    if (ancient.floors) {
        const floorsStr = Array.isArray(ancient.floors) ? ancient.floors.join(", ") : `${ancient.floors}`;
        fields.push({ name: "Appears On Floor(s)", value: floorsStr, inline: true });
    }

    const embed = {
        title: ancient.name,
        color: 0x9b59b6,
        fields,
        footer: FOOTER,
    };
    if (ancient.image_url) embed.thumbnail = { url: ancient.image_url };
    return embed;
}

export function potionEmbed(potion) {
    if (!potion) return null;
    const title = potion.rarity ? `(${potion.rarity}) ${potion.name}` : potion.name;

    const embed = {
        title,
        description: potion.description,
        color: rarityColor(potion.rarity, 0x2ecc71),
        footer: FOOTER,
    };
    if (potion.image_url) embed.thumbnail = { url: potion.image_url };
    return embed;
}