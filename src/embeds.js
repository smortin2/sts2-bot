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

const rarityAbbr = (rarity) => {
    const map = { common: "C", uncommon: "U", rare: "R", basic: "B", starter: "S" };
    return map[rarity?.toLowerCase?.()] ?? "?";
};

export function cardEmbed(card) {
    if (!card) return null;

    // Change title format to "Name (Rarity)"
    const title = `${card.name} (${rarityAbbr(card.rarity)})`;

    const embed = {
        title: title,
        description: card.description,
        color: rarityColor(card.rarity),
        fields: [
            { name: "Cost", value: `${card.cost}`, inline: true },
            { name: "Type", value: card.type || "—", inline: true },
        ],
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