/**
 * Slash command definitions for the STS2 bot.
 * Each command takes a single required string option: the name to look up.
 */

export const CARD_COMMAND = {
    name: "card",
    description: "Look up a Slay the Spire 2 card by name",
    options: [
        {
            type: 3, // STRING
            name: "name",
            description: "The card name to search for",
            required: true,
        },
    ],
};

export const RELIC_COMMAND = {
    name: "relic",
    description: "Look up a Slay the Spire 2 relic by name",
    options: [
        {
            type: 3,
            name: "name",
            description: "The relic name to search for",
            required: true,
        },
    ],
};

export const ANCIENT_COMMAND = {
    name: "ancient",
    description: "Look up a Slay the Spire 2 Ancient by name",
    options: [
        {
            type: 3,
            name: "name",
            description: "The Ancient name to search for",
            required: true,
        },
    ],
};

export const POTION_COMMAND = {
    name: "potion",
    description: "Look up a Slay the Spire 2 potion by name",
    options: [
        {
            type: 3,
            name: "name",
            description: "The potion name to search for",
            required: true,
        },
    ],
};

export const ALL_COMMANDS = [CARD_COMMAND, RELIC_COMMAND, ANCIENT_COMMAND, POTION_COMMAND];