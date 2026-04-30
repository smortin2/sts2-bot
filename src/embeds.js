const FOOTER = { text: "Data from Spire Codex · spire-codex.com" };
const hasVal = v => v != null && v !== "";

function getCardMeta(rarity) {
    const map = {
        common: { abbr: "C", color: 0x95a5a6 },
        uncommon: { abbr: "U", color: 0x3498db },
        rare: { abbr: "R", color: 0xf1c40f },
        basic: { abbr: "B", color: 0x95a5a6 },
        starter: { abbr: "S", color: 0x95a5a6 },
        special: { abbr: "?", color: 0x9b59b6 },
        quest: { abbr: "Q", color: 0xe67e22 },
        curse: { abbr: "X", color: 0x9b59b6 },
    };
    return map[String(rarity || "").toLowerCase()] || { abbr: "?", color: 0x4e8df5 };
}

function getRelicMeta(rarity) {
    const map = {
        common: { abbr: "C", color: 0x95a5a6 },
        uncommon: { abbr: "U", color: 0x3498db },
        rare: { abbr: "R", color: 0xf1c40f },
        boss: { abbr: "B", color: 0xe74c3c }, // Added Boss just in case
        event: { abbr: "V", color: 0x9b59b6 },
        ancient: { abbr: "A", color: 0xe74c3c },
        shop: { abbr: "$", color: 0x2ecc71 },
        starter: { abbr: "S", color: 0x000000 },
    };
    // Strip " relic" suffix so "Rare Relic" properly matches "rare"
    const key = String(rarity || "").toLowerCase().replace(/\s+relic$/, "");
    return map[key] || { abbr: "?", color: 0xf5a623 };
}

function getPotionMeta(rarity) {
    const map = {
        common: { abbr: "C", color: 0x95a5a6 },
        uncommon: { abbr: "U", color: 0x3498db },
        rare: { abbr: "R", color: 0xf1c40f },
        special: { abbr: "S", color: 0x9b59b6 },
        event: { abbr: "S", color: 0x9b59b6 }, // Foul is 'Event', mapping to (S)
    };
    return map[String(rarity || "").toLowerCase()] || { abbr: "?", color: 0x2ecc71 };
}


export function cardEmbed(card) {
    if (!card) return null;
    const meta = getCardMeta(card.rarity);
    const fields = [];

    if (hasVal(card.cost) && card.cost !== -1) fields.push({ name: "Cost", value: String(card.cost), inline: true });
    if (hasVal(card.stars)) fields.push({ name: "Stars", value: String(card.stars), inline: true });
    if (hasVal(card.type)) fields.push({ name: "Type", value: String(card.type), inline: true });
    if (hasVal(card.character)) fields.push({ name: "Character", value: String(card.character), inline: true });

    const embed = {
        title: `${card.name} (${meta.abbr})`,
        description: card.description || "No description.",
        color: meta.color,
        fields,
        footer: FOOTER,
    };
    if (card.image_url) embed.thumbnail = { url: card.image_url };
    return embed;
}

export function relicEmbed(relic) {
    if (!relic) return null;
    const meta = getRelicMeta(relic.rarity);
    const fields = [];

    if (hasVal(relic.ancient)) {
        fields.push({ name: "Ancient", value: String(relic.ancient), inline: true });
    } else if (hasVal(relic.character)) {
        const charStr = String(relic.character);
        // Identify if it's an Ancient relic to rename the field
        const isAncient = String(relic.rarity || "").toLowerCase().includes("ancient");

        if (isAncient) {
            fields.push({ name: "Ancient", value: charStr, inline: true });
        } else if (charStr.toLowerCase() !== "shared") {
            // Hide if the pool is 'Shared'
            fields.push({ name: "Pool", value: charStr, inline: true });
        }
    }

    const embed = {
        title: `${relic.name} (${meta.abbr})`,
        description: relic.description || "No description.",
        color: meta.color,
        fields,
        footer: FOOTER,
    };
    if (relic.image_url) embed.thumbnail = { url: relic.image_url };
    return embed;
}

export function ancientEmbed(ancient) {
    if (!ancient) return null;
    const fields = [];

    // Merge Epithet directly into the title
    const title = ancient.epithet ? `${ancient.name}, ${ancient.epithet}` : ancient.name;

    if (ancient.relics?.length) fields.push({ name: "Relic Offerings", value: `• ${ancient.relics.join("\n• ")}`, inline: false });
    if (ancient.floors?.length) fields.push({ name: "Floor(s)", value: ancient.floors.join(", "), inline: true });

    const embed = {
        title,
        color: 0x9b59b6,
        fields,
        footer: FOOTER,
    };
    if (ancient.image_url) embed.thumbnail = { url: ancient.image_url };
    return embed;
}

export function potionEmbed(potion) {
    if (!potion) return null;
    const meta = getPotionMeta(potion.rarity);

    const embed = {
        title: `${potion.name} (${meta.abbr})`,
        description: potion.description || "No description.",
        color: meta.color,
        footer: FOOTER,
    };
    if (potion.image_url) embed.thumbnail = { url: potion.image_url };
    return embed;
}